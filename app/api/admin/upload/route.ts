import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getUploadStorageMode, uploadProductImage } from "@/lib/storage/r2";
import { uploadFolderSchema } from "@/lib/validations/upload";

export const runtime = "nodejs";

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
    return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  const folderResult = uploadFolderSchema.safeParse(
    typeof folderValue === "string" ? folderValue : "products",
  );

  if (!folderResult.success) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage({
      buffer,
      contentType: file.type || "application/octet-stream",
      folder: folderResult.data,
    });

    return NextResponse.json({ url, storage: getUploadStorageMode() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
