import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

function ResetPasswordContent({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <AuthCard
      title="Reset password"
      description="Choose a new password for your account."
    >
      <ResetPasswordForm token={searchParams.token ?? ""} />
    </AuthCard>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <ResetPasswordContent searchParams={params} />
    </Suspense>
  );
}
