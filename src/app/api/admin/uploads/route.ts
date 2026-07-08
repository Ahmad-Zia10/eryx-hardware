import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminUser } from "@/lib/server/admin";
import { UploadError, uploadSharedFile, validateUploadFile } from "@/lib/server/storage";

const FOLDERS = new Set(["blog", "about", "dealer", "support", "contact"]);

export async function POST(req: Request) {
  try {
    await requireAdminUser();

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");
    const kind = formData.get("kind");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (typeof folder !== "string" || !FOLDERS.has(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    validateUploadFile(file, {
      kind: kind === "image-or-pdf" ? "image-or-pdf" : "image",
      maxSizeMb: kind === "image-or-pdf" ? 8 : 5,
    });

    const upload = await uploadSharedFile(file, folder);
    return NextResponse.json({ url: upload.publicUrl, path: upload.path });
  } catch (error) {
    if (error instanceof AdminAuthError || error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Admin upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
