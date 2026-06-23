"use client";

import { useActionState, useState } from "react";

import {
  createProductAction,
  updateProductAction,
  type AdminActionState,
} from "@/lib/actions/admin/products";
import { ProductVariantsEditor } from "@/components/admin/product-variants-editor";
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
import type { ProductOptionInput, ProductVariantInput } from "@/lib/products/variants";

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
  hasVariants?: boolean;
  options?: ProductOptionInput[];
  variants?: ProductVariantInput[];
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
  const [baseSku, setBaseSku] = useState(defaults.sku ?? "");
  const [basePrice, setBasePrice] = useState(Number(defaults.price ?? 0) || 0);
  const [isActive, setIsActive] = useState(defaults.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(defaults.isFeatured ?? false);

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success ? (
        <Alert>
          <AlertDescription>Product saved.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Name, slug, and category shown on the storefront.</CardDescription>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>Primary product image used in catalog and product detail.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploadField
            name="imageUrl"
            label="Primary image"
            value={defaults.imageUrl}
            folder="products"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & inventory</CardTitle>
          <CardDescription>
            For simple products, set price and stock here. Variant products use per-variant stock.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">Base SKU</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={defaults.sku}
              required
              onChange={(event) => setBaseSku(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Base price (USD)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaults.price}
              required
              onChange={(event) => setBasePrice(Number(event.target.value) || 0)}
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
            />
            <p className="text-xs text-muted-foreground">
              Used for simple products only. Variant stock is managed below.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            Add options such as color, size, or shoe size for products with multiple sellable combinations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductVariantsEditor
            baseSku={baseSku}
            basePrice={basePrice}
            initialState={{
              hasVariants: defaults.hasVariants,
              options: defaults.options,
              variants: defaults.variants,
            }}
            fieldError={state.fieldErrors?.variantsPayload?.[0]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
          <input type="hidden" name="isFeatured" value={isFeatured ? "true" : "false"} />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="rounded border-input"
            />
            Active on storefront
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="rounded border-input"
            />
            Featured product
          </label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
