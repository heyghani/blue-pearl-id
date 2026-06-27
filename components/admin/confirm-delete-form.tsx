"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteForm({
  action,
  label,
  confirmMessage,
}: {
  action: () => void;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        {label}
      </Button>
    </form>
  );
}
