export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Generates default slug from Model + optional Generation + Variant Name.
 * Format:
 * - Without Generation: {model-slug}-{variant-slug}
 * - With Generation: {model-slug}-{generation-slug}-{variant-slug}
 */
export function buildDefaultSlug(
  modelSlugOrName?: string,
  genSlugOrName?: string,
  variantName?: string,
): string {
  const parts: string[] = [];

  if (modelSlugOrName) {
    const m = slugify(modelSlugOrName);
    if (m) parts.push(m);
  }

  if (genSlugOrName) {
    const g = slugify(genSlugOrName);
    if (g) parts.push(g);
  }

  if (variantName) {
    const v = slugify(variantName);
    if (v) parts.push(v);
  }

  return parts.join('-');
}

export interface SlugCheckResult {
  _id: string;
  slug?: string;
}

/**
 * Checks if candidate slug is already taken by another variant.
 * If taken, automatically appends a numeric suffix (-1, -2, etc.) until a unique slug is found.
 * If currentVariantId is provided (edit mode), matching the current variant is NOT a collision.
 */
export async function findUniqueSlug(
  candidateSlug: string,
  currentVariantId?: string | null,
  checkSlugFn?: (slug: string) => Promise<SlugCheckResult | null>,
): Promise<{ slug: string; isModified: boolean }> {
  const base = slugify(candidateSlug);
  if (!base) {
    return { slug: '', isModified: false };
  }

  if (!checkSlugFn) {
    return { slug: base, isModified: false };
  }

  try {
    const existing = await checkSlugFn(base);

    // If slug is available or belongs to the variant currently being edited, preserve it
    if (!existing || (currentVariantId && String(existing._id) === String(currentVariantId))) {
      return { slug: base, isModified: false };
    }

    // Collision detected with another variant, increment numeric suffix (-1, -2, ...)
    let counter = 1;
    while (counter <= 100) {
      const suggested = `${base}-${counter}`;
      const check = await checkSlugFn(suggested);

      if (!check || (currentVariantId && String(check._id) === String(currentVariantId))) {
        return { slug: suggested, isModified: true };
      }
      counter++;
    }

    return { slug: `${base}-${Date.now()}`, isModified: true };
  } catch (err) {
    // If check fails (e.g. network error), default to clean base slug
    return { slug: base, isModified: false };
  }
}
