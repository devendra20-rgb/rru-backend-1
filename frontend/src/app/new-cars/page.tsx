'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import { vehiclesMock } from '@/data/vehicles.mock';
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from '@/lib/constants';
import { brandsMock } from '@/data/brands.mock';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from './newcars.module.css';

type SortOption = 'popular' | 'price-low' | 'price-high' | 'cost-low' | 'newest';

function NewCarsContent() {
  const searchParams = useSearchParams();

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

  // Initialize filters from URL query parameters
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);

    const brand = searchParams.get('brand');
    if (brand) setSelectedBrand(brand);

    const body = searchParams.get('bodyType');
    if (body) setSelectedBodyTypes([body]);

    const fuel = searchParams.get('fuelType');
    if (fuel) setSelectedFuelTypes([fuel]);

    const trans = searchParams.get('transmission');
    if (trans) setSelectedTransmission(trans);

    const seats = searchParams.get('seats');
    if (seats) setSelectedSeats(seats);

    const max = searchParams.get('maxPrice');
    if (max) setMaxPrice(max);

    const min = searchParams.get('minPrice');
    if (min) setMinPrice(min);
  }, [searchParams]);

  const toggleBodyType = (bt: string) => {
    setSelectedBodyTypes((prev) =>
      prev.includes(bt) ? prev.filter((x) => x !== bt) : [...prev, bt]
    );
  };

  const toggleFuelType = (ft: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(ft) ? prev.filter((x) => x !== ft) : [...prev, ft]
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
    let result = vehiclesMock.filter((v) => v.status === 'active');

    // Text search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((v) => {
        const text = `${v.brand} ${v.model} ${v.variant} ${v.bodyType} ${v.fuelType} ${(v.tags || []).join(' ')}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (selectedBrand) {
      result = result.filter((v) => v.brandSlug === selectedBrand);
    }
    if (selectedBodyTypes.length > 0) {
      result = result.filter((v) => selectedBodyTypes.includes(v.bodyType));
    }
    if (selectedFuelTypes.length > 0) {
      result = result.filter((v) => selectedFuelTypes.includes(v.fuelType));
    }
    if (selectedTransmission) {
      result = result.filter((v) => v.transmission === selectedTransmission);
    }
    if (selectedSeats) {
      const seats = parseInt(selectedSeats);
      if (seats === 7) {
        result = result.filter((v) => v.seats >= 7);
      } else {
        result = result.filter((v) => v.seats === seats);
      }
    }
    if (minPrice) {
      result = result.filter((v) => (v.priceFrom || 0) >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter((v) => (v.priceFrom || 0) <= parseInt(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
        break;
      case 'cost-low':
        result.sort((a, b) => (a.costToOwnMonthly || 0) - (b.costToOwnMonthly || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, selectedBrand, selectedBodyTypes, selectedFuelTypes, selectedTransmission, selectedSeats, minPrice, maxPrice, sortBy]);

  const activeFilterTags: { label: string; clear: () => void }[] = [];

  if (searchQuery) {
    activeFilterTags.push({ label: `"${searchQuery}"`, clear: () => setSearchQuery('') });
  }
  if (selectedBrand) {
    const brandName = brandsMock.find((b) => b.slug === selectedBrand)?.name || selectedBrand;
    activeFilterTags.push({ label: brandName, clear: () => setSelectedBrand('') });
  }
  selectedBodyTypes.forEach((bt) => {
    activeFilterTags.push({ label: bt, clear: () => toggleBodyType(bt) });
  });
  selectedFuelTypes.forEach((ft) => {
    activeFilterTags.push({ label: ft, clear: () => toggleFuelType(ft) });
  });
  if (selectedTransmission) {
    activeFilterTags.push({ label: selectedTransmission, clear: () => setSelectedTransmission('') });
  }
  if (selectedSeats) {
    activeFilterTags.push({ label: `${selectedSeats}+ Seats`, clear: () => setSelectedSeats('') });
  }
  if (maxPrice) {
    activeFilterTags.push({ label: `Under AED ${parseInt(maxPrice).toLocaleString()}`, clear: () => setMaxPrice('') });
  }

  return (
    <div className={styles.listingPage}>
      {/* Header */}
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

      {/* Mobile Filter Toggle */}
      <button
        className={styles.mobileFilterToggle}
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <SlidersHorizontal size={16} />
        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={styles.listingLayout}>
        {/* Filter Sidebar */}
        <aside
          className={`${styles.filterSidebar} ${showMobileFilters ? styles.filterSidebarOpen : ''}`}
        >
          <div className={styles.filterHeader}>
            <h3 className={styles.filterHeaderTitle}>Filters</h3>
            {hasActiveFilters && (
              <button className={styles.filterClearBtn} onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search Keywords</label>
            <input
              type="text"
              className={styles.filterPriceInput}
              placeholder="e.g. 7 seater, hybrid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Brand */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Brand</label>
            <select
              className={styles.filterSelect}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brandsMock.map((brand) => (
                <option key={brand._id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Body Type</label>
            <div className={styles.filterChips}>
              {BODY_TYPES.map((bt) => (
                <button
                  key={bt}
                  className={`${styles.filterChip} ${selectedBodyTypes.includes(bt) ? styles.filterChipActive : ''}`}
                  onClick={() => toggleBodyType(bt)}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fuel Type</label>
            <div className={styles.filterChips}>
              {FUEL_TYPES.map((ft) => (
                <button
                  key={ft}
                  className={`${styles.filterChip} ${selectedFuelTypes.includes(ft) ? styles.filterChipActive : ''}`}
                  onClick={() => toggleFuelType(ft)}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission */}
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

          {/* Seats */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Seats</label>
            <div className={styles.filterChips}>
              {['5', '7'].map((s) => (
                <button
                  key={s}
                  className={`${styles.filterChip} ${selectedSeats === s ? styles.filterChipActive : ''}`}
                  onClick={() => setSelectedSeats(selectedSeats === s ? '' : s)}
                >
                  {s === '7' ? '7+' : s} Seats
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
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

        {/* Results Area */}
        <div className={styles.resultsArea}>
          {/* Active filter tags */}
          {activeFilterTags.length > 0 && (
            <div className={styles.activeFilters}>
              {activeFilterTags.map((tag) => (
                <button
                  key={tag.label}
                  className={styles.activeFilterTag}
                  onClick={tag.clear}
                >
                  {tag.label}
                  <span className={styles.activeFilterTagX}>×</span>
                </button>
              ))}
            </div>
          )}

          {/* Results header */}
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

          {/* Results grid */}
          <div className={styles.resultsGrid}>
            {filteredVehicles.length > 0 ? (
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
                <button className="btn-primary" onClick={clearFilters}>
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
