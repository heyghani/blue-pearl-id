"use client";

import { useActionState, useState } from "react";

import {
  createBrandAction,
  updateBrandAction,
  type AdminActionState,
} from "@/lib/actions/admin/brands";
import { ImageUploadField } from "@/components/admin/image-upload-field";
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

type BrandDefaults = {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

const initialState: AdminActionState = {};

export function BrandForm({
  brandId,
  defaults = {},
}: {
  brandId?: string;
  defaults?: BrandDefaults;
}) {
  const action = brandId
    ? updateBrandAction.bind(null, brandId)
    : createBrandAction;

  const [state, formAction, pending] = useActionState(action, initialState);
  const [isActive, setIsActive] = useState(defaults.isActive ?? true);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success ? (
        <Alert>
          <AlertDescription>Brand saved.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Brand details</CardTitle>
          <CardDescription>
            Brands appear on product cards, detail pages, and catalog filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={defaults.name} required />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={defaults.slug} required />
            {state.fieldErrors?.slug && (
              <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={defaults.sortOrder ?? 0}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={defaults.description ?? ""}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadField
            name="logoUrl"
            label="Brand logo"
            value={defaults.logoUrl}
            folder="brands"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="rounded border-input"
            />
            Active on storefront
          </label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : brandId ? "Save changes" : "Create brand"}
      </Button>
    </form>
  );
}
