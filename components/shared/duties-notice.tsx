import { TAX_NOTICE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DutiesNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {TAX_NOTICE}
    </p>
  );
}
