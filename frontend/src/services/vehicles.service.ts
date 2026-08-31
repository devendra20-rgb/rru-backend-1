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
    if (USE_MOCK) return vehiclesMock;
    const res = await api.get<{ data: any[] }>('/api/v1/vehicles', filters as Record<string, string | number | boolean | undefined>);
    return (res.data || []).map(normalizeVehicle);
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
      const res = await api.get<{ data: any[] }>('/api/v1/vehicles', { search: brandSlug, limit: 50 });
      return (res.data || []).map(normalizeVehicle);
    } catch {
      return [];
    }
  },
};
