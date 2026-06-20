"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/services/email.service";
import {
  generateToken,
  PASSWORD_RESET_PREFIX,
  passwordResetExpiry,
  verificationExpiry,
} from "@/lib/tokens";
import {
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function validationError(
  fieldErrors: Record<string, string[]>,
): ActionState {
  return { fieldErrors };
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const token = generateToken();

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash,
      },
    });

    await tx.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: verificationExpiry(),
      },
    });
  });

  const emailResult = await sendVerificationEmail(email, token);
  if (!emailResult.ok) {
    return {
      error: "Account created but verification email could not be sent. Please contact support.",
    };
  }

  redirect("/login?registered=1");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    return {
      error:
        "Please verify your email before signing in. Check your inbox for the verification link.",
    };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/account";

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;

    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { error: "Invalid email or password." };
    }

    return { error: "Something went wrong. Please try again." };
  }

  return {};
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.deletedAt) {
    const token = generateToken();

    await prisma.verificationToken.deleteMany({
      where: { identifier: `${PASSWORD_RESET_PREFIX}${user.id}` },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: `${PASSWORD_RESET_PREFIX}${user.id}`,
        token,
        expires: passwordResetExpiry(),
      },
    });

    await sendPasswordResetEmail(email, token);
  }

  return {
    success:
      "If an account exists for that email, we've sent password reset instructions.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (
    !record ||
    !record.identifier.startsWith(PASSWORD_RESET_PREFIX) ||
    record.expires < new Date()
  ) {
    return { error: "This reset link is invalid or has expired." };
  }

  const userId = record.identifier.replace(PASSWORD_RESET_PREFIX, "");
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({ where: { token: parsed.data.token } }),
  ]);

  redirect("/login?reset=1");
}

export async function verifyEmailAction(token: string): Promise<ActionState> {
  if (!token) {
    return { error: "Verification token is missing." };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (
    !record ||
    record.identifier.startsWith(PASSWORD_RESET_PREFIX) ||
    record.expires < new Date()
  ) {
    return { error: "This verification link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { success: "Your email has been verified. You can now sign in." };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });

  return { success: "Profile updated successfully." };
}
