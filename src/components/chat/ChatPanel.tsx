"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, ChevronRight, X } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { createClient } from "@/lib/supabase/client";
import { formatProductPrice } from "@/lib/pricing";
import type { DbProduct } from "@/lib/db/products";
import {
  MAX_INPUT_LENGTH,
  buildFaqIndex,
  detectIntent,
  match,
  tokenize,
  type FaqEntry,
  type FaqIndex,
} from "@/lib/chat/matcher";
import {
  BOT_NAME,
  ERROR_REPLY,
  FALLBACK,
  WELCOME,
  faqReply,
  pincodeReply,
  runFlow,
  smallTalkReply,
  type BotReply,
  type Chip,
  type ChatLink,
  type Flow,
  type InputMode,
} from "@/lib/chat/flows";

type Message =
  | { id: number; from: "user"; text: string }
  | ({ id: number; from: "bot"; products?: DbProduct[] } & BotReply);

type FaqTreeResponse = {
  categories: { name: string; questions: { id: string; question: string; answer: string }[] }[];
};

const MAX_PRODUCT_RESULTS = 4;

async function searchProducts(query: string): Promise<DbProduct[]> {
  const run = async (q: string) => {
    const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("search failed");
    const data = await res.json();
    return (data.products || []) as DbProduct[];
  };

  let products = await run(query);
  // The search route substring-matches the whole query, so "hinge soft
  // close" misses "Soft Close Hinge". Retry once with the longest word.
  if (products.length === 0) {
    const longest = tokenize(query).sort((a, b) => b.length - a.length)[0];
    if (longest && longest.length >= 4 && longest !== query.toLowerCase()) {
      products = await run(longest);
    }
  }
  return products.slice(0, MAX_PRODUCT_RESULTS);
}

export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nextId = useRef(1);
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 0, from: "bot", ...WELCOME }]);
  const [mode, setMode] = useState<InputMode>("idle");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const faqIndex: FaqIndex | null = useMemo(
    () => (faqs.length > 0 ? buildFaqIndex(faqs) : null),
    [faqs]
  );
  const ctx = useMemo(() => ({ faqIndex, isSignedIn }), [faqIndex, isSignedIn]);

  // FAQs + auth state load once, on first open. Either failing only
  // degrades answers — menu flows and human contact keep working.
  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: FaqTreeResponse | null) => {
        if (!data) return;
        setFaqs(
          data.categories.flatMap((cat) =>
            cat.questions.map((q) => ({ ...q, category: cat.name }))
          )
        );
      })
      .catch(() => {});

    // getSession reads the local session only — fine here because it
    // just picks which link to show, it doesn't gate any data.
    createClient()
      .auth.getSession()
      .then(({ data }) => setIsSignedIn(Boolean(data.session)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text }]);
  const pushBot = (reply: BotReply, products?: DbProduct[]) =>
    setMessages((m) => [...m, { id: nextId.current++, from: "bot", ...reply, products }]);

  const doFlow = useCallback(
    (flow: Flow) => {
      const { reply, mode: nextMode } = runFlow(flow, ctx);
      pushBot(reply);
      setMode(nextMode);
    },
    [ctx]
  );

  const doProductSearch = async (query: string, fallbackOnEmpty: boolean) => {
    setBusy(true);
    try {
      const products = await searchProducts(query);
      if (products.length > 0) {
        pushBot(
          {
            text: `Here's what I found for "${query}":`,
            chips: [
              { label: "Search again", action: { kind: "flow", flow: "product" } },
              { label: "Main menu", action: { kind: "flow", flow: "menu" } },
            ],
          },
          products
        );
      } else if (fallbackOnEmpty) {
        pushBot(FALLBACK);
      } else {
        pushBot({
          text: `I couldn't find anything for "${query}". Try a shorter name or the item code, or browse the full range. Need large quantities or something specific? Send us a bulk enquiry.`,
          links: [
            { label: "Browse kitchen", href: "/kitchen" },
            { label: "Browse wardrobe", href: "/wardrobe" },
            { label: "Bulk enquiry", href: "/bulk-enquiry" },
          ],
          chips: [
            { label: "Search again", action: { kind: "flow", flow: "product" } },
            { label: "Main menu", action: { kind: "flow", flow: "menu" } },
          ],
        });
      }
    } catch {
      pushBot(fallbackOnEmpty ? FALLBACK : ERROR_REPLY);
    } finally {
      setBusy(false);
      setMode("idle");
    }
  };

  const handleText = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_INPUT_LENGTH);
    if (!text || busy) return;
    pushUser(text);
    setInput("");

    if (mode === "awaiting_pincode") {
      const compact = text.replace(/\s/g, "");
      if (/^\d+$/.test(compact)) {
        const { reply, mode: nextMode } = pincodeReply(compact);
        pushBot(reply);
        setMode(nextMode);
        return;
      }
    }

    if (mode === "awaiting_product") {
      // Let explicit navigation ("menu", "talk to a human") escape the
      // prompt; anything else is the search query.
      const intent = detectIntent(text);
      const escapes = intent?.type === "intent" && ["menu", "human", "track"].includes(intent.intent);
      if (!escapes) {
        const query = intent?.type === "intent" && intent.intent === "product" && intent.query ? intent.query : text;
        await doProductSearch(query, false);
        return;
      }
    }

    const result = match(text, faqIndex);
    switch (result.type) {
      case "pincode": {
        const { reply, mode: nextMode } = pincodeReply(result.pincode);
        pushBot(reply);
        setMode(nextMode);
        return;
      }
      case "intent": {
        const { intent } = result;
        if (intent === "greeting" || intent === "thanks" || intent === "bye") {
          pushBot(smallTalkReply(intent));
          setMode("idle");
        } else if (intent === "product") {
          if (result.query) await doProductSearch(result.query, false);
          else doFlow("product");
        } else {
          doFlow(intent);
        }
        return;
      }
      case "faq":
        pushBot(faqReply(result.faq, result.related));
        setMode("idle");
        return;
      case "none":
        // Short unmatched text is often a product name ("tandem box").
        if (tokenize(text).length > 0 && tokenize(text).length <= 4) {
          await doProductSearch(text, true);
        } else {
          pushBot(FALLBACK);
          setMode("idle");
        }
        return;
    }
  };

  const handleChip = (chip: Chip) => {
    if (busy) return;
    pushUser(chip.label);
    if (chip.action.kind === "flow") {
      doFlow(chip.action.flow);
    } else {
      const faqId = chip.action.faqId;
      const faq = faqs.find((f) => f.id === faqId);
      if (faq) {
        pushBot(faqReply(faq, []));
      } else {
        pushBot(FALLBACK);
      }
      setMode("idle");
    }
  };

  const lastBotId = [...messages].reverse().find((m) => m.from === "bot")?.id;

  return (
    <div
      role="dialog"
      aria-label={`Chat with ${BOT_NAME}`}
      hidden={!open}
      className="fixed z-45 inset-x-3 bottom-22 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-95 h-[min(36rem,calc(100dvh-8rem))] bg-surface-raised text-ink border border-line rounded-card shadow-[0_24px_64px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden origin-bottom-right animate-[dropdown_140ms_ease-out]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-surface">
        <div className="h-9 w-9 shrink-0 rounded-pill bg-gold text-on-gold flex items-center justify-center font-display font-semibold">
          R
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{BOT_NAME}</p>
          <p className="text-xs text-ink-muted leading-tight">Eryx assistant · instant answers</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="p-2 -mr-2 text-ink-muted hover:text-gold-deep transition-colors duration-200"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-raised"
      >
        {messages.map((msg) =>
          msg.from === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-card bg-gold text-on-gold px-3 py-2 text-sm whitespace-pre-line wrap-break-word">
                {msg.text}
              </p>
            </div>
          ) : (
            <BotBubble
              key={msg.id}
              message={msg}
              showChips={msg.id === lastBotId && !busy}
              onChip={handleChip}
              onNavigate={onClose}
            />
          )
        )}
        {busy && (
          <p className="text-sm text-ink-muted" aria-label={`${BOT_NAME} is typing`}>
            <span className="inline-block animate-pulse">Searching…</span>
          </p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleText(input);
        }}
        className="flex items-center gap-2 border-t border-line px-3 py-3 bg-surface"
      >
        <label htmlFor="ryx-input" className="sr-only">
          Message {BOT_NAME}
        </label>
        <input
          id="ryx-input"
          ref={inputRef}
          type="text"
          value={input}
          maxLength={MAX_INPUT_LENGTH}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "awaiting_pincode"
              ? "Enter 6-digit pincode"
              : mode === "awaiting_product"
                ? "Product name or code"
                : "Type your question…"
          }
          inputMode={mode === "awaiting_pincode" ? "numeric" : "text"}
          autoComplete="off"
          className="flex-1 min-w-0 bg-surface-raised border border-line rounded-control px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send message"
          className="h-9 w-9 shrink-0 rounded-control bg-gold text-on-gold flex items-center justify-center disabled:opacity-40 hover:bg-gold-bright transition-colors duration-200"
        >
          <ArrowUp size={18} aria-hidden />
        </button>
      </form>
    </div>
  );
}

function BotBubble({
  message,
  showChips,
  onChip,
  onNavigate,
}: {
  message: Extract<Message, { from: "bot" }>;
  showChips: boolean;
  onChip: (chip: Chip) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="max-w-[90%] rounded-card bg-surface-sunken px-3 py-2 text-sm whitespace-pre-line">
        {message.text}
      </p>

      {message.products && message.products.length > 0 && (
        <ul className="space-y-1.5">
          {message.products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/kitchen/${product.slug}`}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-control border border-line bg-surface p-2 hover:border-gold transition-colors duration-150"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
                  <ProductImage src={product.image} alt={product.name} fit="contain" className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:text-gold-deep">{product.name}</p>
                  <p className="text-xs text-ink-muted">{formatProductPrice(product)}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-ink-faint" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {message.links && message.links.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.links.map((link) => (
            <ReplyLink key={link.href} link={link} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {showChips && message.chips && message.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChip(chip)}
              className="rounded-pill border border-gold/50 bg-gold-tint px-3 py-1.5 text-xs font-medium text-ink hover:border-gold hover:text-gold-deep transition-colors duration-150 text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyLink({ link, onNavigate }: { link: ChatLink; onNavigate: () => void }) {
  const className =
    "inline-flex items-center gap-1 rounded-pill bg-surface border border-line px-3 py-1.5 text-xs font-medium text-gold-deep hover:border-gold transition-colors duration-150";
  if (link.external) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onNavigate} className={className}>
      {link.label}
    </Link>
  );
}
