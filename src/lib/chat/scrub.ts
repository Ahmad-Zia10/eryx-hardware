// Strip personal data from free text before it is stored. Pure function,
// shared by the server route (authoritative) and safe to call anywhere.
//
// Order matters: emails and UUIDs first (they contain digits), then
// phone-like sequences, then any remaining long digit run (order
// numbers, account numbers). 6-digit pincodes are kept — they are not
// personal on their own and are useful for spotting delivery questions.

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
// 8+ digits, optionally with +, spaces, dashes, dots or brackets between.
const PHONE = /\+?\d[\d\s\-().]{6,}\d/g;
const LONG_DIGITS = /\d{7,}/g;

export function scrubPersonalData(text: string): string {
  return text
    .replace(EMAIL, "[email]")
    .replace(UUID, "[id]")
    .replace(PHONE, (match) => (match.replace(/\D/g, "").length >= 8 ? "[phone]" : match))
    .replace(LONG_DIGITS, "[number]");
}
