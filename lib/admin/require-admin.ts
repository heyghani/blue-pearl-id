import { UserRole } from "@prisma/client";

export async function requireAdmin() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  return session.user;
}
