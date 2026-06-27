import { Prisma } from "@prisma/client";

function uniqueFieldMessage(fields: string): string | null {
  if (fields.includes("slug")) {
    return "This slug is already in use. Choose a different one.";
  }
  if (fields.includes("sku")) {
    return "This SKU is already in use. Choose a different one.";
  }
  return null;
}

export function formatAdminError(error: unknown, fallback: string): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.join(", ")
        : typeof target === "string"
          ? target
          : "value";
      return uniqueFieldMessage(fields) ?? `A record with this ${fields} already exists.`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
