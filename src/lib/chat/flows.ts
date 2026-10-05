// Ryx chat assistant — menu tree and every scripted line it can say.
//
// All copy lives here so it can be reviewed in one place. Contact
// details come from SITE_CONFIG / EXPERIENCE_CENTRE (never hardcoded),
// and policy answers prefer the admin-editable FAQ text when a matching
// FAQ exists, falling back to the scripted line otherwise.

import { EXPERIENCE_CENTRE, SITE_CONFIG, isServiceablePincode } from "@/constants";
import { bestFaqAnswer, type FaqEntry, type FaqIndex } from "@/lib/chat/matcher";

export const BOT_NAME = "Ryx";

export type Flow =
  | "menu"
  | "product"
  | "pincode"
  | "track"
  | "payments"
  | "returns"
  | "business"
  | "human";

export type ChatLink = { label: string; href: string; external?: boolean };

export type ChipAction =
  | { kind: "flow"; flow: Flow }
  | { kind: "faq"; faqId: string };

export type Chip = { label: string; action: ChipAction };

export type BotReply = {
  text: string;
  links?: ChatLink[];
  chips?: Chip[];
};

// What the next free-text message should be treated as.
export type InputMode = "idle" | "awaiting_product" | "awaiting_pincode";

export type FlowResult = { reply: BotReply; mode: InputMode };

export type FlowContext = {
  faqIndex: FaqIndex | null;
  isSignedIn: boolean;
};

export const MENU_CHIPS: Chip[] = [
  { label: "Find a product", action: { kind: "flow", flow: "product" } },
  { label: "Delivery to my pincode", action: { kind: "flow", flow: "pincode" } },
  { label: "Track my order", action: { kind: "flow", flow: "track" } },
  { label: "Payments", action: { kind: "flow", flow: "payments" } },
  { label: "Returns & warranty", action: { kind: "flow", flow: "returns" } },
  { label: "Bulk, dealer & showroom", action: { kind: "flow", flow: "business" } },
  { label: "Talk to a human", action: { kind: "flow", flow: "human" } },
];

const MENU_CHIP: Chip = { label: "Main menu", action: { kind: "flow", flow: "menu" } };
const HUMAN_CHIP: Chip = { label: "Talk to a human", action: { kind: "flow", flow: "human" } };

const phoneHref = `tel:+91${SITE_CONFIG.phone.replace(/\D/g, "")}`;
const weekdayHours = EXPERIENCE_CENTRE.hours[0];

const CONTACT_LINKS: ChatLink[] = [
  { label: `Call ${SITE_CONFIG.phone}`, href: phoneHref, external: true },
  { label: "Email us", href: `mailto:${SITE_CONFIG.email}`, external: true },
  { label: "Contact page", href: "/contact" },
];

const METRO_NAMES = "Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai and Pune";

export const WELCOME: BotReply = {
  text: `Hi, I'm ${BOT_NAME} 👋 I can help you find products, check delivery to your pincode, and answer questions about orders, payments and returns. What do you need?`,
  chips: MENU_CHIPS,
};

export const FALLBACK: BotReply = {
  text: "Sorry, I didn't quite get that. I'm a simple assistant and know a fixed set of topics. Pick one below, or reach our team directly.",
  chips: MENU_CHIPS,
};

export const ERROR_REPLY: BotReply = {
  text: "Something went wrong on my side. Please try again, or reach our team directly.",
  links: CONTACT_LINKS,
  chips: [MENU_CHIP],
};

function faqText(ctx: FlowContext, query: string, fallback: string): string {
  return bestFaqAnswer(query, ctx.faqIndex)?.answer ?? fallback;
}

export function runFlow(flow: Flow, ctx: FlowContext): FlowResult {
  switch (flow) {
    case "menu":
      return { reply: { text: "Sure, here's what I can help with:", chips: MENU_CHIPS }, mode: "idle" };

    case "product":
      return {
        reply: {
          text: "What are you looking for? Type a product name or item code, for example \"soft close hinge\" or \"tandem box\".",
          links: [
            { label: "Browse kitchen", href: "/kitchen" },
            { label: "Browse wardrobe", href: "/wardrobe" },
          ],
        },
        mode: "awaiting_product",
      };

    case "pincode":
      return {
        reply: { text: `We currently deliver to ${METRO_NAMES}. Type your 6-digit pincode and I'll check it.` },
        mode: "awaiting_pincode",
      };

    case "track":
      return {
        reply: {
          text: ctx.isSignedIn
            ? "You can see the status of every order under My Account. For dispatch updates or changes to an order, our team can help."
            : "Sign in to see the status of your orders under My Account. For dispatch updates or changes to an order, our team can help.",
          links: ctx.isSignedIn
            ? [{ label: "My orders", href: "/account" }]
            : [{ label: "Sign in", href: "/login?next=%2Faccount" }],
          chips: [HUMAN_CHIP, MENU_CHIP],
        },
        mode: "idle",
      };

    case "payments":
      return {
        reply: {
          text: faqText(
            ctx,
            "what payment methods do you accept",
            "We accept UPI, net banking and credit/debit cards through our secure Razorpay payment gateway. Cash on Delivery is not available at the moment."
          ) + "\n\nIf money was deducted but your order didn't go through, don't worry. Contact us with the payment details and we'll sort it out.",
          chips: [HUMAN_CHIP, MENU_CHIP],
        },
        mode: "idle",
      };

    case "returns":
      return {
        reply: {
          text: faqText(
            ctx,
            "what is the return policy",
            "We accept returns for manufacturing defects within 7 days of delivery. Please contact us with photographs of the issue."
          ) + "\n\nI can't start a return myself. For a delivered order, open it in My Account, or contact our team.",
          links: [
            { label: "Return policy", href: "/return-policy" },
            { label: "Refund policy", href: "/refund-policy" },
            { label: "My orders", href: ctx.isSignedIn ? "/account" : "/login?next=%2Faccount" },
          ],
          chips: [HUMAN_CHIP, MENU_CHIP],
        },
        mode: "idle",
      };

    case "business":
      return {
        reply: {
          text: `Buying in bulk, becoming a dealer, or want to see the products in person? Our ${EXPERIENCE_CENTRE.name} is at ${EXPERIENCE_CENTRE.addressLines.join(", ")}. Open ${weekdayHours.days}, ${weekdayHours.time}.`,
          links: [
            { label: "Bulk enquiry", href: "/bulk-enquiry" },
            { label: "Become a dealer", href: "/dealer-enquiry" },
            { label: "Visit the showroom", href: "/experience-centre" },
          ],
          chips: [MENU_CHIP],
        },
        mode: "idle",
      };

    case "human":
      return {
        reply: {
          text: `Our team is available ${weekdayHours.days}, ${weekdayHours.time}. Call or email us, or send a message from the contact page.`,
          links: CONTACT_LINKS,
          chips: [MENU_CHIP],
        },
        mode: "idle",
      };
  }
}

export function pincodeReply(pincode: string): FlowResult {
  if (!/^\d{6}$/.test(pincode)) {
    return {
      reply: { text: "That doesn't look like a pincode. Please enter all 6 digits, e.g. 560034." },
      mode: "awaiting_pincode",
    };
  }
  if (isServiceablePincode(pincode)) {
    return {
      reply: {
        text: `Good news, we deliver to ${pincode}. Delivery usually takes 5–7 business days.`,
        chips: [{ label: "Find a product", action: { kind: "flow", flow: "product" } }, MENU_CHIP],
      },
      mode: "idle",
    };
  }
  return {
    reply: {
      text: `${pincode} isn't in our standard delivery zone yet (we cover ${METRO_NAMES}). Contact us and our team will check whether we can arrange delivery.`,
      links: CONTACT_LINKS,
      chips: [MENU_CHIP],
    },
    mode: "idle",
  };
}

export function faqReply(faq: FaqEntry, related: FaqEntry[]): BotReply {
  return {
    text: faq.answer,
    chips: [
      ...related.map((r) => ({ label: r.question, action: { kind: "faq" as const, faqId: r.id } })),
      MENU_CHIP,
    ],
  };
}

export function smallTalkReply(intent: "greeting" | "thanks" | "bye"): BotReply {
  if (intent === "thanks") return { text: "Happy to help! Anything else?", chips: [MENU_CHIP] };
  if (intent === "bye") return { text: "Thanks for stopping by. Have a great day!" };
  return { text: `Hello! I'm ${BOT_NAME}. What can I help you with?`, chips: MENU_CHIPS };
}
