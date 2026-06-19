import { Lock, Plane, RotateCcw } from "lucide-react";

const items = [
  { icon: Lock, label: "Secure Payment" },
  { icon: Plane, label: "Worldwide Shipping" },
  { icon: RotateCcw, label: "Easy Returns" },
];

export function TrustBar() {
  return (
    <section className="border-y bg-[var(--pearl-light)]/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-7 sm:flex-row sm:gap-16 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-sm font-medium text-foreground/80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm">
              <Icon className="h-4 w-4 text-[var(--pearl)]" aria-hidden />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
