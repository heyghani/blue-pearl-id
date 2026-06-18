import Link from "next/link";
import type { Metadata } from "next";

import { verifyEmailAction } from "@/lib/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailAction(token) : { error: "Verification token is missing." };

  return (
    <AuthCard title="Email verification">
      {result.success ? (
        <div className="space-y-6">
          <Alert variant="success">
            <AlertDescription>{result.success}</AlertDescription>
          </Alert>
          <Button className="w-full" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
