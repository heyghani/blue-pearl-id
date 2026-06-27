"use client";

import { useActionState, useState } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
  type AdminActionState,
} from "@/lib/actions/admin/categories";
import { useAdminActionRedirect } from "@/components/admin/use-admin-action-redirect";
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

type ParentCategory = { id: string; name: string; slug: string };

type CategoryDefaults = {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

const initialState: AdminActionState = {};

export function CategoryForm({
  categoryId,
  parentCategories,
  defaults = {},
}: {
  categoryId?: string;
  parentCategories: ParentCategory[];
  defaults?: CategoryDefaults;
}) {
  const action = categoryId
    ? updateCategoryAction.bind(null, categoryId)
    : createCategoryAction;

  const [state, formAction, pending] = useActionState(action, initialState);
  useAdminActionRedirect(state);
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
          <AlertDescription>Category saved.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
          <CardDescription>
            Top-level categories appear in the storefront sidebar. Sub-categories appear as
            filter tabs.
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
            <Label htmlFor="parentId">Parent category</Label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={defaults.parentId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">None (top-level)</option>
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
          <CardTitle>Image</CardTitle>
          <CardDescription>Optional category image for future storefront use.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploadField
            name="imageUrl"
            label="Category image"
            value={defaults.imageUrl}
            folder="categories"
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
        {pending ? "Saving…" : categoryId ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}
