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

export async function tiptapJsonToHtml(contentJson: any) {
  const { generateHTML, extensions } = await createServerTiptapExtensions();
  const html = generateHTML(contentJson, extensions);
  return sanitizeHtml(html, sanitizeOptions);
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
