"use client";

import { useActionState, useState } from "react";

import {
  removeAdminUserAction,
  resetAdminPasswordAction,
  type AdminActionState,
} from "@/lib/actions/admin/users";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminActionState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}

function ResetPasswordPanel({
  userId,
  email,
  onClose,
}: {
  userId: string;
  email: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    resetAdminPasswordAction,
    initialState,
  );

  return (
    <div className="mt-3 rounded-lg border bg-muted/30 p-4">
      <p className="text-sm font-medium">Reset password for {email}</p>
      <form action={formAction} className="mt-3 space-y-3">
        <input type="hidden" name="userId" value={userId} />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        {state.success ? (
          <Alert>
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`reset-password-${userId}`}>New password</Label>
            <Input
              id={`reset-password-${userId}`}
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`reset-confirm-${userId}`}>Confirm password</Label>
            <Input
              id={`reset-confirm-${userId}`}
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
            <FieldError messages={state.fieldErrors?.confirmPassword} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save new password"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function RemoveAdminButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(
    removeAdminUserAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      {state.error ? (
        <p className="mb-2 text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="mb-2 text-xs text-muted-foreground">{state.success}</p>
      ) : null}
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={(event) => {
          if (
            !window.confirm(
              `Remove admin access for ${email}? They will remain as a customer account.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        Remove access
      </Button>
    </form>
  );
}

export function AdminUsersTable({
  admins,
  currentUserId,
}: {
  admins: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
  }>;
  currentUserId: string;
}) {
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">Admin team</h2>
        <p className="text-sm text-muted-foreground">
          {admins.length} administrator{admins.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="divide-y">
        {admins.map((admin) => {
          const isSelf = admin.id === currentUserId;

          return (
            <div key={admin.id} className="px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{admin.name ?? "Admin"}</p>
                    {isSelf ? <Badge variant="secondary">You</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added {admin.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isSelf ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setResetUserId((current) =>
                            current === admin.id ? null : admin.id,
                          )
                        }
                      >
                        Reset password
                      </Button>
                      <RemoveAdminButton userId={admin.id} email={admin.email} />
                    </>
                  ) : null}
                </div>
              </div>

              {resetUserId === admin.id ? (
                <ResetPasswordPanel
                  userId={admin.id}
                  email={admin.email}
                  onClose={() => setResetUserId(null)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
