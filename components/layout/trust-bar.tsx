import { Lock, Plane, RotateCcw } from "lucide-react";

const items = [
  { icon: Lock, label: "Secure Payment" },
  { icon: Plane, label: "Worldwide Shipping" },
  { icon: RotateCcw, label: "Easy Returns" },
];

export function TrustBar() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-6 sm:flex-row sm:gap-12 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
