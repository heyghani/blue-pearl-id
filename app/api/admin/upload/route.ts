import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  getUploadStorageMode,
  getUploadUnavailableMessage,
  isVercelBlobConfigured,
  uploadProductImage,
} from "@/lib/storage/r2";
import {
  getMaxUploadBytesForMode,
  resolveAdminUpload,
  uploadFolderSchema,
} from "@/lib/validations/upload";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const mode = getUploadStorageMode();
  const available = mode !== "unavailable";

  return NextResponse.json({
    mode,
    available,
    useClientUpload: mode === "blob",
    maxBytes: getMaxUploadBytesForMode(mode),
    message: available ? null : getUploadUnavailableMessage(),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const file = formData.get("file");
  const folderValue = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image or video file to upload." }, { status: 400 });
  }

  const folderResult = uploadFolderSchema.safeParse(
    typeof folderValue === "string" ? folderValue : "products",
  );

  if (!folderResult.success) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  const mode = getUploadStorageMode();
  if (mode === "blob" && isVercelBlobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Use the browser upload flow for this environment. Refresh the page and try again.",
      },
      { status: 400 },
    );
  }

  const resolved = resolveAdminUpload(file, folderResult.data);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const maxBytes = getMaxUploadBytesForMode(mode);
  if (file.size > maxBytes) {
    const label = resolved.kind === "video" ? "Video" : "Image";
    return NextResponse.json(
      {
        error: `${label} must be ${Math.floor(maxBytes / (1024 * 1024))} MB or smaller.`,
      },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage({
      buffer,
      contentType: resolved.contentType,
      folder: folderResult.data,
    });

    return NextResponse.json({ url, storage: getUploadStorageMode() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
