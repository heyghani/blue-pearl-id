"use client";

import { useActionState } from "react";

import {
  createProductAction,
  updateProductAction,
  type AdminActionState,
} from "@/lib/actions/admin/products";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = { id: string; name: string };

type ProductDefaults = {
  name?: string;
  slug?: string;
  sku?: string;
  price?: string;
  compareAtPrice?: string | null;
  categoryId?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  quantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

const initialState: AdminActionState = {};

export function ProductForm({
  categories,
  productId,
  defaults = {},
}: {
  categories: Category[];
  productId?: string;
  defaults?: ProductDefaults;
}) {
  const action = productId
    ? updateProductAction.bind(null, productId)
    : createProductAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={defaults.sku} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults.price}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Compare at price</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults.compareAtPrice ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Inventory quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            defaultValue={defaults.quantity ?? 0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaults.categoryId ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://..."
            defaultValue={defaults.imageUrl ?? ""}
          />
          <p className="text-xs text-muted-foreground">
            Paste an image URL for now. R2 upload support can be added later.
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Input
            id="shortDescription"
            name="shortDescription"
            defaultValue={defaults.shortDescription ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={defaults.description ?? ""}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaults.isActive ?? true}
            className="rounded border-input"
          />
          Active on storefront
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={defaults.isFeatured ?? false}
            className="rounded border-input"
          />
          Featured product
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
