'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Search, X } from 'lucide-react';
import { brandsService } from '@/services/brands.service';
import { vehiclesService } from '@/services/vehicles.service';
import type { Brand } from '@/types/brand';
import type { Vehicle } from '@/types/vehicle';
import { getBrandLogoUrl } from '@/lib/brandLogos';
import ModelCard from '@/components/ui/ModelCard';
import Skeleton from '@/components/ui/Skeleton';
import { groupVehiclesByModel } from '@/lib/modelGroup';
import styles from '@/app/brands/brands.module.css';

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandVehicles, setBrandVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const modelGroups = useMemo(() => {
    const groups = groupVehiclesByModel(brandVehicles);
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase().trim();
    return groups.filter(
      (mg) =>
        (mg.model?.toLowerCase() ?? '').includes(q) ||
        (mg.bodyType?.toLowerCase() ?? '').includes(q) ||
        mg.fuelTypes?.some((ft) => ft?.toLowerCase().includes(q)) ||
        mg.variants.some(
          (v) =>
            (v.variant?.toLowerCase() ?? '').includes(q) ||
            (v.bodyType?.toLowerCase() ?? '').includes(q) ||
            (v.fuelType?.toLowerCase() ?? '').includes(q),
        ),
    );
  }, [brandVehicles, searchQuery]);

  const allModelGroups = useMemo(() => groupVehiclesByModel(brandVehicles), [brandVehicles]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLoading(true);
    setSearchQuery('');

    (async () => {
      try {
        const brandDoc = await brandsService.getBySlug(slug);
        if (cancelled) return;

        if (brandDoc) {
          setBrand(brandDoc);
        } else {
          setBrand(null);
          setBrandVehicles([]);
          setLoading(false);
          return;
        }

        const vehicles = await vehiclesService.getByBrandSlug(slug);
        if (cancelled) return;
        setBrandVehicles(vehicles);
      } catch {
        if (!cancelled) {
          setBrand(null);
          setBrandVehicles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Skeleton type="text" width="180px" height="14px" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '24px 0' }}>
          <Skeleton width="64px" height="64px" />
          <div style={{ flex: 1 }}>
            <Skeleton type="title" width="40%" height="28px" />
            <Skeleton type="text" width="60%" height="14px" />
          </div>
        </div>
        <div className={styles.grid} style={{ marginTop: 30 }}>
          <Skeleton type="card" count={6} />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/brands">Brands</Link>
          <ChevronRight size={12} />
          <span>Not Found</span>
        </div>
        <h1 style={{ marginTop: 40, textAlign: 'center' }}>Brand not found</h1>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/brands" className="btn-primary">
            View All Brands
          </Link>
        </div>
      </div>
    );
  }

  const hasResults = modelGroups.length > 0;
  const isFiltered = searchQuery.trim().length > 0;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <Link href="/brands">Brands</Link>
        <ChevronRight size={12} />
        <span>{brand.name}</span>
      </div>

      {/* Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandHeaderLogo}>
          <img
            src={getBrandLogoUrl(brand.slug, brand.name)}
            alt={brand.name}
            style={{ maxHeight: 54, maxWidth: 70, objectFit: 'contain' }}
          />
        </div>
        <div className={styles.brandHeaderInfo}>
          <h1>{brand.name} Cars in UAE</h1>
          <p>
            Explore all current {brand.name} models, starting prices, and transparent monthly cost of ownership.
          </p>
        </div>
      </div>

      {/* Models section header with live search */}
      <div className={styles.modelsTopBar}>
        <h2 className={styles.modelsHeading}>
          {brand.name} Models
          <span className={styles.modelsCount}>
            {isFiltered
              ? `${modelGroups.length} of ${allModelGroups.length}`
              : allModelGroups.length}
          </span>
        </h2>

        {/* Search bar — only shown when there are models */}
        {allModelGroups.length > 0 && (
          <div className={styles.modelSearchBar} id="brand-model-search">
            <Search size={15} className={styles.modelSearchIcon} />
            <input
              type="text"
              className={styles.modelSearchInput}
              placeholder={`Search ${brand.name} models…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={`Search ${brand.name} models`}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.modelSearchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Models Grid */}
      {hasResults ? (
        <div className={styles.modelsGrid}>
          {modelGroups.map((mg) => (
            <ModelCard key={mg.modelKey} modelGroup={mg} />
          ))}
        </div>
      ) : isFiltered ? (
        /* No search results */
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>
            <Search size={28} />
          </div>
          <p className={styles.noResultsTitle}>No models match &ldquo;{searchQuery}&rdquo;</p>
          <p className={styles.noResultsDesc}>Try a different name or clear the search.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* No vehicles at all */
        <div className={styles.noResults}>
          <p>New {brand.name} models are being catalogued. Check back soon.</p>
          <Link href="/new-cars" className="btn-primary" style={{ marginTop: 16 }}>
            Browse All Cars
          </Link>
        </div>
      )}
    </div>
  );
}
