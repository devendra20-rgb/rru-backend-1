import { api, USE_MOCK } from '@/lib/api';
import { vehiclesMock, upcomingVehiclesMock } from '@/data/vehicles.mock';
import type { Vehicle, VehicleFilters } from '@/types/vehicle';
import { resolveMediaUrl } from '@/lib/media';

export function normalizeVehicle(raw: any): Vehicle {
  if (!raw) return raw;

  const brandName = typeof raw.brand === 'object' ? raw.brand?.name : raw.brand;
  const brandSlug = typeof raw.brand === 'object' ? raw.brand?.slug : (raw.brandSlug || raw.brand?.toLowerCase());
  const modelName = typeof raw.model === 'object' ? raw.model?.name : raw.model;
  const modelSlug = typeof raw.model === 'object' ? raw.model?.slug : (raw.modelSlug || raw.model?.toLowerCase());
  const variantName = raw.variant || raw.name || '';
  const priceFrom = raw.pricing?.amount ?? raw.markets?.[0]?.pricing?.amount ?? raw.priceFrom ?? 0;
  const currency = raw.pricing?.currencyCode ?? raw.markets?.[0]?.pricing?.currencyCode ?? raw.currency ?? 'AED';
  const rawImageUrl = raw.primaryMedia?.url || raw.imageUrl || (raw.media && raw.media[0]?.url);
  const imageUrl = resolveMediaUrl(rawImageUrl);
  const mediaItems = raw.media && Array.isArray(raw.media)
    ? raw.media.map((m: any) => ({
        url: resolveMediaUrl(typeof m === 'string' ? m : m.url),
        altText: m.altText,
        isPrimary: m.isPrimary,
        sortOrder: m.sortOrder,
        mediaType: m.mediaType || 'image',
        colorId: m.colorId ? m.colorId.toString() : null,
        angleTag: m.angleTag || null,
      }))
    : (imageUrl ? [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] : []);
  const images = mediaItems.map((m: any) => m.url);

  const fuelType = raw.fuelType 
    ? (raw.fuelType.toLowerCase() === 'plug_in_hybrid' ? 'Hybrid' : raw.fuelType.charAt(0).toUpperCase() + raw.fuelType.slice(1)) 
    : 'Petrol';

  const transmission = raw.transmissionType 
    ? raw.transmissionType.charAt(0).toUpperCase() + raw.transmissionType.slice(1) 
    : (raw.transmission || 'Automatic');

  const drivetrain = raw.drivetrain ? raw.drivetrain.toUpperCase() : 'AWD';

  return {
    _id: raw._id,
    brand: brandName || 'Unknown Brand',
    brandSlug: brandSlug || 'unknown',
    model: modelName || 'Unknown Model',
    modelSlug: modelSlug || 'unknown',
    variant: variantName,
    slug: raw.slug,
    year: raw.modelYear || raw.year || 2026,
    bodyType: raw.model?.bodyType || raw.bodyType || 'SUV',
    fuelType,
    transmission,
    drivetrain,
    seats: raw.seatingCapacity || raw.seats || 5,
    doors: raw.doors || 5,
    engine: raw.engine ? {
      displacement: raw.engine.displacement || (raw.engine.displacementCc ? `${(raw.engine.displacementCc/1000).toFixed(1)}L` : '3.0L'),
      type: raw.engine.type || 'V6',
      cylinders: raw.engine.cylinders || 6,
      power: raw.engine.power || (raw.engine.powerHp ? `${raw.engine.powerHp} hp` : '300 hp'),
      torque: raw.engine.torque || (raw.engine.torqueNm ? `${raw.engine.torqueNm} Nm` : '400 Nm'),
    } : undefined,
    performance: raw.specifications?.performance || raw.performance ? {
      topSpeed: raw.specifications?.performance?.topSpeedKph || raw.performance?.topSpeed || 210,
      acceleration0To100: raw.specifications?.performance?.acceleration0To100Kph || raw.performance?.acceleration0To100 || 6.5,
    } : undefined,
    fuelConsumption: raw.fuelConsumption || { combined: raw.specifications?.fuel?.fuelEconomyCombined || 9.5, unit: raw.specifications?.fuel?.economyUnit || 'L/100km' },
    priceFrom,
    currency,
    costToOwnMonthly: raw.costToOwnMonthly || (priceFrom ? Math.round(priceFrom * 0.014) : 3200),
    imageUrl,
    images,
    mediaItems,
    colors: raw.colors,
    features: raw.features,
    specifications: raw.specifications,
    tags: raw.tags || ['GCC Spec', 'Verified'],
    badges: raw.badges || [{ label: 'GCC Spec', type: 'info' }],
    isVerified: raw.isVerified ?? true,
    isGccSpec: raw.isGccSpec ?? true,
    status: raw.availabilityStatus === 'upcoming' ? 'upcoming' : (raw.status || 'active'),
  };
}

export const vehiclesService = {
  getAll: async (filters?: VehicleFilters): Promise<Vehicle[]> => {
    if (USE_MOCK) {
      const q = (filters?.search || '').trim().toLowerCase();
      if (!q) return vehiclesMock;
      return vehiclesMock.filter((v) =>
        [v.brand, v.model, v.variant, v.slug].join(' ').toLowerCase().includes(q),
      );
    }
    const res = await api.get<{ data: any[] }>('/api/v1/vehicles', {
      ...(filters as Record<string, string | number | boolean | undefined>),
      limit: Math.min(Number(filters?.limit) || 100, 100),
      page: filters?.page || 1,
    });
    return (res.data || []).map(normalizeVehicle);
  },

  /** Search vehicles by brand / model / variant name (server-side). */
  search: async (query: string, limit = 40): Promise<Vehicle[]> => {
    const q = query.trim();
    if (!q) return vehiclesService.getAll({ limit });
    return vehiclesService.getAll({ search: q, limit });
  },

  /** Fetch every page of active vehicles (backend max 100/page). */
  getAllPages: async (filters?: Omit<VehicleFilters, 'page' | 'limit'>): Promise<Vehicle[]> => {
    if (USE_MOCK) return vehiclesService.getAll(filters);

    const pageSize = 100;
    const all: Vehicle[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= 20) {
      const res = await api.get<{ data: any[]; meta?: { totalPages?: number; total?: number } }>(
        '/api/v1/vehicles',
        {
          ...(filters as Record<string, string | number | boolean | undefined>),
          limit: pageSize,
          page,
        },
      );
      all.push(...(res.data || []).map(normalizeVehicle));
      totalPages = res.meta?.totalPages || 1;
      if (!res.data?.length) break;
      page += 1;
    }

    return all;
  },

  getFeatured: async (): Promise<Vehicle[]> => {
    if (USE_MOCK) return vehiclesMock.slice(0, 4);
    const res = await api.get<{ data: any[] }>('/api/v1/vehicles/featured');
    return (res.data || []).map(normalizeVehicle);
  },

  getUpcoming: async (): Promise<Vehicle[]> => {
    if (USE_MOCK) return upcomingVehiclesMock;
    try {
      const res = await api.get<{ data: any[] }>('/api/v1/vehicles', { availabilityStatus: 'upcoming', limit: 20 });
      const upcoming = (res.data || []).map(normalizeVehicle);
      return upcoming;
    } catch {
      return upcomingVehiclesMock;
    }
  },

  getBySlug: async (slug: string): Promise<Vehicle | undefined> => {
    if (USE_MOCK) return vehiclesMock.find((v) => v.slug === slug);
    try {
      const res = await api.get<{ data: any }>(`/api/v1/vehicles/slug/${slug}`);
      return res.data ? normalizeVehicle(res.data) : undefined;
    } catch {
      return undefined;
    }
  },

  getByBrandSlug: async (brandSlug: string): Promise<Vehicle[]> => {
    if (USE_MOCK) return vehiclesMock.filter((v) => v.brandSlug === brandSlug);
    try {
      // Prefer identity filter (brandSlug / brandId) — never use free-text search with a slug
      // because "land-rover" does not match brand name "Land Rover".
      const bySlug = await vehiclesService.getAllPages({ brandSlug });
      if (bySlug.length > 0) {
        return bySlug.filter((v) => !v.brandSlug || v.brandSlug === brandSlug);
      }

      // Fallback: resolve brand document then filter by brandId
      const { brandsService } = await import('./brands.service');
      const brand = await brandsService.getBySlug(brandSlug);
      if (!brand?._id) return [];
      const byId = await vehiclesService.getAllPages({ brandId: brand._id });
      return byId.filter((v) => !v.brandSlug || v.brandSlug === brandSlug || v.brand === brand.name);
    } catch {
      return [];
    }
  },
};
