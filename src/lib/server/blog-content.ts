import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import sanitizeHtml from "sanitize-html";

const extensions = [
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),
  Image,
];

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

export function tiptapJsonToHtml(contentJson: any) {
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
