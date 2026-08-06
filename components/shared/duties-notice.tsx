import { cn } from "@/lib/utils";

export function DutiesNotice({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {message}
    </p>
  );
}
