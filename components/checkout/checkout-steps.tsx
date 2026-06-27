"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "@/components/i18n/locale-provider";

export type CheckoutStepId = "information" | "shipping" | "payment";

export function CheckoutSteps({
  current,
  className,
}: {
  current: CheckoutStepId;
  className?: string;
}) {
  const t = useTranslations();
  const steps = [
    { id: "information" as const, label: t.checkout.stepInformation },
    { id: "shipping" as const, label: t.checkout.stepShipping },
    { id: "payment" as const, label: t.checkout.stepPayment },
  ];
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label={t.checkout.progressLabel} className={cn("mb-10", className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete && "bg-[var(--pearl)] text-white",
                    isCurrent && "border-2 border-[var(--pearl)] bg-background text-[var(--pearl)]",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                  )}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-6 h-0.5 flex-1 rounded-full",
                    isComplete ? "bg-[var(--pearl)]" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
