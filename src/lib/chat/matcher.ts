// Ryx chat assistant — free-text understanding.
//
// Pure functions only (no React, no I/O) so this can be unit tested in
// isolation. Deliberately simple: synonym normalisation → a few narrow
// intent patterns → IDF-weighted keyword scoring over the FAQ list
// (a scaled-down BM25 idea sized for ~10–50 FAQs). No LLM, so it can
// only ever return text a human wrote.

export type Intent =
  | "greeting"
  | "thanks"
  | "bye"
  | "menu"
  | "human"
  | "track"
  | "payments"
  | "returns"
  | "business"
  | "pincode"
  | "product";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export type MatchResult =
  | { type: "pincode"; pincode: string }
  | { type: "intent"; intent: Intent; query?: string }
  | { type: "faq"; faq: FaqEntry; related: FaqEntry[] }
  | { type: "none" };

export const MAX_INPUT_LENGTH = 300;

// Phrase → canonical token. Applied to queries AND FAQ text so both
// sides speak the same vocabulary. Includes a few common Hinglish forms.
const SYNONYMS: [RegExp, string][] = [
  [/\bcash on delivery\b/g, "cod"],
  [/\b(guarantee|guaranty)\b/g, "warranty"],
  [/\b(shipping|shipment|courier|dispatch|dispatched)\b/g, "delivery"],
  [/\b(deliver|delivered|delivering)\b/g, "delivery"],
  [/\b(money back|paisa wapas|paise wapas)\b/g, "refund"],
  [/\b(kitne din|how many days|how long)\b/g, "delivery time"],
  [/\bkaha(n)? hai\b/g, "track"],
  [/\b(pay|paying|paid)\b/g, "payment"],
  [/\bpin code\b/g, "pincode"],
  [/\b(bill)\b/g, "invoice"],
];

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "be", "do", "does", "did",
  "i", "me", "you", "your", "we", "our", "us", "it", "its", "this", "that",
  "to", "of", "in", "on", "for", "with", "at", "by", "from", "and", "or",
  "what", "which", "how", "can", "could", "will", "would", "should", "any",
  "there", "have", "has", "please", "pls", "tell", "about", "want", "know",
  "get", "eryx", "hai", "kya", "ka", "ki", "ke", "me", "mein", "se", "ko",
]);

export function normalise(input: string): string {
  let text = input.slice(0, MAX_INPUT_LENGTH).toLowerCase();
  text = text.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  for (const [pattern, canonical] of SYNONYMS) {
    text = text.replace(pattern, canonical);
  }
  return text;
}

// Crude plural stripping so "hinges"/"hinge" and "returns"/"return"
// meet. Applied symmetrically, so imperfect stems still match.
function stem(token: string): string {
  return token.length > 3 && token.endsWith("s") && !token.endsWith("ss")
    ? token.slice(0, -1)
    : token;
}

export function tokenize(text: string): string[] {
  return normalise(text)
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t))
    .map(stem);
}

// Narrow on purpose: an intent should only fire when the user clearly
// asked for that flow. Anything looser falls through to FAQ scoring.
// Patterns run against the normalised (post-synonym) text.
const INTENT_PATTERNS: { intent: Intent; pattern: RegExp; short?: boolean }[] = [
  { intent: "greeting", pattern: /^(hi+|hello|hey|hola|namaste|good (morning|afternoon|evening))\b/, short: true },
  { intent: "thanks", pattern: /\b(thanks|thank you|thx|ty|shukriya|dhanyavad)\b/, short: true },
  { intent: "bye", pattern: /^(bye|goodbye|see you|ok bye)\b/, short: true },
  { intent: "menu", pattern: /^(menu|help|start|options|main menu|restart)$/ },
  { intent: "human", pattern: /\b(human|agent|real person|representative|customer care|talk to|speak to|call you|contact (you|number|details)|phone number|email address)\b/ },
  { intent: "track", pattern: /\b(track|tracking|order status|where is my order|my order)\b/ },
  { intent: "payments", pattern: /\b(cod|emi)\b/ },
  { intent: "returns", pattern: /\b(warranty|defect|defective|damaged|broken|replace|replacement|return|refund)\b/ },
  { intent: "business", pattern: /\b(bulk|wholesale|dealer|dealership|distributor|showroom|experience cent(re|er)|visit you|store address)\b/ },
  { intent: "pincode", pattern: /\b(pincode|postal code|delivery to|delivery in)\b/ },
];

// Words that mark a query as being about the service, not a product.
const SERVICE_WORDS = new Set([
  "invoice", "delivery", "payment", "upi", "card", "order", "account",
  "policy", "support", "help", "time", "safe", "material", "dimension",
]);

// "price of X", "do you have X" → product search for X.
const PRODUCT_TRIGGER =
  /^(?:what is the )?(?:price of|cost of|rate of|do you (?:have|sell)|looking for|search for|search|find|show me|i need)\s+(.+)$/;

export function detectIntent(input: string): MatchResult | null {
  const text = normalise(input);
  if (!text) return null;

  const pin = text.match(/\b(\d{6})\b/);
  if (pin) return { type: "pincode", pincode: pin[1] };

  // Named intents win over the product trigger: "do you have COD" is a
  // payments question, not a search for a product called "cod".
  const wordCount = text.split(" ").length;
  for (const { intent, pattern, short } of INTENT_PATTERNS) {
    if (short && wordCount > 4) continue;
    if (pattern.test(text)) return { type: "intent", intent };
  }

  const product = text.match(PRODUCT_TRIGGER);
  if (product) {
    const query = product[1].trim();
    // "I need an invoice" is a service question — leave it to the FAQs.
    const isServiceQuestion = tokenize(query).some((t) => SERVICE_WORDS.has(t));
    if (!isServiceQuestion) return { type: "intent", intent: "product", query };
  }
  return null;
}

type IndexedFaq = {
  faq: FaqEntry;
  questionTokens: Set<string>;
  bodyTokens: Set<string>;
};

export type FaqIndex = {
  docs: IndexedFaq[];
  idf: Map<string, number>;
};

export function buildFaqIndex(faqs: FaqEntry[]): FaqIndex {
  const docs = faqs.map((faq) => ({
    faq,
    questionTokens: new Set(tokenize(faq.question)),
    bodyTokens: new Set(tokenize(`${faq.answer} ${faq.category}`)),
  }));

  const df = new Map<string, number>();
  for (const doc of docs) {
    const all = new Set([...doc.questionTokens, ...doc.bodyTokens]);
    for (const t of all) df.set(t, (df.get(t) ?? 0) + 1);
  }

  const n = docs.length;
  const idf = new Map<string, number>();
  for (const [t, count] of df) idf.set(t, Math.log(1 + n / count));
  return { docs, idf };
}

// One rare word in a question (~idf 2.5 × 2) clears this easily; one
// common word that only appears in answers (~idf 1 × 1) does not.
const FAQ_SCORE_THRESHOLD = 2.0;

export function searchFaqs(input: string, index: FaqIndex): { faq: FaqEntry; score: number }[] {
  const queryTokens = new Set(tokenize(input));
  if (queryTokens.size === 0) return [];

  return index.docs
    .map((doc) => {
      let score = 0;
      for (const t of queryTokens) {
        const weight = index.idf.get(t) ?? 0;
        if (doc.questionTokens.has(t)) score += weight * 2;
        else if (doc.bodyTokens.has(t)) score += weight;
      }
      return { faq: doc.faq, score };
    })
    .filter((r) => r.score >= FAQ_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

export function bestFaqAnswer(input: string, index: FaqIndex | null): FaqEntry | null {
  if (!index) return null;
  return searchFaqs(input, index)[0]?.faq ?? null;
}

// Full pipeline for a free-text message.
export function match(input: string, index: FaqIndex | null): MatchResult {
  const intent = detectIntent(input);
  if (intent) return intent;

  if (index) {
    const hits = searchFaqs(input, index);
    if (hits.length > 0) {
      return {
        type: "faq",
        faq: hits[0].faq,
        related: hits.slice(1, 3).map((h) => h.faq),
      };
    }
  }
  return { type: "none" };
}
