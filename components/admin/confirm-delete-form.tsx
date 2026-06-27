"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteForm({
  action,
  id,
  label,
  confirmMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
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
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="sm">
        {label}
      </Button>
    </form>
  );
}
