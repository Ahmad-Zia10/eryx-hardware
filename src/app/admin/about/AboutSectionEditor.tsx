"use client";

import { useRef, useState } from "react";
import { saveAboutSection } from "@/app/admin/actions";
import RichTextEditor from "@/components/admin/RichTextEditor";

const EMPTY_TIPTAP_DOCUMENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

type Section = {
  id: string;
  section_key: string;
  title: string;
  content_json: any | null;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
};

export default function AboutSectionEditor({ section }: { section: Section }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    title: section.title,
    content_json: section.content_json || EMPTY_TIPTAP_DOCUMENT,
    image_url: section.image_url || "",
    display_order: section.display_order,
    is_visible: section.is_visible,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setMessage(null);
    try {
      const upload = new FormData();
      upload.append("file", file);
      upload.append("folder", "about");
      const response = await fetch("/api/admin/uploads", { method: "POST", body: upload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setFormData((current) => ({ ...current, image_url: data.url }));
    } catch (err: any) {
      setMessage(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const save = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await saveAboutSection(section.id, {
        ...formData,
        image_url: formData.image_url || null,
      });
      setMessage("Saved");
    } catch (err: any) {
      setMessage(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="border border-[#2A2A2A] bg-[#0A0A0A] rounded-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#D4A017]">{section.section_key}</p>
          <input
            value={formData.title}
            onChange={(event) => setFormData({ ...formData, title: event.target.value })}
            className="mt-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] px-3 py-2 rounded-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#D4D4D4]">
          <input
            type="checkbox"
            checked={formData.is_visible}
            onChange={(event) => setFormData({ ...formData, is_visible: event.target.checked })}
            className="accent-[#D4A017]"
          />
          Visible
        </label>
      </div>

      <RichTextEditor
        value={formData.content_json}
        onChange={(content_json) => setFormData({ ...formData, content_json })}
        placeholder="Write this section..."
        uploadFolder="about"
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
        <input
          value={formData.image_url}
          onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
          placeholder="Image URL"
          className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] px-3 py-2 rounded-sm"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-3 py-2 rounded-sm"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm text-[#9A9A9A]">
          Order
          <input
            type="number"
            value={formData.display_order}
            onChange={(event) => setFormData({ ...formData, display_order: Number(event.target.value) })}
            className="ml-3 w-24 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] px-3 py-2 rounded-sm"
          />
        </label>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs text-[#9A9A9A]">{message}</span>}
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Section"}
          </button>
        </div>
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
    </section>
  );
}
