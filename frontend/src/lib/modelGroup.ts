import type { Vehicle, VehicleBadge } from '@/types/vehicle';

export interface ModelGroup {
  modelKey: string;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  year: number;
  bodyType: string;
  fuelTypes: string[];
  transmissions: string[];
  seats: number;
  minPrice: number;
  maxPrice: number;
  minMonthlyCost: number;
  imageUrl?: string;
  badges: VehicleBadge[];
  variants: Vehicle[];
}

export function groupVehiclesByModel(vehicles: Vehicle[]): ModelGroup[] {
  const groupsMap = new Map<string, Vehicle[]>();

  for (const v of vehicles) {
    const brandKey = (v.brandSlug || v.brand || '').toLowerCase().trim();
    const modelKey = (v.modelSlug || v.model || '').toLowerCase().trim().replace(/[\s-]+/g, '-');
    const key = `${brandKey}-${modelKey}`;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key)!.push(v);
  }

  const modelGroups: ModelGroup[] = [];

  groupsMap.forEach((variants, key) => {
    // Sort variants by price low to high
    variants.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));

    const base = variants[0];
    const prices = variants.map((v) => v.priceFrom).filter((p): p is number => p != null && p > 0);
    const monthlyCosts = variants
      .map((v) => v.costToOwnMonthly)
      .filter((c): c is number => c != null && c > 0);

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minMonthlyCost = monthlyCosts.length > 0 ? Math.min(...monthlyCosts) : 0;

    const fuelTypes = Array.from(new Set(variants.map((v) => v.fuelType).filter(Boolean)));
    const transmissions = Array.from(new Set(variants.map((v) => v.transmission).filter(Boolean)));

    // Pick highest priority image or primary image
    const imageUrl = variants.find((v) => v.imageUrl)?.imageUrl || base.imageUrl;

    // Combine badges uniquely
    const badgesMap = new Map<string, VehicleBadge>();
    variants.forEach((v) => {
      v.badges?.forEach((b) => {
        if (!badgesMap.has(b.label)) {
          badgesMap.set(b.label, b);
        }
      });
    });

    modelGroups.push({
      modelKey: key,
      brand: base.brand,
      brandSlug: base.brandSlug || base.brand.toLowerCase().replace(/\s+/g, '-'),
      model: base.model,
      modelSlug: base.modelSlug || base.model.toLowerCase().replace(/\s+/g, '-'),
      year: Math.max(...variants.map((v) => v.year || 2024)),
      bodyType: base.bodyType,
      fuelTypes,
      transmissions,
      seats: base.seats,
      minPrice,
      maxPrice,
      minMonthlyCost,
      imageUrl,
      badges: Array.from(badgesMap.values()),
      variants,
    });
  });

  return modelGroups;
}
