export function getBrandLogoUrl(brandSlug: string, brandName?: string): string {
  let normalized = (brandSlug || brandName || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

  if (normalized === 'mercedes') normalized = 'mercedes-benz';
  if (normalized === 'landrover') normalized = 'land-rover';

  return `https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${normalized}.png`;
}
