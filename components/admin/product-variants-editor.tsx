"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildVariantSku,
  generateVariantCombinations,
  type ProductOptionInput,
  type ProductVariantInput,
} from "@/lib/products/variants";

type VariantsFormState = {
  hasVariants: boolean;
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
};

type Props = {
  baseSku: string;
  basePrice: number;
  initialState?: Partial<VariantsFormState>;
  fieldError?: string;
};

function emptyOption(): ProductOptionInput {
  return { name: "", values: [] };
}

export function ProductVariantsEditor({
  baseSku,
  basePrice,
  initialState,
  fieldError,
}: Props) {
  const [hasVariants, setHasVariants] = useState(initialState?.hasVariants ?? false);
  const [options, setOptions] = useState<ProductOptionInput[]>(
    initialState?.options?.length ? initialState.options : [emptyOption()],
  );
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initialState?.variants ?? [],
  );
  // Keep raw text while typing so trailing commas ("Red, ") are not wiped
  // by parse → join on every keystroke.
  const [valueDrafts, setValueDrafts] = useState<Record<number, string>>({});

  const payload = useMemo(
    () => JSON.stringify({ hasVariants, options, variants }),
    [hasVariants, options, variants],
  );

  function parseOptionValues(raw: string) {
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function updateOption(index: number, patch: Partial<ProductOptionInput>) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  }

  function addOption() {
    setOptions((current) => [...current, emptyOption()]);
  }

  function removeOption(index: number) {
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setValueDrafts((current) => {
      const next: Record<number, string> = {};
      for (const [key, value] of Object.entries(current)) {
        const optionIndex = Number(key);
        if (optionIndex < index) next[optionIndex] = value;
        else if (optionIndex > index) next[optionIndex - 1] = value;
      }
      return next;
    });
  }

  function generateVariants() {
    // Commit any in-progress drafts before generating combinations.
    const committedOptions = options.map((option, index) =>
      valueDrafts[index] !== undefined
        ? { ...option, values: parseOptionValues(valueDrafts[index]) }
        : option,
    );
    if (Object.keys(valueDrafts).length > 0) {
      setOptions(committedOptions);
      setValueDrafts({});
    }

    const generated = generateVariantCombinations(
      committedOptions,
      baseSku,
      basePrice,
    );
    setVariants((current) => {
      const existing = new Map(
        current.map((variant) => [
          Object.entries(variant.optionValues)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join("|"),
          variant,
        ]),
      );

      return generated.map((variant) => {
        const key = Object.entries(variant.optionValues)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([entryKey, value]) => `${entryKey}:${value}`)
          .join("|");
        const previous = existing.get(key);
        return previous
          ? {
              ...previous,
              sku: variant.sku,
              optionValues: variant.optionValues,
            }
          : variant;
      });
    });
  }

  function updateVariant(index: number, patch: Partial<ProductVariantInput>) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  }

  function variantLabel(variant: ProductVariantInput) {
    return Object.values(variant.optionValues).join(" / ");
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="variantsPayload" value={payload} />
      <input type="hidden" name="hasVariants" value={hasVariants ? "true" : "false"} />

      <label className="flex items-start gap-3 rounded-lg border p-4">
        <input
          type="checkbox"
          checked={hasVariants}
          onChange={(event) => setHasVariants(event.target.checked)}
          className="mt-1 rounded border-input"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">This product has variants</p>
          <p className="text-xs text-muted-foreground">
            Use options like Color, Size, or Shoe size. Each combination becomes a
            sellable variant with its own SKU, price, and stock.
          </p>
        </div>
      </label>

      {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}

      {hasVariants ? (
        <div className="space-y-6 rounded-lg border p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Options</h3>
                <p className="text-xs text-muted-foreground">
                  Example: Color → Red, Blue · Size → 38, 39, 40
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                Add option
              </Button>
            </div>

            {options.map((option, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-dashed p-3 sm:grid-cols-[1fr_2fr_auto]"
              >
                <div className="space-y-2">
                  <Label>Option name</Label>
                  <Input
                    value={option.name}
                    placeholder="Color"
                    onChange={(event) =>
                      updateOption(index, { name: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Values (comma separated)</Label>
                  <Input
                    value={valueDrafts[index] ?? option.values.join(", ")}
                    placeholder="Red, Blue, Black"
                    onChange={(event) => {
                      const raw = event.target.value;
                      setValueDrafts((current) => ({ ...current, [index]: raw }));
                      updateOption(index, { values: parseOptionValues(raw) });
                    }}
                    onBlur={() => {
                      setValueDrafts((current) => {
                        if (current[index] === undefined) return current;
                        const next = { ...current };
                        delete next[index];
                        return next;
                      });
                      updateOption(index, {
                        values: parseOptionValues(
                          valueDrafts[index] ?? option.values.join(", "),
                        ),
                      });
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={options.length === 1}
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" onClick={generateVariants}>
              Generate variants
            </Button>
          </div>

          {variants.length > 0 ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Variants</h3>
                <p className="text-xs text-muted-foreground">
                  {variants.length} combination{variants.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Combination</th>
                      <th className="px-3 py-2 font-medium">Image</th>
                      <th className="px-3 py-2 font-medium">SKU</th>
                      <th className="px-3 py-2 font-medium">Price</th>
                      <th className="px-3 py-2 font-medium">Stock</th>
                      <th className="px-3 py-2 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((variant, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 font-medium">{variantLabel(variant)}</td>
                        <td className="px-3 py-2">
                          <ImageUploadField
                            label=""
                            value={variant.imageUrl}
                            folder="variants"
                            compact
                            onChange={(url) =>
                              updateVariant(index, {
                                imageUrl: url || null,
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={variant.sku}
                            onChange={(event) =>
                              updateVariant(index, {
                                sku: event.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price ?? basePrice}
                            onChange={(event) =>
                              updateVariant(index, {
                                price: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min="0"
                            value={variant.quantity}
                            onChange={(event) =>
                              updateVariant(index, {
                                quantity: Number(event.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={variant.isActive !== false}
                            onChange={(event) =>
                              updateVariant(index, { isActive: event.target.checked })
                            }
                            className="rounded border-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground">
                Base SKU preview:{" "}
                <span className="font-mono">
                  {buildVariantSku(baseSku || "SKU", { Color: "Red", Size: "40" })}
                </span>
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
