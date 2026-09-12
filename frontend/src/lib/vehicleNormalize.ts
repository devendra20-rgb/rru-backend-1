/** Shared display / filter helpers for vehicle fields from the API. */

const FUEL_LABELS: Record<string, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  plug_in_hybrid: 'Plug-in Hybrid',
  electric: 'Electric',
  cng: 'CNG',
  lpg: 'LPG',
  other: 'Other',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: 'Automatic',
  manual: 'Manual',
  cvt: 'CVT',
  dct: 'DCT',
  amt: 'AMT',
  other: 'Other',
};

/** Automatic-family gearboxes for explore filter matching */
const AUTO_FAMILY = new Set(['automatic', 'cvt', 'dct', 'amt']);

export function formatFuelType(raw?: string | null): string {
  if (!raw) return '';
  const key = raw.toLowerCase().trim().replace(/[\s-]+/g, '_');
  return FUEL_LABELS[key] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatTransmission(raw?: string | null): string {
  if (!raw) return '';
  const key = raw.toLowerCase().trim();
  return TRANSMISSION_LABELS[key] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatDrivetrain(raw?: string | null): string {
  if (!raw) return '';
  return raw.toUpperCase();
}

/** True if vehicle fuel matches a UI filter chip (Petrol, Hybrid, Electric, …). */
export function fuelMatchesFilter(vehicleFuel: string, filterFuel: string): boolean {
  const a = vehicleFuel.toLowerCase().replace(/[\s_-]+/g, '');
  const b = filterFuel.toLowerCase().replace(/[\s_-]+/g, '');
  if (a === b) return true;
  // "pluginhybrid" vs "pluginhybrid"
  if (a.includes('plugin') && b.includes('plugin')) return true;
  return false;
}

/** True if vehicle transmission matches Automatic / Manual filter. */
export function transmissionMatchesFilter(vehicleTransmission: string, filterTransmission: string): boolean {
  const v = vehicleTransmission.toLowerCase().trim();
  const f = filterTransmission.toLowerCase().trim();
  if (f === 'automatic') return AUTO_FAMILY.has(v) || v === 'automatic';
  if (f === 'manual') return v === 'manual';
  return v === f;
}

export const FEATURE_CATEGORY_ORDER = [
  'safety',
  'exterior',
  'interior',
  'comfort',
  'convenience',
  'infotainment',
  'performance',
  'technology',
  'lighting',
  'wheels_tyres',
  'other',
] as const;

export function formatFeatureCategory(category?: string): string {
  if (!category) return 'General';
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
