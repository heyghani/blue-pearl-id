import { cn } from "@/lib/utils";

export function AdminDataTable({
  children,
  empty,
  minWidthClassName = "min-w-[720px]",
  className,
}: {
  children: React.ReactNode;
  empty?: React.ReactNode;
  minWidthClassName?: string;
  className?: string;
}) {
  if (empty) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card shadow-sm",
          className,
        )}
      >
        {empty}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      <table className={cn("w-full text-left text-sm", minWidthClassName)}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b bg-muted/80 text-muted-foreground backdrop-blur">
      {children}
    </thead>
  );
}
