import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  icon,
}: {
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={cn(className)}
      >
        {icon}
        Sign out
      </Button>
    </form>
  );
}
