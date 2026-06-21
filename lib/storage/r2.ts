import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {
  extensionForContentType,
  isAllowedImageContentType,
  MAX_IMAGE_UPLOAD_BYTES,
  type AllowedImageContentType,
  uploadFolderSchema,
} from "@/lib/validations/upload";

type UploadFolder = "products" | "variants";

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

export function isR2Configured() {
  return getR2Config() !== null;
}

function createR2Client(config: NonNullable<ReturnType<typeof getR2Config>>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function buildObjectKey(folder: UploadFolder, filename: string) {
  return `${folder}/${filename}`;
}

async function uploadToLocalPublic({
  buffer,
  folder,
  filename,
}: {
  buffer: Buffer;
  folder: UploadFolder;
  filename: string;
}) {
  const relativePath = path.join("uploads", folder, filename);
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return `/${relativePath.replace(/\\/g, "/")}`;
}

async function uploadToR2({
  buffer,
  contentType,
  folder,
  filename,
}: {
  buffer: Buffer;
  contentType: AllowedImageContentType;
  folder: UploadFolder;
  filename: string;
}) {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloud storage is not configured.");
  }

  const client = createR2Client(config);
  const key = buildObjectKey(folder, filename);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${config.publicUrl}/${key}`;
}

export async function uploadProductImage({
  buffer,
  contentType,
  folder,
}: {
  buffer: Buffer;
  contentType: string;
  folder: UploadFolder;
}) {
  const parsedFolder = uploadFolderSchema.parse(folder);

  if (!isAllowedImageContentType(contentType)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WebP, or GIF.");
  }

  if (buffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const extension = extensionForContentType(contentType);
  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  const filename = `${crypto.randomUUID()}.${extension}`;

  if (isR2Configured()) {
    return uploadToR2({ buffer, contentType, folder: parsedFolder, filename });
  }

  return uploadToLocalPublic({ buffer, folder: parsedFolder, filename });
}

export function getUploadStorageMode(): "r2" | "local" {
  return isR2Configured() ? "r2" : "local";
}
