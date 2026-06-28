import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { requireCheckoutCartApi } from "@/lib/checkout/require-checkout-cart-api";
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  uploadFolderSchema,
} from "@/lib/validations/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cart = await requireCheckoutCartApi();
  if (!cart) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const [folder] = pathname.split("/");
        const folderResult = uploadFolderSchema.safeParse(folder);

        if (!folderResult.success || folderResult.data !== "orders") {
          throw new Error("Invalid upload folder.");
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_CONTENT_TYPES],
          maximumSizeInBytes: MAX_IMAGE_UPLOAD_BYTES,
          addRandomSuffix: false,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
