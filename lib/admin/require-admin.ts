import { UserRole } from "@prisma/client";

export async function requireAdmin() {
  const { auth } = await import("@/lib/auth");
  const session = await auth();

  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  return session.user;
}
