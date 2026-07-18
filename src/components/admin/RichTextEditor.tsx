"use client";

import { useCallback, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

type RichTextEditorProps = {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  uploadFolder?: "blog" | "about";
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`p-2 rounded-sm border transition duration-200 ${
        active
          ? "border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]"
          : "border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017]"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  uploadFolder = "blog",
}: RichTextEditorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Whitelist of tags the server-side Tiptap extension set can render.
  // Anything else in a paste gets unwrapped to its text content so the
  // save never fails on unknown nodes.
  const sanitizePastedHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Kill MSO conditionals, script/style, comments.
    doc.querySelectorAll("script, style, meta, link, [role='comment']").forEach(
      (n) => n.remove()
    );

    const allowedTags = new Set([
      "P", "BR", "STRONG", "B", "EM", "I", "U",
      "H1", "H2", "H3", "H4", "H5", "H6",
      "UL", "OL", "LI",
      "BLOCKQUOTE", "CODE", "PRE",
      "A", "IMG",
    ]);
    const allowedAttrs: Record<string, Set<string>> = {
      A: new Set(["href", "title"]),
      IMG: new Set(["src", "alt", "title"]),
    };

    const walk = (node: Element) => {
      // Iterate children first, then decide about the node itself, so
      // we can unwrap a disallowed parent without losing text children.
      Array.from(node.children).forEach(walk);

      if (!allowedTags.has(node.tagName)) {
        // Unwrap: replace this element with its child nodes.
        const parent = node.parentNode;
        if (parent) {
          while (node.firstChild) parent.insertBefore(node.firstChild, node);
          parent.removeChild(node);
        }
        return;
      }
      // Strip disallowed attributes.
      const allowedForTag = allowedAttrs[node.tagName] ?? new Set<string>();
      Array.from(node.attributes).forEach((attr) => {
        if (!allowedForTag.has(attr.name)) node.removeAttribute(attr.name);
      });
    };
    walk(doc.body);
    return doc.body.innerHTML;
  };

  const editor = useEditor({
    immediatelyRender: false,
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
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[280px] focus:outline-none text-sm text-[#F5F5F5]",
      },
      // Strip everything the server-side generateHTML doesn't understand
      // before it enters the doc. Prevents pasted Google Docs / Word HTML
      // (with MSO conditionals, custom classes, tables, style attrs) from
      // producing JSON that crashes the save action.
      transformPastedHTML: (html) => sanitizePastedHtml(html),
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", uploadFolder);

        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Image upload failed");
        }

        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } catch (err: any) {
        setError(err.message || "Image upload failed");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [editor, uploadFolder]
  );

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const previous = editor.getAttributes("link").href;
            const url = window.prompt("Enter URL", previous || "https://");
            if (url === null) return;
            if (!url) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton label={isUploading ? "Uploading image" : "Upload image"} disabled={isUploading} onClick={() => inputRef.current?.click()}>
          <ImagePlus size={16} />
        </ToolbarButton>
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </ToolbarButton>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-xs">
          {error}
        </div>
      )}

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-4 focus-within:border-[#D4A017] transition duration-200">
        <EditorContent editor={editor} />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadImage(file);
        }}
      />
    </div>
  );
}
