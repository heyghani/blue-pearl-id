import { PrismaClient } from "@prisma/client";

import {
  createAdminUser,
  resetAdminPassword,
} from "../lib/services/admin/user.service";

const prisma = new PrismaClient();

function getFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) return undefined;
  return process.argv[index + 1];
}

function usage() {
  console.log(`Usage:
  npm run admin:create -- --email <email> --password <password> [--name "Admin"]
  npm run admin:password -- --email <email> --password <new-password>

Examples:
  npm run admin:create -- --email admin@primeluxr.com --password secret123 --name "Admin"
  npm run admin:password -- --email admin@primeluxr.com --password newpass123

Prefer the admin UI at /admin/settings when the app is running.`);
}

async function createAdmin() {
  const email = getFlag("--email")?.toLowerCase();
  const password = getFlag("--password");
  const name = getFlag("--name") ?? "Admin";

  if (!email || !password) {
    usage();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const user = await createAdminUser({ email, name, password });
  console.log(`Admin ready: ${user.email} (${user.name})`);
}

async function setPassword() {
  const email = getFlag("--email")?.toLowerCase();
  const password = getFlag("--password");

  if (!email || !password) {
    usage();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const result = await resetAdminPassword({
    targetUserId: user.id,
    newPassword: password,
  });

  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }

  console.log(`Password updated for ${email}`);
}

async function main() {
  const command = process.argv[2];

  if (command === "create") {
    await createAdmin();
    return;
  }

  if (command === "password") {
    await setPassword();
    return;
  }

  usage();
  process.exit(1);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
