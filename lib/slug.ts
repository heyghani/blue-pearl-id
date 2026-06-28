export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateBaseSkuFromName(name: string) {
  const slug = slugify(name);
  if (!slug) return "";

  return `BP-${slug.toUpperCase()}`.slice(0, 50);
}
