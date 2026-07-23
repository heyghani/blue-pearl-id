import { NextResponse } from "next/server";

import { requireCheckoutCartApi } from "@/lib/checkout/require-checkout-cart-api";
import {
  getUploadStorageMode,
  getUploadUnavailableMessage,
  isVercelBlobConfigured,
  uploadProductImage,
} from "@/lib/storage/r2";
import {
  getMaxUploadBytesForMode,
  resolveImageContentType,
  uploadFolderSchema,
} from "@/lib/validations/upload";

export const runtime = "nodejs";

export async function GET() {
  const cart = await requireCheckoutCartApi();
  if (!cart) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
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
  const cart = await requireCheckoutCartApi();
  if (!cart) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
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
    return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  const folderResult = uploadFolderSchema.safeParse(
    typeof folderValue === "string" ? folderValue : "orders",
  );

  if (!folderResult.success || folderResult.data !== "orders") {
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

  const contentType = resolveImageContentType(file);
  if (!contentType) {
    return NextResponse.json(
      {
        error:
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif")
            ? "HEIC photos are not supported. Choose a JPG/PNG image instead."
            : "Unsupported image type. Use JPG, PNG, WebP, or GIF.",
      },
      { status: 400 },
    );
  }

  const maxBytes = getMaxUploadBytesForMode(mode);
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: `Image must be ${Math.floor(maxBytes / (1024 * 1024))} MB or smaller.`,
      },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage({
      buffer,
      contentType,
      folder: folderResult.data,
    });

    return NextResponse.json({ url, storage: getUploadStorageMode() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
