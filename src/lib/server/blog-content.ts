import "server-only";

import sanitizeHtml from "sanitize-html";

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "pre", "code"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

async function createServerTiptapExtensions() {
  const [
    { generateHTML },
    { default: StarterKit },
    { default: Underline },
    { default: Link },
    { default: Image },
  ] = await Promise.all([
    import("@tiptap/html"),
    import("@tiptap/starter-kit"),
    import("@tiptap/extension-underline"),
    import("@tiptap/extension-link"),
    import("@tiptap/extension-image"),
  ]);

  return {
    generateHTML,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image,
    ],
  };
}

/**
 * Serialize a Tiptap ProseMirror doc to sanitized HTML.
 *
 * `generateHTML` throws hard if the JSON references node/mark types the
 * server-side extension set doesn't know about — which is exactly what
 * happens when someone pastes rich content (Google Docs, Word, a website)
 * that Tiptap's client-side paste handler was permissive enough to accept
 * but produces JSON we can't render server-side. Instead of letting that
 * crash the whole save (and lose the user's content), we catch, log, and
 * fall back to a plain-text extraction so the post saves and the author
 * can clean it up later.
 */
export async function tiptapJsonToHtml(contentJson: any) {
  const { generateHTML, extensions } = await createServerTiptapExtensions();
  try {
    const html = generateHTML(contentJson, extensions);
    return sanitizeHtml(html, sanitizeOptions);
  } catch (err) {
    console.error(
      "[tiptapJsonToHtml] generateHTML failed — falling back to text extraction.",
      err
    );
    const text = extractPlainText(contentJson);
    return sanitizeHtml(
      text
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join(""),
      sanitizeOptions
    );
  }
}

/**
 * Depth-first walk of a Tiptap doc that returns just the visible text.
 * Used as the fallback when generateHTML rejects a malformed doc.
 */
function extractPlainText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractPlainText).join("");
  if (node.type === "text" && typeof node.text === "string") return node.text;
  const inner = extractPlainText(node.content);
  const isBlock = node.type && node.type !== "text" && node.type !== "doc";
  return isBlock ? inner + "\n\n" : inner;
}

export function sanitizeStoredHtml(html: string) {
  return sanitizeHtml(html, sanitizeOptions);
}

export function emptyTiptapDocument() {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}
