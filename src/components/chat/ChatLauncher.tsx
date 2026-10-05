"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

// The panel (flows, matcher, FAQ fetch) is only downloaded after the
// first click, so the launcher adds almost nothing to page load.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

// Kill switch: set NEXT_PUBLIC_CHATBOT_ENABLED=false and redeploy.
const ENABLED = process.env.NEXT_PUBLIC_CHATBOT_ENABLED !== "false";

// Kept out of the purchase path so it never covers the Pay button or
// distracts mid-checkout.
const HIDDEN_PREFIXES = ["/checkout", "/cart"];

export default function ChatLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Mount the panel on first open, then keep it mounted (just hidden)
  // so the conversation survives closing and page navigation.
  const [loaded, setLoaded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!ENABLED) return null;

  const hiddenHere = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const toggle = () => {
    setLoaded(true);
    setOpen((o) => !o);
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={hiddenHere ? "hidden" : undefined}>
      {loaded && <ChatPanel open={open && !hiddenHere} onClose={close} />}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close chat with Ryx" : "Chat with Ryx"}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-45 h-14 w-14 rounded-pill bg-gold text-on-gold flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:bg-gold-bright transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
      >
        {open ? <X size={24} aria-hidden /> : <MessageCircle size={24} aria-hidden />}
      </button>
    </div>
  );
}
