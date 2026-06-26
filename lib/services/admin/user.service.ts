import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";

export async function listAdminUsers() {
  return prisma.user.findMany({
    where: {
      role: UserRole.ADMIN,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function countAdminUsers() {
  return prisma.user.count({
    where: {
      role: UserRole.ADMIN,
      deletedAt: null,
    },
  });
}

export async function createAdminUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name,
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: new Date(),
      deletedAt: null,
    },
    create: {
      email: normalizedEmail,
      name,
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function changeAdminPassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, role: true, deletedAt: true },
  });

  if (!user?.passwordHash || user.deletedAt || user.role !== UserRole.ADMIN) {
    return { ok: false as const, error: "Account not found." };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false as const, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { ok: true as const };
}

export async function resetAdminPassword({
  targetUserId,
  newPassword,
}: {
  targetUserId: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, deletedAt: true },
  });

  if (!user || user.deletedAt || user.role !== UserRole.ADMIN) {
    return { ok: false as const, error: "Admin account not found." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: targetUserId },
    data: { passwordHash },
  });

  return { ok: true as const };
}

export async function removeAdminUser({
  targetUserId,
  actorUserId,
}: {
  targetUserId: string;
  actorUserId: string;
}) {
  if (targetUserId === actorUserId) {
    return { ok: false as const, error: "You cannot remove your own admin access." };
  }

  const adminCount = await countAdminUsers();
  if (adminCount <= 1) {
    return { ok: false as const, error: "At least one admin account must remain." };
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, deletedAt: true },
  });

  if (!user || user.deletedAt || user.role !== UserRole.ADMIN) {
    return { ok: false as const, error: "Admin account not found." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: UserRole.CUSTOMER },
  });

  return { ok: true as const };
}
