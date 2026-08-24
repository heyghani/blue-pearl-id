"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteForm({
  action,
  id,
  label,
  confirmMessage,
  hiddenFields,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  confirmMessage: string;
  hiddenFields?: Record<string, string>;
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
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <Button type="submit" variant="destructive" size="sm">
        {label}
      </Button>
    </form>
  );
}
