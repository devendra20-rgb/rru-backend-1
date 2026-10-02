export interface ParsedSearchQuery {
  seats?: string;
  maxPrice?: number;
  minPrice?: number;
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  brandSlug?: string;
  remainingQuery: string;
}

export interface BrandItem {
  name: string;
  slug: string;
  aliases?: string[];
}

const COMMON_BRANDS: BrandItem[] = [
  { name: 'Toyota', slug: 'toyota' },
  { name: 'Nissan', slug: 'nissan' },
  { name: 'Audi', slug: 'audi' },
  { name: 'BMW', slug: 'bmw' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', aliases: ['mercedes', 'benz', 'merc'] },
  { name: 'Hyundai', slug: 'hyundai' },
  { name: 'Kia', slug: 'kia' },
  { name: 'Ford', slug: 'ford' },
  { name: 'Honda', slug: 'honda' },
  { name: 'Porsche', slug: 'porsche' },
  { name: 'Bentley', slug: 'bentley' },
  { name: 'Lexus', slug: 'lexus' },
  { name: 'Land Rover', slug: 'land-rover', aliases: ['range rover', 'landrover'] },
  { name: 'Chevrolet', slug: 'chevrolet', aliases: ['chevy'] },
  { name: 'Volkswagen', slug: 'volkswagen', aliases: ['vw'] },
  { name: 'Mitsubishi', slug: 'mitsubishi' },
  { name: 'Mazda', slug: 'mazda' },
  { name: 'Jeep', slug: 'jeep' },
  { name: 'Infiniti', slug: 'infiniti' },
  { name: 'Genesis', slug: 'genesis' },
  { name: 'Suzuki', slug: 'suzuki' },
  { name: 'Jaguar', slug: 'jaguar' },
  { name: 'Tesla', slug: 'tesla' },
  { name: 'Volvo', slug: 'volvo' },
  { name: 'Bestune', slug: 'bestune' },
  { name: 'Aston Martin', slug: 'aston-martin', aliases: ['aston'] },
  { name: 'Ferrari', slug: 'ferrari' },
  { name: 'Lamborghini', slug: 'lamborghini', aliases: ['lambo'] },
  { name: 'McLaren', slug: 'mclaren' },
  { name: 'Rolls-Royce', slug: 'rolls-royce', aliases: ['rolls royce', 'rolls'] },
  { name: 'Maserati', slug: 'maserati' },
  { name: 'Alfa Romeo', slug: 'alfa-romeo', aliases: ['alfa'] },
  { name: 'Cadillac', slug: 'cadillac' },
  { name: 'GMC', slug: 'gmc' },
  { name: 'RAM', slug: 'ram' },
  { name: 'Dodge', slug: 'dodge' },
  { name: 'BYD', slug: 'byd' },
  { name: 'Geely', slug: 'geely' },
  { name: 'Changan', slug: 'changan' },
  { name: 'MG', slug: 'mg' },
  { name: 'Chery', slug: 'chery' },
  { name: 'Exeed', slug: 'exeed' },
  { name: 'GAC', slug: 'gac' },
];

const COMMON_BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Wagon', 'Van'];

const FUEL_MAP: Record<string, string> = {
  electric: 'Electric',
  ev: 'Electric',
  evs: 'Electric',
  hybrid: 'Hybrid',
  phev: 'Hybrid',
  'plug-in hybrid': 'Hybrid',
  petrol: 'Petrol',
  gasoline: 'Petrol',
  diesel: 'Diesel',
};

function parseNumericValue(valueStr: string, multiplier?: string): number {
  const cleanVal = parseFloat(valueStr.replace(/,/g, ''));
  if (Number.isNaN(cleanVal)) return 0;

  const m = (multiplier || '').toLowerCase();
  if (m === 'k') return cleanVal * 1000;
  if (m === 'm') return cleanVal * 1000000;

  // Handle implicit thousands if price is small (e.g. "under 150" or "under 80" when user means 150k or 80k)
  if (cleanVal < 1000 && cleanVal > 10) {
    return cleanVal * 1000;
  }

  return cleanVal;
}

export function parseSearchQuery(
  rawQuery: string,
  dynamicBrands: { name: string; slug: string }[] = [],
): ParsedSearchQuery {
  let workingQ = rawQuery.trim().toLowerCase();

  let seats: string | undefined;
  let maxPrice: number | undefined;
  let minPrice: number | undefined;
  const bodyTypes: string[] = [];
  const fuelTypes: string[] = [];
  const transmissions: string[] = [];
  let brandSlug: string | undefined;

  if (!workingQ) {
    return {
      bodyTypes,
      fuelTypes,
      transmissions,
      remainingQuery: '',
    };
  }

  // 1. Extract Seats (e.g. "7 seater", "7-seater", "7 seats", "7 seat", "8 seater", "5 seater")
  const seatRegex = /\b(\d+)\s*(?:-?\s*seater|-?\s*seats|-?\s*seat)\b/i;
  const seatMatch = workingQ.match(seatRegex);
  if (seatMatch) {
    seats = seatMatch[1];
    workingQ = workingQ.replace(seatRegex, ' ');
  }

  // 2. Extract Price Range: Between X and Y (e.g. "100k to 150k", "100k - 150k", "between 100k and 150k")
  const betweenPriceRegex = /(?:between|from)?\s*(\d[\d,.]*)\s*(k|m)?\s*(?:to|-|and)\s*(\d[\d,.]*)\s*(k|m)?\s*(?:aed|dirhams)?/i;
  const betweenMatch = workingQ.match(betweenPriceRegex);
  if (betweenMatch) {
    minPrice = parseNumericValue(betweenMatch[1], betweenMatch[2]);
    maxPrice = parseNumericValue(betweenMatch[3], betweenMatch[4]);
    workingQ = workingQ.replace(betweenPriceRegex, ' ');
  }

  // 3. Extract Price Range: Max / Under / Below / Less Than / Up To (e.g. "under 150k", "under AED 150k", "less than 150000", "< 150k", "80k max")
  if (maxPrice === undefined) {
    const underPriceRegex = /(?:under|below|max|maximum|less than|up to|<)\s*(?:aed\s*)?(\d[\d,.]*)\s*(k|m)?\b/i;
    const underMatch = workingQ.match(underPriceRegex);
    if (underMatch) {
      maxPrice = parseNumericValue(underMatch[1], underMatch[2]);
      workingQ = workingQ.replace(underPriceRegex, ' ');
    } else {
      const altMaxRegex = /(?:aed\s*)?(\d[\d,.]*)\s*(k|m)\s*(?:max|under|below)\b/i;
      const altMaxMatch = workingQ.match(altMaxRegex);
      if (altMaxMatch) {
        maxPrice = parseNumericValue(altMaxMatch[1], altMaxMatch[2]);
        workingQ = workingQ.replace(altMaxRegex, ' ');
      }
    }
  }

  // 4. Extract Price Range: Min / Above / Over / More Than / From (e.g. "above 100k", "over 100k", "min 100k", "from 100k", "> 100k")
  if (minPrice === undefined) {
    const overPriceRegex = /(?:above|over|more than|min|minimum|from|>|starting from)\s*(?:aed\s*)?(\d[\d,.]*)\s*(k|m)?\b/i;
    const overMatch = workingQ.match(overPriceRegex);
    if (overMatch) {
      minPrice = parseNumericValue(overMatch[1], overMatch[2]);
      workingQ = workingQ.replace(overPriceRegex, ' ');
    }
  }

  // Fallback standalone price with 'k' or 'm' (e.g. "150k" or "80k" without explicit "under" if seats/body type already present)
  if (maxPrice === undefined && minPrice === undefined) {
    const standalonePriceRegex = /\b(?:aed\s*)?(\d[\d,.]*)\s*(k|m)\b/i;
    const standaloneMatch = workingQ.match(standalonePriceRegex);
    if (standaloneMatch) {
      maxPrice = parseNumericValue(standaloneMatch[1], standaloneMatch[2]);
      workingQ = workingQ.replace(standalonePriceRegex, ' ');
    }
  }

  // 5. Extract Body Types (e.g. "SUV", "Sedan", "Hatchback", "Coupe", "Convertible", etc.)
  COMMON_BODY_TYPES.forEach((bt) => {
    const btRegex = new RegExp(`\\b${bt}s?\\b`, 'gi');
    if (btRegex.test(workingQ)) {
      bodyTypes.push(bt);
      workingQ = workingQ.replace(btRegex, ' ');
    }
  });

  // 6. Extract Fuel Types (e.g. "electric", "ev", "hybrid", "petrol", "diesel")
  Object.entries(FUEL_MAP).forEach(([key, label]) => {
    const fuelRegex = new RegExp(`\\b${key}\\b`, 'gi');
    if (fuelRegex.test(workingQ)) {
      if (!fuelTypes.includes(label)) {
        fuelTypes.push(label);
      }
      workingQ = workingQ.replace(fuelRegex, ' ');
    }
  });

  // 7. Extract Transmission
  if (/\b(?:automatic|auto)\b/i.test(workingQ)) {
    transmissions.push('automatic');
    workingQ = workingQ.replace(/\b(?:automatic|auto)\b/gi, ' ');
  } else if (/\bmanual\b/i.test(workingQ)) {
    transmissions.push('manual');
    workingQ = workingQ.replace(/\bmanual\b/gi, ' ');
  }

  // 8. Extract Brand
  const allBrands: BrandItem[] = [...dynamicBrands, ...COMMON_BRANDS];
  for (const b of allBrands) {
    const namesToTest = [b.name.toLowerCase(), b.slug.toLowerCase(), ...(b.aliases || [])];
    for (const name of namesToTest) {
      const brandRegex = new RegExp(`\\b${name.replace('-', '\\s*')}\\b`, 'gi');
      if (brandRegex.test(workingQ)) {
        brandSlug = b.slug;
        workingQ = workingQ.replace(brandRegex, ' ');
        break;
      }
    }
    if (brandSlug) break;
  }

  // Clean up remaining query words
  const remaining = workingQ
    .replace(/\b(aed|dirhams|cars?|vehicles?|for|in|with|the|and|or|spec)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    seats,
    maxPrice,
    minPrice,
    bodyTypes,
    fuelTypes,
    transmissions,
    brandSlug,
    remainingQuery: remaining,
  };
}
