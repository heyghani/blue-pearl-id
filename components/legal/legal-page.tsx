import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Button variant="link" className="mb-6 h-auto p-0 text-muted-foreground" asChild>
        <Link href="/">← Back to store</Link>
      </Button>

      <header className="border-b pb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {APP_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-muted-foreground">{description}</p>
        ) : null}
        <p className="mt-4 text-xs text-muted-foreground">
          Last updated: June 2026
        </p>
      </header>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:pt-2 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
