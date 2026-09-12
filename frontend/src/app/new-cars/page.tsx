'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { brandsService } from '@/services/brands.service';
import type { Vehicle } from '@/types/vehicle';
import type { Brand } from '@/types/brand';
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from '@/lib/constants';
import {
  fuelMatchesFilter,
  transmissionMatchesFilter,
} from '@/lib/vehicleNormalize';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from './newcars.module.css';

type SortOption = 'popular' | 'price-low' | 'price-high' | 'cost-low' | 'newest';

const SEAT_OPTIONS = [
  { value: '5', label: '5 Seats' },
  { value: '7', label: '7+ Seats' },
  { value: '8', label: '8+ Seats' },
] as const;

function matchesSeatFilter(seats: number, filter: string): boolean {
  const n = parseInt(filter, 10);
  if (Number.isNaN(n)) return true;
  if (n >= 8) return seats >= 8;
  if (n === 7) return seats >= 7;
  return seats === n;
}

function NewCarsContent() {
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      vehiclesService.getAllPages(),
      brandsService.getAll(),
    ])
      .then(([vList, brandList]) => {
        if (cancelled) return;
        setVehicles(vList);
        setBrands(brandList);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize filters from URL query parameters
  useEffect(() => {
    const q = searchParams.get('search');
    setSearchQuery(q || '');

    const brand = searchParams.get('brand');
    setSelectedBrand(brand || '');

    const body = searchParams.get('bodyType');
    setSelectedBodyTypes(body ? [body] : []);

    const fuel = searchParams.get('fuelType');
    setSelectedFuelTypes(fuel ? [fuel] : []);

    const trans = searchParams.get('transmission');
    setSelectedTransmission(trans || '');

    const seats = searchParams.get('seats');
    setSelectedSeats(seats || '');

    const max = searchParams.get('maxPrice');
    setMaxPrice(max || '');

    const min = searchParams.get('minPrice');
    setMinPrice(min || '');
  }, [searchParams]);

  const toggleBodyType = (bt: string) => {
    setSelectedBodyTypes((prev) =>
      prev.includes(bt) ? prev.filter((x) => x !== bt) : [...prev, bt],
    );
  };

  const toggleFuelType = (ft: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(ft) ? prev.filter((x) => x !== ft) : [...prev, ft],
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedBodyTypes([]);
    setSelectedFuelTypes([]);
    setSelectedTransmission('');
    setSelectedSeats('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedBrand ||
    selectedBodyTypes.length > 0 ||
    selectedFuelTypes.length > 0 ||
    selectedTransmission ||
    selectedSeats ||
    minPrice ||
    maxPrice;

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => v.status === 'active' || v.status === 'upcoming');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim().replace(/[\s-]+/g, ' ');
      result = result.filter((v) => {
        const text = `${v.brand} ${v.model} ${v.variant} ${v.brandSlug} ${v.bodyType} ${v.fuelType} ${(v.tags || []).join(' ')}`
          .toLowerCase()
          .replace(/[\s-]+/g, ' ');
        return text.includes(q);
      });
    }

    if (selectedBrand) {
      result = result.filter(
        (v) =>
          v.brandSlug === selectedBrand ||
          v.brand.toLowerCase() === selectedBrand.toLowerCase(),
      );
    }

    if (selectedBodyTypes.length > 0) {
      const wanted = selectedBodyTypes.map((b) => b.toLowerCase());
      result = result.filter((v) => wanted.includes((v.bodyType || '').toLowerCase()));
    }

    if (selectedFuelTypes.length > 0) {
      result = result.filter((v) =>
        selectedFuelTypes.some((ft) => fuelMatchesFilter(v.fuelType, ft)),
      );
    }

    if (selectedTransmission) {
      result = result.filter((v) =>
        transmissionMatchesFilter(v.transmission, selectedTransmission),
      );
    }

    if (selectedSeats) {
      result = result.filter((v) => matchesSeatFilter(v.seats, selectedSeats));
    }

    const min = minPrice ? parseInt(minPrice, 10) : NaN;
    const max = maxPrice ? parseInt(maxPrice, 10) : NaN;
    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      result = result.filter((v) => {
        const price = v.priceFrom;
        if (price == null || price <= 0) return false;
        if (!Number.isNaN(min) && price < min) return false;
        if (!Number.isNaN(max) && price > max) return false;
        return true;
      });
    }

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort(
          (a, b) =>
            (a.priceFrom || Number.POSITIVE_INFINITY) - (b.priceFrom || Number.POSITIVE_INFINITY),
        );
        break;
      case 'price-high':
        result = [...result].sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
        break;
      case 'cost-low':
        result = [...result].sort(
          (a, b) =>
            (a.costToOwnMonthly || Number.POSITIVE_INFINITY) -
            (b.costToOwnMonthly || Number.POSITIVE_INFINITY),
        );
        break;
      case 'newest':
        result = [...result].sort((a, b) => b.year - a.year);
        break;
      default:
        break;
    }

    return result;
  }, [
    vehicles,
    searchQuery,
    selectedBrand,
    selectedBodyTypes,
    selectedFuelTypes,
    selectedTransmission,
    selectedSeats,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const activeFilterTags: { label: string; clear: () => void }[] = [];

  if (searchQuery) {
    activeFilterTags.push({ label: `"${searchQuery}"`, clear: () => setSearchQuery('') });
  }
  if (selectedBrand) {
    const brandName = brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand;
    activeFilterTags.push({ label: brandName, clear: () => setSelectedBrand('') });
  }
  selectedBodyTypes.forEach((bt) => {
    activeFilterTags.push({ label: bt, clear: () => toggleBodyType(bt) });
  });
  selectedFuelTypes.forEach((ft) => {
    activeFilterTags.push({ label: ft, clear: () => toggleFuelType(ft) });
  });
  if (selectedTransmission) {
    activeFilterTags.push({
      label: selectedTransmission,
      clear: () => setSelectedTransmission(''),
    });
  }
  if (selectedSeats) {
    const seatLabel =
      SEAT_OPTIONS.find((s) => s.value === selectedSeats)?.label || `${selectedSeats} Seats`;
    activeFilterTags.push({ label: seatLabel, clear: () => setSelectedSeats('') });
  }
  if (minPrice) {
    activeFilterTags.push({
      label: `From AED ${parseInt(minPrice, 10).toLocaleString()}`,
      clear: () => setMinPrice(''),
    });
  }
  if (maxPrice) {
    activeFilterTags.push({
      label: `Under AED ${parseInt(maxPrice, 10).toLocaleString()}`,
      clear: () => setMaxPrice(''),
    });
  }

  return (
    <div className={styles.listingPage}>
      <div className={styles.listingHeader}>
        <div className={styles.listingBreadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <span>New Cars</span>
        </div>
        <h1 className={styles.listingTitle}>Explore New Cars</h1>
        <p className={styles.listingSubtitle}>
          Browse all new cars available in the UAE. Use filters to narrow down your options.
        </p>
      </div>

      <button
        type="button"
        className={styles.mobileFilterToggle}
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <SlidersHorizontal size={16} />
        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={styles.listingLayout}>
        <aside
          className={`${styles.filterSidebar} ${showMobileFilters ? styles.filterSidebarOpen : ''}`}
        >
          <div className={styles.filterHeader}>
            <h3 className={styles.filterHeaderTitle}>Filters</h3>
            {hasActiveFilters && (
              <button type="button" className={styles.filterClearBtn} onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search Keywords</label>
            <input
              type="text"
              className={styles.filterPriceInput}
              placeholder="e.g. Toyota, hybrid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Brand</label>
            <select
              className={styles.filterSelect}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Body Type</label>
            <div className={styles.filterChips}>
              {BODY_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  className={`${styles.filterChip} ${selectedBodyTypes.includes(bt) ? styles.filterChipActive : ''}`}
                  onClick={() => toggleBodyType(bt)}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fuel Type</label>
            <div className={styles.filterChips}>
              {FUEL_TYPES.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  className={`${styles.filterChip} ${selectedFuelTypes.includes(ft) ? styles.filterChipActive : ''}`}
                  onClick={() => toggleFuelType(ft)}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Transmission</label>
            <select
              className={styles.filterSelect}
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
            >
              <option value="">Any</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Seats</label>
            <div className={styles.filterChips}>
              {SEAT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`${styles.filterChip} ${selectedSeats === s.value ? styles.filterChipActive : ''}`}
                  onClick={() => setSelectedSeats(selectedSeats === s.value ? '' : s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Price Range (AED)</label>
            <div className={styles.filterPriceInputs}>
              <input
                type="number"
                className={styles.filterPriceInput}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                className={styles.filterPriceInput}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <div className={styles.resultsArea}>
          {activeFilterTags.length > 0 && (
            <div className={styles.activeFilters}>
              {activeFilterTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  className={styles.activeFilterTag}
                  onClick={tag.clear}
                >
                  {tag.label}
                  <span className={styles.activeFilterTagX}>×</span>
                </button>
              ))}
            </div>
          )}

          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>
              Showing <strong>{filteredVehicles.length}</strong> cars
            </div>
            <div className={styles.resultsSort}>
              <span className={styles.resultsSortLabel}>Sort:</span>
              <select
                className={styles.resultsSortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="cost-low">Ownership Cost: Low → High</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className={styles.resultsGrid}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                Loading vehicles...
              </div>
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Search size={24} />
                </div>
                <div className={styles.emptyStateTitle}>No cars found</div>
                <p className={styles.emptyStateDesc}>
                  Try adjusting your filters or search keywords to see more results.
                </p>
                <button type="button" className="btn-primary" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewCarsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading cars...</div>}>
      <NewCarsContent />
    </Suspense>
  );
}
