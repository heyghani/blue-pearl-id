"use client";

import { useActionState } from "react";

import {
  createAdminUserAction,
  type AdminActionState,
} from "@/lib/actions/admin/users";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminActionState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(
    createAdminUserAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add admin user</CardTitle>
        <CardDescription>
          Create a new administrator who can sign in and manage the store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full name</Label>
              <Input id="admin-name" name="name" required autoComplete="name" />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <FieldError messages={state.fieldErrors?.email} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
              <FieldError messages={state.fieldErrors?.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">Confirm password</Label>
              <Input
                id="admin-confirm-password"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
              />
              <FieldError messages={state.fieldErrors?.confirmPassword} />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create admin account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
