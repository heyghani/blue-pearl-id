"use client";

import { useActionState, useState } from "react";

import {
  createProductAction,
  updateProductAction,
  type AdminActionState,
} from "@/lib/actions/admin/products";
import { generateBaseSkuFromName } from "@/lib/slug";
import { useAdminActionRedirect } from "@/components/admin/use-admin-action-redirect";
import { useAutoSlug } from "@/components/admin/use-auto-slug";
import { ProductVariantsEditor } from "@/components/admin/product-variants-editor";
import { ProductImagesField } from "@/components/admin/product-images-field";
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
import {
  deriveVariantDefaultQuantity,
  type ProductOptionInput,
  type ProductVariantInput,
} from "@/lib/products/variants";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type ProductDefaults = {
  name?: string;
  slug?: string;
  sku?: string;
  price?: string;
  compareAtPrice?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  tags?: string[];
  shortDescription?: string | null;
  description?: string | null;
  imageUrls?: string[];
  quantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  hasVariants?: boolean;
  options?: ProductOptionInput[];
  variants?: ProductVariantInput[];
};

const initialState: AdminActionState = {};

const DEFAULT_PRODUCT_DESCRIPTION =
  "For more styles, please feel free to contact customer service";

const DEFAULT_BASE_PRICE = 120;
const DEFAULT_COMPARE_AT_PRICE = 888;
const DEFAULT_INVENTORY_QUANTITY = 99;

export function ProductForm({
  categories,
  brands,
  productId,
  defaults = {},
}: {
  categories: Category[];
  brands: Brand[];
  productId?: string;
  defaults?: ProductDefaults;
}) {
  const action = productId
    ? updateProductAction.bind(null, productId)
    : createProductAction;

  const isNewProduct = !productId;
  const [state, formAction, pending] = useActionState(action, initialState);
  useAdminActionRedirect(state);
  const { slug, handleNameChange: handleSlugFromName, handleSlugChange } = useAutoSlug(
    defaults.slug,
    isNewProduct,
  );
  const [baseSku, setBaseSku] = useState(defaults.sku ?? "");
  const [skuManual, setSkuManual] = useState(Boolean(defaults.sku));
  const [basePrice, setBasePrice] = useState(
    Number(defaults.price ?? (isNewProduct ? DEFAULT_BASE_PRICE : 0)) || 0,
  );
  const [inventoryQuantity, setInventoryQuantity] = useState(() => {
    if (defaults.hasVariants && defaults.variants?.length) {
      return deriveVariantDefaultQuantity(
        defaults.variants,
        defaults.quantity ?? DEFAULT_INVENTORY_QUANTITY,
      );
    }
    return defaults.quantity ?? (isNewProduct ? DEFAULT_INVENTORY_QUANTITY : 0);
  });
  const [isActive, setIsActive] = useState(defaults.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(defaults.isFeatured ?? false);
  const [imagesUploading, setImagesUploading] = useState(false);

  function handleNameChange(name: string) {
    handleSlugFromName(name);

    if (!isNewProduct || skuManual) return;
    setBaseSku(generateBaseSkuFromName(name));
  }

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
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name}
              required
              onChange={(event) => handleNameChange(event.target.value)}
            />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from name. Edit manually if needed.
            </p>
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
            <p className="text-xs text-muted-foreground">
              Manage categories in{" "}
              <a href="/admin/categories" className="underline">
                Categories
              </a>
              .
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <select
              id="brandId"
              name="brandId"
              defaultValue={defaults.brandId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Manage brands in{" "}
              <a href="/admin/brands" className="underline">
                Brands
              </a>
              .
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tags">Variety tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={defaults.tags?.join(", ") ?? ""}
              placeholder="Breathable, Mesh, Summer 2026"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated attributes shown on the storefront (e.g. material, season, style).
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
              defaultValue={
                defaults.description ??
                (isNewProduct ? DEFAULT_PRODUCT_DESCRIPTION : "")
              }
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Upload as many product images as you need. The first image is the primary
            photo in catalog and product gallery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImagesField
            value={defaults.imageUrls ?? []}
            productName={defaults.name}
            onUploadingChange={setImagesUploading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & inventory</CardTitle>
          <CardDescription>
            Set base price and stock here. For variant products, inventory quantity
            is the default stock applied to each variant.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">Base SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={baseSku}
              required
              onChange={(event) => {
                setSkuManual(true);
                setBaseSku(event.target.value);
              }}
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
              defaultValue={defaults.price ?? (isNewProduct ? DEFAULT_BASE_PRICE : undefined)}
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
              defaultValue={
                defaults.compareAtPrice ?? (isNewProduct ? DEFAULT_COMPARE_AT_PRICE : "")
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Inventory quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={inventoryQuantity}
              onChange={(event) =>
                setInventoryQuantity(Math.max(0, Number(event.target.value) || 0))
              }
            />
            <p className="text-xs text-muted-foreground">
              For simple products this is the stock. For variants, each combination
              starts with this value and updates when you change it — unless you
              override a variant stock manually.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            New products include US sizes by default. Add color or other options anytime,
            edit values, then generate combinations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductVariantsEditor
            baseSku={baseSku}
            basePrice={basePrice}
            inventoryQuantity={inventoryQuantity}
            useDefaultVariants={isNewProduct}
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

      <Button type="submit" disabled={pending || imagesUploading}>
        {pending ? "Saving…" : imagesUploading ? "Uploading images…" : productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
