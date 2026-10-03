'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, SlidersHorizontal, Search, LayoutGrid, List, Loader2, ChevronDown, Check } from 'lucide-react';
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
import ModelCard from '@/components/ui/ModelCard';
import Skeleton from '@/components/ui/Skeleton';
import { groupVehiclesByModel } from '@/lib/modelGroup';
import { parseSearchQuery } from '@/lib/searchQueryParser';
import { cn } from '@/lib/utils';
import styles from './newcars.module.css';

type SortOption = 'popular' | 'price-low' | 'price-high' | 'cost-low' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'cost-low', label: 'Ownership Cost: Low → High' },
  { value: 'newest', label: 'Newest' },
];

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'model' | 'variant'>('model');

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync refs for observer callbacks & strict concurrency guards
  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);

  // Load brands list once on mount for filter dropdown
  useEffect(() => {
    brandsService.getAll().then(setBrands).catch(console.error);
  }, []);

  // Server-side paginated fetch on filter / search / sort change (Page 1)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    pageRef.current = 1;
    isFetchingRef.current = true;

    const activeBodyType = selectedBodyTypes[0] || '';
    const activeFuelType = selectedFuelTypes[0] || '';

    vehiclesService
      .getPaginated({
        page: 1,
        limit: 16,
        search: searchQuery,
        brand: selectedBrand,
        bodyType: activeBodyType,
        fuelType: activeFuelType,
        transmission: selectedTransmission,
        seats: selectedSeats ? parseInt(selectedSeats, 10) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        status: selectedStatus,
        sortBy,
      })
      .then(({ data, meta }) => {
        if (cancelled) return;
        setVehicles(data);
        const tPages = meta.totalPages || 1;
        setTotalPages(tPages);
        totalPagesRef.current = tPages;
        setTotalVehicles(meta.total || data.length);
        setLoading(false);
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 200);
      })
      .catch((err) => {
        console.error('Failed to load page 1 vehicles:', err);
        if (!cancelled) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    searchQuery,
    selectedBrand,
    selectedBodyTypes,
    selectedFuelTypes,
    selectedTransmission,
    selectedSeats,
    minPrice,
    maxPrice,
    selectedStatus,
    sortBy,
  ]);

  // Load next page function with lock guard
  const loadNextPage = useCallback(async () => {
    if (isFetchingRef.current || loading || pageRef.current >= totalPagesRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setLoadingMore(true);

    const nextPage = pageRef.current + 1;
    const activeBodyType = selectedBodyTypes[0] || '';
    const activeFuelType = selectedFuelTypes[0] || '';

    try {
      const { data, meta } = await vehiclesService.getPaginated({
        page: nextPage,
        limit: 16,
        search: searchQuery,
        brand: selectedBrand,
        bodyType: activeBodyType,
        fuelType: activeFuelType,
        transmission: selectedTransmission,
        seats: selectedSeats ? parseInt(selectedSeats, 10) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        status: selectedStatus,
        sortBy,
      });

      setVehicles((prev) => {
        const existingIds = new Set(prev.map((v) => v._id));
        const newItems = data.filter((v) => !existingIds.has(v._id));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      pageRef.current = nextPage;

      const tPages = meta.totalPages || 1;
      setTotalPages(tPages);
      totalPagesRef.current = tPages;
      setTotalVehicles(meta.total || 0);
    } catch (err) {
      console.error('Failed to load next page:', err);
    } finally {
      setLoadingMore(false);
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }
  }, [
    loading,
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

  // Infinite Scroll Observer on bottom sentinel with rootMargin tuning
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !isFetchingRef.current &&
            !loading &&
            !loadingMore &&
            pageRef.current < totalPagesRef.current
          ) {
            loadNextPage();
          }
        },
        {
          rootMargin: '0px 0px 200px 0px',
          threshold: 0,
        },
      );
      observerRef.current.observe(node);
    },
    [loading, loadingMore, loadNextPage],
  );

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

    const status = searchParams.get('status');
    setSelectedStatus(status || '');
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
    setSelectedStatus('');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedBrand ||
    selectedBodyTypes.length > 0 ||
    selectedFuelTypes.length > 0 ||
    selectedTransmission ||
    selectedSeats ||
    minPrice ||
    maxPrice ||
    selectedStatus;

  const parsedQuery = useMemo(() => {
    return searchQuery.trim() ? parseSearchQuery(searchQuery, brands) : null;
  }, [searchQuery, brands]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      if (selectedStatus === 'upcoming') {
        return v.status === 'upcoming';
      }
      return v.status === 'active' || v.status === 'upcoming';
    });

    // Combine explicit UI filters with parsed natural language search parameters
    const effectiveBrand = selectedBrand || parsedQuery?.brandSlug || '';
    const effectiveBodyTypes =
      selectedBodyTypes.length > 0 ? selectedBodyTypes : (parsedQuery?.bodyTypes || []);
    const effectiveFuelTypes =
      selectedFuelTypes.length > 0 ? selectedFuelTypes : (parsedQuery?.fuelTypes || []);
    const effectiveTransmission =
      selectedTransmission || (parsedQuery?.transmissions?.[0] || '');
    const effectiveSeats = selectedSeats || parsedQuery?.seats || '';

    const minVal = minPrice
      ? parseInt(minPrice, 10)
      : (parsedQuery?.minPrice !== undefined ? parsedQuery.minPrice : NaN);
    const maxVal = maxPrice
      ? parseInt(maxPrice, 10)
      : (parsedQuery?.maxPrice !== undefined ? parsedQuery.maxPrice : NaN);

    const keywordQuery = parsedQuery
      ? parsedQuery.remainingQuery
      : searchQuery.toLowerCase().trim().replace(/[\s-]+/g, ' ');

    if (keywordQuery) {
      const q = keywordQuery.toLowerCase().replace(/[\s-]+/g, ' ');
      result = result.filter((v) => {
        const text = `${v.brand} ${v.model} ${v.variant} ${v.brandSlug} ${v.bodyType} ${v.fuelType} ${(v.tags || []).join(' ')}`
          .toLowerCase()
          .replace(/[\s-]+/g, ' ');
        return text.includes(q);
      });
    }

    if (effectiveBrand) {
      result = result.filter(
        (v) =>
          v.brandSlug === effectiveBrand ||
          v.brand.toLowerCase() === effectiveBrand.toLowerCase(),
      );
    }

    if (effectiveBodyTypes.length > 0) {
      const wanted = effectiveBodyTypes.map((b) => b.toLowerCase());
      result = result.filter((v) => wanted.includes((v.bodyType || '').toLowerCase()));
    }

    if (effectiveFuelTypes.length > 0) {
      result = result.filter((v) =>
        effectiveFuelTypes.some((ft) => fuelMatchesFilter(v.fuelType, ft)),
      );
    }

    if (effectiveTransmission) {
      result = result.filter((v) =>
        transmissionMatchesFilter(v.transmission, effectiveTransmission),
      );
    }

    if (effectiveSeats) {
      result = result.filter((v) => matchesSeatFilter(v.seats, effectiveSeats));
    }

    if (!Number.isNaN(minVal) || !Number.isNaN(maxVal)) {
      result = result.filter((v) => {
        const price = v.priceFrom;
        if (price == null || price <= 0) return false;
        if (!Number.isNaN(minVal) && price < minVal) return false;
        if (!Number.isNaN(maxVal) && price > maxVal) return false;
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
        result = [...result].sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      default:
        break;
    }

    return result;
  }, [
    vehicles,
    searchQuery,
    parsedQuery,
    selectedBrand,
    selectedBodyTypes,
    selectedFuelTypes,
    selectedTransmission,
    selectedSeats,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const modelGroups = useMemo(() => {
    const groups = groupVehiclesByModel(filteredVehicles);
    switch (sortBy) {
      case 'price-low':
        return [...groups].sort(
          (a, b) => (a.minPrice || Number.POSITIVE_INFINITY) - (b.minPrice || Number.POSITIVE_INFINITY),
        );
      case 'price-high':
        return [...groups].sort(
          (a, b) => (b.maxPrice || b.minPrice || 0) - (a.maxPrice || a.minPrice || 0),
        );
      case 'cost-low':
        return [...groups].sort(
          (a, b) =>
            (a.minMonthlyCost || Number.POSITIVE_INFINITY) -
            (b.minMonthlyCost || Number.POSITIVE_INFINITY),
        );
      case 'newest':
        return [...groups].sort((a, b) => b.year - a.year);
      default:
        return groups;
    }
  }, [filteredVehicles, sortBy]);

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
  if (selectedStatus === 'upcoming') {
    activeFilterTags.push({
      label: '🔮 Upcoming Launches Only',
      clear: () => setSelectedStatus(''),
    });
  }

  return (
    <div className={styles.listingPage}>
      <div className={styles.listingHeader}>
        {selectedStatus === 'upcoming' ? (
          <>
            <div className={styles.listingBreadcrumb}>
              <Link href="/">Home</Link>
              <ChevronRight size={12} />
              <Link href="/new-cars">New Cars</Link>
              <ChevronRight size={12} />
              <span>Upcoming Launches</span>
            </div>
            <h1 className={styles.listingTitle}>🔮 Upcoming Cars in UAE (2026/2027)</h1>
            <p className={styles.listingSubtitle}>
              Discover future car launches, expected specs & estimated AED pricing. Stay ahead of the curve.
            </p>
          </>
        ) : (
          <>
            <div className={styles.listingBreadcrumb}>
              <Link href="/">Home</Link>
              <ChevronRight size={12} />
              <span>New Cars</span>
            </div>
            <h1 className={styles.listingTitle}>Explore New Cars</h1>
            <p className={styles.listingSubtitle}>
              Browse all new cars available in the UAE. Use filters to narrow down your options.
            </p>
          </>
        )}
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

          <div className={styles.filterBody}>
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
              Showing <strong>{modelGroups.length}</strong> models ({filteredVehicles.length}{totalVehicles > 0 ? ` of ${totalVehicles}` : ''} variants)
            </div>
            <div className={styles.resultsControls}>
              <div className={styles.viewModeToggle}>
                <button
                  type="button"
                  className={`${styles.viewModeBtn} ${viewMode === 'model' ? styles.viewModeBtnActive : ''}`}
                  onClick={() => setViewMode('model')}
                  title="Group by Brand Model"
                >
                  <LayoutGrid size={13} />
                  <span>Models</span>
                </button>
                <button
                  type="button"
                  className={`${styles.viewModeBtn} ${viewMode === 'variant' ? styles.viewModeBtnActive : ''}`}
                  onClick={() => setViewMode('variant')}
                  title="Show all individual variants"
                >
                  <List size={13} />
                  <span>All Variants</span>
                </button>
              </div>

              <div className={styles.customSortDropdown} ref={sortDropdownRef}>
                <button
                  type="button"
                  className={styles.sortTriggerBtn}
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <span>
                    {SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Popular'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      styles.sortChevron,
                      sortDropdownOpen && styles.sortChevronRotate,
                    )}
                  />
                </button>

                {sortDropdownOpen && (
                  <div className={styles.sortMenuOverlay}>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={cn(
                          styles.sortMenuItem,
                          sortBy === opt.value && styles.sortMenuItemActive,
                        )}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <Check size={14} color="var(--petrol)" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.resultsGrid}>
            {loading ? (
              <Skeleton type="card" count={6} />
            ) : filteredVehicles.length > 0 ? (
              viewMode === 'model' ? (
                modelGroups.map((mg) => (
                  <ModelCard key={mg.modelKey} modelGroup={mg} />
                ))
              ) : (
                filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))
              )
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

          {/* Sentinel & Infinite Scroll Loader / End of List Indicator */}
          {!loading && vehicles.length > 0 && (
            page < totalPages ? (
              <div ref={sentinelRef} className={styles.infiniteScrollSentinel}>
                {loadingMore ? (
                  <div className={styles.infiniteScrollLoader}>
                    <div className={styles.infiniteScrollSpinner} />
                    <span>Loading more cars…</span>
                  </div>
                ) : (
                  <div className={styles.infiniteScrollHint}>
                    <span>Scroll down to load more cars</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.endOfList}>
                ✓ You&apos;ve reached the end — Showing all {totalVehicles || vehicles.length} available cars
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewCarsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.resultsGrid} style={{ padding: '40px 20px' }}>
          <Skeleton type="card" count={6} />
        </div>
      }
    >
      <NewCarsContent />
    </Suspense>
  );
}
