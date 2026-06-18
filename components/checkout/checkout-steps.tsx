import { cn } from "@/lib/utils";

const steps = [
  { id: "information", label: "Information", href: "/checkout/information" },
  { id: "shipping", label: "Shipping", href: "/checkout/shipping" },
  { id: "payment", label: "Payment", href: "/checkout/payment" },
] as const;

export type CheckoutStepId = (typeof steps)[number]["id"];

export function CheckoutSteps({
  current,
  className,
}: {
  current: CheckoutStepId;
  className?: string;
}) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Checkout progress" className={cn("mb-8", className)}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "border-2 border-primary text-primary",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mb-5 h-px flex-1",
                    isComplete ? "bg-primary" : "bg-border",
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
