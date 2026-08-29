'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight, ChevronDown, Plus, Car, X,
  DollarSign, Gauge, Fuel, Ruler, Shield, Sofa,
  Camera, Trophy, Zap, LayoutGrid,
} from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { vehiclesService } from '@/services/vehicles.service';
import { formatPrice } from '@/lib/utils';
import type { Vehicle, VehicleMedia } from '@/types/vehicle';
import styles from './compare.module.css';

/* ─── Spec Groups ─── */
interface SpecRow {
  label: string;
  getValue: (v: Vehicle) => string;
  bestFn?: 'min' | 'max';
}

interface SpecGroup {
  label: string;
  icon: typeof DollarSign;
  rows: SpecRow[];
}

const SPEC_GROUPS: SpecGroup[] = [
  {
    label: 'Pricing',
    icon: DollarSign,
    rows: [
      { label: 'Starting Price', getValue: (v) => formatPrice(v.priceFrom || 0), bestFn: 'min' },
      { label: 'Monthly Ownership', getValue: (v) => formatPrice(v.costToOwnMonthly || 0), bestFn: 'min' },
    ],
  },
  {
    label: 'Engine & Performance',
    icon: Gauge,
    rows: [
      { label: 'Engine', getValue: (v) => v.engine ? `${v.engine.displacement || ''} ${v.engine.type || ''}`.trim() || '—' : '—' },
      { label: 'Cylinders', getValue: (v) => v.engine?.cylinders ? `${v.engine.cylinders} cyl` : '—' },
      { label: 'Power', getValue: (v) => v.engine?.power || '—', bestFn: 'max' },
      { label: 'Torque', getValue: (v) => v.engine?.torque || '—', bestFn: 'max' },
      { label: '0-100 km/h', getValue: (v) => v.performance?.acceleration0To100 ? `${v.performance.acceleration0To100}s` : '—', bestFn: 'min' },
      { label: 'Top Speed', getValue: (v) => v.performance?.topSpeed ? `${v.performance.topSpeed} km/h` : '—', bestFn: 'max' },
    ],
  },
  {
    label: 'Fuel & Efficiency',
    icon: Fuel,
    rows: [
      { label: 'Fuel Type', getValue: (v) => v.fuelType || '—' },
      { label: 'Combined Economy', getValue: (v) => v.fuelConsumption?.combined ? `${v.fuelConsumption.combined} ${v.fuelConsumption.unit || 'L/100km'}` : '—', bestFn: 'min' },
      { label: 'Transmission', getValue: (v) => v.transmission || '—' },
      { label: 'Drivetrain', getValue: (v) => v.drivetrain || '—' },
    ],
  },
  {
    label: 'Dimensions & Capacity',
    icon: Ruler,
    rows: [
      { label: 'Body Type', getValue: (v) => v.bodyType || '—' },
      { label: 'Seats', getValue: (v) => v.seats ? String(v.seats) : '—', bestFn: 'max' },
      { label: 'Doors', getValue: (v) => v.doors ? String(v.doors) : '—' },
      { label: 'Length', getValue: (v) => v.specifications?.dimensions?.lengthMm ? `${v.specifications.dimensions.lengthMm} mm` : '—' },
      { label: 'Width', getValue: (v) => v.specifications?.dimensions?.widthMm ? `${v.specifications.dimensions.widthMm} mm` : '—' },
      { label: 'Height', getValue: (v) => v.specifications?.dimensions?.heightMm ? `${v.specifications.dimensions.heightMm} mm` : '—' },
      { label: 'Wheelbase', getValue: (v) => v.specifications?.dimensions?.wheelbaseMm ? `${v.specifications.dimensions.wheelbaseMm} mm` : '—' },
      { label: 'Boot Space', getValue: (v) => v.specifications?.capacity?.bootSpaceLitres ? `${v.specifications.capacity.bootSpaceLitres} L` : '—', bestFn: 'max' },
      { label: 'Fuel Tank', getValue: (v) => v.specifications?.capacity?.fuelTankLitres ? `${v.specifications.capacity.fuelTankLitres} L` : '—', bestFn: 'max' },
      { label: 'Kerb Weight', getValue: (v) => v.specifications?.weight?.kerbWeightKg ? `${v.specifications.weight.kerbWeightKg} kg` : '—', bestFn: 'min' },
    ],
  },
  {
    label: 'Safety',
    icon: Shield,
    rows: [
      { label: 'Airbags', getValue: (v) => v.specifications?.safety?.airbags ? String(v.specifications.safety.airbags) : '—', bestFn: 'max' },
      { label: 'ABS', getValue: (v) => v.specifications?.safety?.abs ? '✓' : '—' },
      { label: 'Traction Control', getValue: (v) => v.specifications?.safety?.tractionControl ? '✓' : '—' },
      { label: 'Stability Control', getValue: (v) => v.specifications?.safety?.stabilityControl ? '✓' : '—' },
    ],
  },
];

const ANGLE_TABS = [
  { key: 'all', label: 'All Photos', icon: LayoutGrid },
  { key: 'exterior-front', label: 'Front' },
  { key: 'exterior-side', label: 'Side' },
  { key: 'exterior-rear', label: 'Rear' },
  { key: 'interior', label: 'Interior' },
  { key: 'detail', label: 'Detail' },
];

/* ─── Component ─── */
function CompareContent() {
  const searchParams = useSearchParams();
  const { compareList, addToCompare, removeFromCompare } = useCompare();

  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [detailedVehicles, setDetailedVehicles] = useState<Record<string, Vehicle>>({});
  const [loading, setLoading] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [hideCommon, setHideCommon] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [angleFilter, setAngleFilter] = useState('all');
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<string, number>>({});

  // Load all vehicles for the selector
  useEffect(() => {
    vehiclesService.getAll({ limit: 50 }).then((vList) => {
      setAllVehicles(vList);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Seed from URL query params if compare list is empty
  useEffect(() => {
    const slugsParam = searchParams.get('slugs');
    if (slugsParam && compareList.length === 0) {
      const slugs = slugsParam.split(',').filter(Boolean);
      slugs.forEach((s) => addToCompare(s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Auto-select first 2 if nothing selected after vehicles load
  useEffect(() => {
    if (!loading && allVehicles.length >= 2 && compareList.length === 0) {
      addToCompare(allVehicles[0].slug);
      addToCompare(allVehicles[1].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allVehicles]);

  // Fetch detailed data for each selected slug
  useEffect(() => {
    compareList.forEach((slug) => {
      if (!detailedVehicles[slug]) {
        vehiclesService.getBySlug(slug).then((v) => {
          if (v) setDetailedVehicles((prev) => ({ ...prev, [slug]: v }));
        }).catch(console.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareList]);

  // Resolved vehicles
  const filledVehicles = useMemo(() => {
    return compareList
      .map((slug) => detailedVehicles[slug] || allVehicles.find((v) => v.slug === slug) || null)
      .filter(Boolean) as Vehicle[];
  }, [compareList, detailedVehicles, allVehicles]);

  const handleAdd = useCallback((slug: string) => {
    if (slug) addToCompare(slug);
  }, [addToCompare]);

  const handleRemove = useCallback((slug: string) => {
    removeFromCompare(slug);
  }, [removeFromCompare]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  /* ─── Helpers ─── */
  const getBestIndex = (row: SpecRow): number | null => {
    if (!row.bestFn || filledVehicles.length < 2) return null;
    const values = filledVehicles.map((v) => {
      const raw = row.getValue(v);
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? null : num;
    });
    const validValues = values.filter((v) => v !== null) as number[];
    if (validValues.length < 2) return null;
    const target = row.bestFn === 'min' ? Math.min(...validValues) : Math.max(...validValues);
    return values.indexOf(target);
  };

  const isRowDifferent = (row: SpecRow): boolean => {
    if (filledVehicles.length < 2) return true;
    const values = filledVehicles.map((v) => row.getValue(v));
    return new Set(values).size > 1;
  };

  const getFilteredMedia = (vehicle: Vehicle): VehicleMedia[] => {
    const items = vehicle.mediaItems || [];
    if (!items.length) return vehicle.imageUrl ? [{ url: vehicle.imageUrl, isPrimary: true }] : [];
    let filtered = items;
    if (angleFilter !== 'all') {
      const angleFiltered = filtered.filter((m) => m.angleTag === angleFilter);
      if (angleFiltered.length > 0) filtered = angleFiltered;
    }
    return filtered.length > 0 ? filtered : (vehicle.imageUrl ? [{ url: vehicle.imageUrl, isPrimary: true }] : []);
  };

  /* ─── Verdict Computation ─── */
  const verdicts = useMemo(() => {
    if (filledVehicles.length < 2) return [];
    const results: { label: string; icon: typeof DollarSign; winner: string; stat: string }[] = [];

    // Best Value
    const prices = filledVehicles.map((v) => v.priceFrom || Infinity);
    const minPriceIdx = prices.indexOf(Math.min(...prices));
    if (prices[minPriceIdx] !== Infinity) {
      results.push({
        label: 'Best Value',
        icon: DollarSign,
        winner: `${filledVehicles[minPriceIdx].brand} ${filledVehicles[minPriceIdx].model}`,
        stat: formatPrice(filledVehicles[minPriceIdx].priceFrom || 0),
      });
    }

    // Fastest
    const accel = filledVehicles.map((v) => v.performance?.acceleration0To100 ?? Infinity);
    const fastestIdx = accel.indexOf(Math.min(...accel));
    if (accel[fastestIdx] !== Infinity) {
      results.push({
        label: 'Fastest (0-100)',
        icon: Zap,
        winner: `${filledVehicles[fastestIdx].brand} ${filledVehicles[fastestIdx].model}`,
        stat: `${filledVehicles[fastestIdx].performance!.acceleration0To100}s`,
      });
    }

    // Most Efficient
    const fuel = filledVehicles.map((v) => v.fuelConsumption?.combined ?? Infinity);
    const efficientIdx = fuel.indexOf(Math.min(...fuel));
    if (fuel[efficientIdx] !== Infinity) {
      results.push({
        label: 'Most Efficient',
        icon: Fuel,
        winner: `${filledVehicles[efficientIdx].brand} ${filledVehicles[efficientIdx].model}`,
        stat: `${filledVehicles[efficientIdx].fuelConsumption!.combined} L/100km`,
      });
    }

    // Most Spacious
    const boot = filledVehicles.map((v) => v.specifications?.capacity?.bootSpaceLitres ?? 0);
    const spaciousIdx = boot.indexOf(Math.max(...boot));
    if (boot[spaciousIdx] > 0) {
      results.push({
        label: 'Most Spacious',
        icon: Sofa,
        winner: `${filledVehicles[spaciousIdx].brand} ${filledVehicles[spaciousIdx].model}`,
        stat: `${filledVehicles[spaciousIdx].specifications!.capacity!.bootSpaceLitres} L boot`,
      });
    }

    return results;
  }, [filledVehicles]);

  /* ─── Feature comparison ─── */
  const featureData = useMemo(() => {
    if (filledVehicles.length < 2) return [];
    const allFeatureNames = new Set<string>();
    const categoryMap = new Map<string, Set<string>>();

    filledVehicles.forEach((v) => {
      (v.features || []).forEach((f) => {
        allFeatureNames.add(f.name);
        if (!categoryMap.has(f.category)) categoryMap.set(f.category, new Set());
        categoryMap.get(f.category)!.add(f.name);
      });
    });

    const categories: { category: string; features: { name: string; has: boolean[] }[] }[] = [];
    categoryMap.forEach((featureNames, category) => {
      const features = Array.from(featureNames).map((name) => ({
        name,
        has: filledVehicles.map((v) => (v.features || []).some((f) => f.name === name)),
      }));
      categories.push({ category, features });
    });

    return categories;
  }, [filledVehicles]);

  const emptySlotCount = Math.max(0, (filledVehicles.length < 2 ? 2 : filledVehicles.length < 4 ? 1 : 0));

  if (loading) {
    return (
      <div className={styles.comparePage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          Loading vehicles...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.comparePage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Compare</span>
      </div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Compare cars before you buy.</h1>
        <p className={styles.pageSubtitle}>
          Put vehicles side by side and see the differences that actually matter.
        </p>
      </div>

      {/* Vehicle Picker */}
      <div className={styles.pickerSection}>
        {filledVehicles.map((vehicle) => (
          <div key={vehicle.slug} className={`${styles.pickerSlot} ${styles.pickerSlotFilled}`}>
            <button className={styles.removeBtn} onClick={() => handleRemove(vehicle.slug)} title="Remove">
              <X size={14} />
            </button>
            <div className={styles.pickerSlotContent}>
              <div className={styles.pickerImageWrap}>
                {vehicle.imageUrl ? (
                  <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} />
                ) : (
                  <Car size={36} color="#94a3b8" />
                )}
              </div>
              <div className={styles.pickerBrand}>{vehicle.brand}</div>
              <div className={styles.pickerModel}>{vehicle.model}</div>
              <div className={styles.pickerVariant}>{vehicle.variant}</div>
              <div className={styles.pickerPrice}>{formatPrice(vehicle.priceFrom || 0)}</div>
            </div>
          </div>
        ))}

        {/* Add Slots */}
        {Array.from({ length: emptySlotCount }).map((_, i) => (
          <div key={`add-${i}`} className={styles.pickerSlot}>
            <div className={styles.addSlotContent}>
              <div className={styles.addIcon}><Plus size={24} /></div>
              <div className={styles.addText}>Add Vehicle</div>
              <select
                className={styles.addSelect}
                value=""
                onChange={(e) => handleAdd(e.target.value)}
              >
                <option value="">Select a vehicle...</option>
                {allVehicles
                  .filter((v) => v.status === 'active' || v.status === 'upcoming')
                  .filter((v) => !compareList.includes(v.slug))
                  .map((v) => (
                    <option key={v._id} value={v.slug}>
                      {v.brand} {v.model} — {v.variant}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {filledVehicles.length >= 2 && (
        <>
          {/* Verdict Cards */}
          {verdicts.length > 0 && (
            <div className={styles.verdictSection}>
              <h2 className={styles.sectionHeading}>
                <Trophy size={20} /> Quick Verdict
              </h2>
              <div className={styles.verdictGrid}>
                {verdicts.map((v) => (
                  <div key={v.label} className={styles.verdictCard}>
                    <div className={styles.verdictIcon}>
                      <v.icon size={20} />
                    </div>
                    <div className={styles.verdictLabel}>{v.label}</div>
                    <div className={styles.verdictWinner}>{v.winner}</div>
                    <div className={styles.verdictStat}>{v.stat}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options Bar */}
          <div className={styles.optionsBar}>
            <span className={styles.optionsTitle}>View Options</span>
            <div className={styles.optionsToggles}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={hideCommon} onChange={(e) => setHideCommon(e.target.checked)} />
                Hide Common Specs
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={showDiffOnly} onChange={(e) => setShowDiffOnly(e.target.checked)} />
                Highlight Differences
              </label>
            </div>
          </div>

          {/* Spec Comparison Table */}
          <div className={styles.tableContainer}>
            <div className={styles.tableScrollWrap}>
              <table className={styles.specTable}>
                <thead>
                  <tr>
                    <th>Specification</th>
                    {filledVehicles.map((v) => (
                      <th key={v._id}>{v.brand} {v.model}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_GROUPS.map((group) => {
                    const visibleRows = showDiffOnly
                      ? group.rows.filter((r) => isRowDifferent(r))
                      : group.rows;

                    if (visibleRows.length === 0) return null;
                    const isCollapsed = collapsedGroups[group.label];

                    return (
                      <SpecGroupRows
                        key={group.label}
                        group={group}
                        visibleRows={visibleRows}
                        isCollapsed={isCollapsed}
                        toggleGroup={toggleGroup}
                        filledVehicles={filledVehicles}
                        getBestIndex={getBestIndex}
                        isRowDifferent={isRowDifferent}
                        showDiffOnly={showDiffOnly}
                        hideCommon={hideCommon}
                        colCount={filledVehicles.length}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Checklist */}
          {featureData.length > 0 && (
            <div className={styles.featureSection}>
              <h2 className={styles.sectionHeading}>
                <Sofa size={20} /> Feature Comparison
              </h2>
              <div className={styles.tableScrollWrap}>
                <table className={styles.featureTable}>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      {filledVehicles.map((v) => (
                        <th key={v._id}>{v.brand} {v.model}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featureData.map((cat) => (
                      <FeatureCategoryRows
                        key={cat.category}
                        category={cat.category}
                        features={cat.features}
                        colCount={filledVehicles.length}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual Gallery */}
          <div className={styles.gallerySection}>
            <div className={styles.gallerySectionHeader}>
              <h2 className={styles.sectionHeading}>
                <Camera size={20} /> Visual Comparison
              </h2>
              <div className={styles.angleTabs}>
                {ANGLE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.angleTab} ${angleFilter === tab.key ? styles.angleTabActive : ''}`}
                    onClick={() => { setAngleFilter(tab.key); setActivePhotoIndices({}); }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={styles.galleryGrid}
              style={{ gridTemplateColumns: `repeat(${filledVehicles.length}, 1fr)` }}
            >
              {filledVehicles.map((vehicle) => {
                const filteredMedia = getFilteredMedia(vehicle);
                const activeIdx = activePhotoIndices[vehicle._id] || 0;
                const currentMedia = filteredMedia[activeIdx] || filteredMedia[0];

                return (
                  <div key={vehicle._id} className={styles.galleryCard}>
                    <div className={styles.galleryImageWrap}>
                      {currentMedia ? (
                        <img
                          key={currentMedia.url}
                          src={currentMedia.url}
                          alt={currentMedia.altText || `${vehicle.brand} ${vehicle.model}`}
                          className={styles.galleryPhoto}
                        />
                      ) : (
                        <Car size={36} color="#94a3b8" />
                      )}
                      <div className={styles.galleryBadge}>
                        {vehicle.brand} {vehicle.model}
                      </div>
                      {filteredMedia.length > 1 && (
                        <div className={styles.galleryCountBadge}>
                          {activeIdx + 1} / {filteredMedia.length}
                        </div>
                      )}
                    </div>
                    {filteredMedia.length > 1 && (
                      <div className={styles.galleryThumbnails}>
                        {filteredMedia.slice(0, 6).map((img, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            className={`${styles.thumbBtn} ${activeIdx === imgIdx ? styles.thumbBtnActive : ''}`}
                            onClick={() => setActivePhotoIndices((p) => ({ ...p, [vehicle._id]: imgIdx }))}
                          >
                            <img src={img.url} alt={img.altText || `Thumbnail ${imgIdx + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {filledVehicles.length < 2 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Car size={28} /></div>
          <h3 className={styles.emptyTitle}>Select vehicles to compare</h3>
          <p className={styles.emptyDesc}>
            Choose at least two vehicles from the selectors above to see a side-by-side comparison.
          </p>
          <Link href="/new-cars" className="btn-primary">
            Browse Cars
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components for table rows ─── */
function SpecGroupRows({
  group,
  visibleRows,
  isCollapsed,
  toggleGroup,
  filledVehicles,
  getBestIndex,
  isRowDifferent,
  showDiffOnly,
  hideCommon,
  colCount,
}: {
  group: SpecGroup;
  visibleRows: SpecRow[];
  isCollapsed: boolean;
  toggleGroup: (label: string) => void;
  filledVehicles: Vehicle[];
  getBestIndex: (row: SpecRow) => number | null;
  isRowDifferent: (row: SpecRow) => boolean;
  showDiffOnly: boolean;
  hideCommon: boolean;
  colCount: number;
}) {
  return (
    <>
      <tr className={styles.groupRow} onClick={() => toggleGroup(group.label)}>
        <td colSpan={colCount + 1}>
          <ChevronDown
            size={14}
            className={`${styles.groupChevron} ${isCollapsed ? styles.groupChevronCollapsed : ''}`}
          />
          <group.icon size={14} />
          {group.label}
        </td>
      </tr>
      {!isCollapsed && visibleRows.map((row) => {
        const isDiff = isRowDifferent(row);
        if (hideCommon && !isDiff) return null;
        const bestIdx = getBestIndex(row);
        const shouldHighlight = showDiffOnly && isDiff;

        return (
          <tr key={row.label} className={shouldHighlight ? styles.diffHighlight : ''}>
            <td>{row.label}</td>
            {filledVehicles.map((v, i) => (
              <td key={v._id} className={bestIdx === i ? styles.bestValue : ''}>
                {row.getValue(v)}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

function FeatureCategoryRows({
  category,
  features,
  colCount,
}: {
  category: string;
  features: { name: string; has: boolean[] }[];
  colCount: number;
}) {
  return (
    <>
      <tr className={styles.featureCategoryRow}>
        <td colSpan={colCount + 1}>{category}</td>
      </tr>
      {features.map((f) => (
        <tr key={f.name}>
          <td>{f.name}</td>
          {f.has.map((has, i) => (
            <td key={i} className={has ? styles.featureCheck : styles.featureMissing}>
              {has ? '✓' : '✗'}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Page Export ─── */
export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className={styles.comparePage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          Loading compare...
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
