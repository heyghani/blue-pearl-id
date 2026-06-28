import { useState } from "react";

import { slugify } from "@/lib/slug";

export function useAutoSlug(defaultSlug?: string, enabled = true) {
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(defaultSlug));

  function handleNameChange(name: string) {
    if (!enabled || slugManual) return;
    setSlug(slugify(name));
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(value);
  }

  return { slug, handleNameChange, handleSlugChange };
}
