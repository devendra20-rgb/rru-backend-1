'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Car, ChevronDown, Camera, Palette, LayoutGrid } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { formatPrice } from '@/lib/utils';
import type { Vehicle, VehicleMedia } from '@/types/vehicle';
import styles from './compare.module.css';

interface CompareGroup {
  label: string;
  rows: { label: string; getValue: (v: Vehicle) => string; bestFn?: 'min' | 'max' }[];
}

const compareGroups: CompareGroup[] = [
  {
    label: 'Pricing',
    rows: [
      { label: 'Starting Price', getValue: (v) => formatPrice(v.priceFrom || 0), bestFn: 'min' },
      { label: 'Monthly Ownership', getValue: (v) => formatPrice(v.costToOwnMonthly || 0), bestFn: 'min' },
    ],
  },
  {
    label: 'Engine & Performance',
    rows: [
      { label: 'Engine', getValue: (v) => v.engine ? `${v.engine.displacement} ${v.engine.type}` : '—' },
      { label: 'Power', getValue: (v) => v.engine?.power || '—' },
      { label: 'Torque', getValue: (v) => v.engine?.torque || '—' },
      { label: '0-100 km/h', getValue: (v) => v.performance?.acceleration0To100 ? `${v.performance.acceleration0To100}s` : '—', bestFn: 'min' },
      { label: 'Top Speed', getValue: (v) => v.performance?.topSpeed ? `${v.performance.topSpeed} km/h` : '—', bestFn: 'max' },
    ],
  },
  {
    label: 'Fuel & Efficiency',
    rows: [
      { label: 'Fuel Type', getValue: (v) => v.fuelType },
      { label: 'Combined', getValue: (v) => v.fuelConsumption?.combined ? `${v.fuelConsumption.combined} ${v.fuelConsumption.unit}` : '—', bestFn: 'min' },
    ],
  },
  {
    label: 'Practicality',
    rows: [
      { label: 'Body Type', getValue: (v) => v.bodyType },
      { label: 'Seats', getValue: (v) => String(v.seats), bestFn: 'max' },
      { label: 'Doors', getValue: (v) => v.doors ? String(v.doors) : '—' },
      { label: 'Transmission', getValue: (v) => v.transmission },
      { label: 'Drivetrain', getValue: (v) => v.drivetrain || '—' },
    ],
  },
];

// Angle tabs for filtering gallery
const ANGLE_TABS = [
  { key: 'all', label: 'All Photos', icon: LayoutGrid },
  { key: 'exterior-front', label: 'Front' },
  { key: 'exterior-side', label: 'Side' },
  { key: 'exterior-rear', label: 'Rear' },
  { key: 'interior', label: 'Interior' },
  { key: 'detail', label: 'Detail' },
];

export default function ComparePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<(string | null)[]>([null, null, null, null]);
  // Stores fully-detailed vehicle data (with all mediaItems) for selected vehicles
  const [detailedVehicles, setDetailedVehicles] = useState<Record<string, Vehicle>>({});
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<string, number>>({});
  // Per-vehicle selected color filter: vehicleId -> colorId | null
  const [selectedColorFilter, setSelectedColorFilter] = useState<Record<string, string | null>>({});
  // Shared angle filter across all vehicles
  const [angleFilter, setAngleFilter] = useState<string>('all');

  useEffect(() => {
    vehiclesService.getAll({ limit: 50 }).then((vList) => {
      setVehicles(vList);
      if (vList.length >= 2) {
        setSelectedSlugs([vList[0].slug, vList[1].slug, null, null]);
      }
    }).catch(console.error);
  }, []);

  // Fetch full details (with all media) for each selected slug
  useEffect(() => {
    const filledSlugs = selectedSlugs.filter(Boolean) as string[];
    filledSlugs.forEach((slug) => {
      const alreadyFetched = Object.values(detailedVehicles).some((v) => v.slug === slug);
      if (!alreadyFetched) {
        vehiclesService.getBySlug(slug).then((v) => {
          if (v) setDetailedVehicles((prev) => ({ ...prev, [slug]: v }));
        }).catch(console.error);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlugs]);

  // Use detailed vehicle data (with mediaItems) if available, else fall back to list data
  const selectedVehicles = useMemo(
    () => selectedSlugs.map((slug) => {
      if (!slug) return null;
      return detailedVehicles[slug] || vehicles.find((v) => v.slug === slug) || null;
    }),
    [selectedSlugs, vehicles, detailedVehicles]
  );

  const filledVehicles = selectedVehicles.filter(Boolean) as Vehicle[];
  const colCount = Math.max(filledVehicles.length, 2);

  const handleSelect = (index: number, slug: string) => {
    const updated = [...selectedSlugs];
    updated[index] = slug || null;
    setSelectedSlugs(updated);
  };

  const handleRemove = (index: number) => {
    const updated = [...selectedSlugs];
    updated[index] = null;
    setSelectedSlugs(updated);
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const setPhotoIndex = (vehicleId: string, idx: number) => {
    setActivePhotoIndices((prev) => ({ ...prev, [vehicleId]: idx }));
  };

  const setColorFilter = (vehicleId: string, colorId: string | null) => {
    setSelectedColorFilter((prev) => ({ ...prev, [vehicleId]: colorId }));
    // Reset photo index when filter changes
    setActivePhotoIndices((prev) => ({ ...prev, [vehicleId]: 0 }));
  };

  // Get filtered media for a vehicle
  const getFilteredMedia = (vehicle: Vehicle): VehicleMedia[] => {
    const items = vehicle.mediaItems || [];
    if (!items.length) return vehicle.imageUrl ? [{ url: vehicle.imageUrl, isPrimary: true }] : [];

    const colorFilter = selectedColorFilter[vehicle._id];
    let filtered = items;

    // Color filter: show color-specific images OR images without colorId (shared)
    if (colorFilter) {
      filtered = items.filter((m) => !m.colorId || m.colorId === colorFilter);
    }

    // Angle filter
    if (angleFilter !== 'all') {
      const angleFiltered = filtered.filter((m) => m.angleTag === angleFilter);
      // Fall back to all if no matches
      if (angleFiltered.length > 0) filtered = angleFiltered;
    }

    // Always ensure at least the primary image shows
    if (filtered.length === 0 && vehicle.imageUrl) {
      return [{ url: vehicle.imageUrl, isPrimary: true }];
    }

    return filtered;
  };

  const getBestIndex = (row: CompareGroup['rows'][0]): number | null => {
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

  const isRowDifferent = (row: CompareGroup['rows'][0]): boolean => {
    if (filledVehicles.length < 2) return true;
    const values = filledVehicles.map((v) => row.getValue(v));
    return new Set(values).size > 1;
  };

  // Get unique color-specific images for a vehicle (used to build the color filter palette)
  const getColorLinkedMedia = (vehicle: Vehicle): { colorId: string; colorName: string; hexCode?: string; url: string }[] => {
    const items = vehicle.mediaItems || [];
    const result: { colorId: string; colorName: string; hexCode?: string; url: string }[] = [];
    const seen = new Set<string>();

    for (const m of items) {
      if (!m.colorId || seen.has(m.colorId)) continue;
      seen.add(m.colorId);

      // Match with vehicle.colors to get name/hexCode
      const colorInfo = vehicle.colors?.find((c: any) => c._id === m.colorId || c.id === m.colorId);
      result.push({
        colorId: m.colorId,
        colorName: colorInfo?.name || 'Color',
        hexCode: colorInfo?.hexCode,
        url: m.url,
      });
    }
    return result;
  };

  return (
    <div className={styles.comparePage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Compare</span>
      </div>

      <h1 className={styles.pageTitle}>Compare Cars</h1>
      <p className={styles.pageSubtitle}>
        Select up to 4 vehicles to compare photos, colors, specifications, and costs side by side.
      </p>

      {/* Vehicle Selectors */}
      <div className={styles.selectorRow}>
        {selectedSlugs.map((slug, index) => {
          const vehicle = slug ? vehicles.find((v) => v.slug === slug) : null;
          return (
            <div
              key={index}
              className={`${styles.selectorCard} ${vehicle ? styles.selectorCardFilled : styles.selectorCardEmpty}`}
            >
              {vehicle ? (
                <>
                  <button
                    className={styles.selectorRemoveBtn}
                    onClick={() => handleRemove(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                  <div className={styles.selectorCarIcon}>
                    {vehicle.imageUrl ? (
                      <img src={vehicle.imageUrl} alt={vehicle.model} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Car size={24} />
                    )}
                  </div>
                  <div className={styles.selectorCarName}>
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className={styles.selectorCarVariant}>
                    {vehicle.variant}
                  </div>
                  <div className={styles.selectorCarPrice}>
                    {formatPrice(vehicle.priceFrom || 0)}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.selectorAddIcon}>
                    <Plus size={20} />
                  </div>
                  <div className={styles.selectorAddText}>Add Vehicle</div>
                </>
              )}
              <select
                className={styles.selectorSelect}
                value={slug || ''}
                onChange={(e) => handleSelect(index, e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles
                  .filter((v) => v.status === 'active' || v.status === 'upcoming')
                  .map((v) => (
                    <option key={v._id} value={v.slug} disabled={selectedSlugs.includes(v.slug)}>
                      {v.brand} {v.model} — {v.variant}
                    </option>
                  ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Visual Photo Comparison Section */}
      {filledVehicles.length >= 2 && (
        <div className={styles.imageComparisonSection}>
          <div className={styles.imageComparisonHeader}>
            <h3 className={styles.imageComparisonTitle}>
              <Camera size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Visual &amp; Design Comparison
            </h3>
            {/* Angle Filter Tabs */}
            <div className={styles.imageComparisonTabs}>
              {ANGLE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`${styles.imageTab} ${angleFilter === tab.key ? styles.imageTabActive : ''}`}
                  onClick={() => { setAngleFilter(tab.key); setActivePhotoIndices({}); }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={styles.imageGrid}
            style={{ gridTemplateColumns: `repeat(${filledVehicles.length}, 1fr)` }}
          >
            {filledVehicles.map((vehicle) => {
              const activeIdx = activePhotoIndices[vehicle._id] || 0;
              const filteredMedia = getFilteredMedia(vehicle);
              const currentMedia = filteredMedia[activeIdx] || filteredMedia[0];
              const colorLinked = getColorLinkedMedia(vehicle);
              const activeColorFilter = selectedColorFilter[vehicle._id] || null;
              const photoCount = filteredMedia.length;

              return (
                <div key={vehicle._id} className={styles.vehicleImageCard}>
                  {/* Main Image */}
                  <div className={styles.vehicleImageWrapper}>
                    {currentMedia ? (
                      <img
                        key={currentMedia.url}
                        src={currentMedia.url}
                        alt={currentMedia.altText || `${vehicle.brand} ${vehicle.model}`}
                        className={styles.vehiclePhoto}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
                        <Car size={36} />
                      </div>
                    )}
                    <div className={styles.vehiclePhotoBadge}>
                      {vehicle.brand} {vehicle.model}
                    </div>
                    {photoCount > 1 && (
                      <div className={styles.photoCountBadge}>
                        {activeIdx + 1} / {photoCount}
                      </div>
                    )}
                    {/* Angle tag pill */}
                    {currentMedia?.angleTag && (
                      <div className={styles.angleTagPill}>
                        {currentMedia.angleTag.replace('-', ' ')}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {filteredMedia.length > 1 && (
                    <div className={styles.thumbnailRow}>
                      {filteredMedia.slice(0, 6).map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          className={`${styles.thumbnailBtn} ${activeIdx === imgIdx ? styles.thumbnailBtnActive : ''}`}
                          onClick={() => setPhotoIndex(vehicle._id, imgIdx)}
                          title={img.altText || img.angleTag || `Photo ${imgIdx + 1}`}
                        >
                          <img src={img.url} alt={img.altText || `Thumbnail ${imgIdx + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Color-Specific Photo Filter + Color Swatches */}
                  <div className={styles.colorPaletteRow}>
                    <div className={styles.colorPaletteLeft}>
                      <Palette size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      <span className={styles.colorPaletteTitle}>Colors:</span>
                    </div>
                    <div className={styles.colorSwatches}>
                      {/* "All" swatch */}
                      <button
                        type="button"
                        className={`${styles.colorSwatchBtn} ${!activeColorFilter ? styles.colorSwatchBtnActive : ''}`}
                        onClick={() => setColorFilter(vehicle._id, null)}
                        title="All colors"
                      >
                        <span className={styles.colorSwatchAll}>All</span>
                      </button>
                      {/* Available colors from vehicle data */}
                      {vehicle.colors && vehicle.colors.length > 0
                        ? vehicle.colors.map((c: any, idx: number) => {
                            const isActive = activeColorFilter === c._id || activeColorFilter === c.id;
                            const hasLinkedPhotos = colorLinked.some(cl => cl.colorId === c._id || cl.colorId === c.id);
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`${styles.colorSwatchBtn} ${isActive ? styles.colorSwatchBtnActive : ''} ${!hasLinkedPhotos ? styles.colorSwatchBtnDimmed : ''}`}
                                onClick={() => setColorFilter(vehicle._id, c._id || c.id || null)}
                                title={`${c.name}${!hasLinkedPhotos ? ' (no exclusive photos)' : ''}`}
                              >
                                <span
                                  className={styles.colorDot}
                                  style={{ backgroundColor: c.hexCode || '#ccc' }}
                                />
                              </button>
                            );
                          })
                        : colorLinked.map((cl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`${styles.colorSwatchBtn} ${activeColorFilter === cl.colorId ? styles.colorSwatchBtnActive : ''}`}
                              onClick={() => setColorFilter(vehicle._id, cl.colorId)}
                              title={cl.colorName}
                            >
                              <span
                                className={styles.colorDot}
                                style={{ backgroundColor: cl.hexCode || '#ccc' }}
                              />
                            </button>
                          ))
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {filledVehicles.length >= 2 ? (
        <div className={styles.tableContainer} style={{ '--col-count': colCount } as React.CSSProperties}>
          <div className={styles.tableToolbar}>
            <h3 className={styles.tableToolbarTitle}>Specifications &amp; Features Comparison</h3>
            <label className={styles.tableToggle}>
              <input
                type="checkbox"
                className={styles.tableToggleCheckbox}
                checked={showDiffOnly}
                onChange={(e) => setShowDiffOnly(e.target.checked)}
              />
              Show differences only
            </label>
          </div>

          {compareGroups.map((group) => {
            const visibleRows = showDiffOnly
              ? group.rows.filter((r) => isRowDifferent(r))
              : group.rows;

            if (visibleRows.length === 0) return null;

            const isCollapsed = collapsedGroups[group.label];

            return (
              <div key={group.label} className={styles.tableGroup}>
                <div
                  className={styles.tableGroupHeader}
                  onClick={() => toggleGroup(group.label)}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isCollapsed ? 'rotate(-90deg)' : 'none',
                      transition: 'transform 200ms',
                    }}
                  />
                </div>
                {!isCollapsed &&
                  visibleRows.map((row) => {
                    const bestIdx = getBestIndex(row);
                    return (
                      <div key={row.label} className={styles.tableRow}>
                        <div className={styles.tableRowLabel}>{row.label}</div>
                        {filledVehicles.map((v, i) => (
                          <div
                            key={v._id}
                            className={`${styles.tableRowValue} ${bestIdx === i ? styles.tableRowBest : ''}`}
                          >
                            {row.getValue(v)}
                            {bestIdx === i && (
                              <span className={styles.tableBestBadge}>Best</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyCompare}>
          <div className={styles.emptyCompareIcon}>
            <Car size={28} />
          </div>
          <div className={styles.emptyCompareTitle}>Select at least 2 vehicles</div>
          <p className={styles.emptyCompareDesc}>
            Pick from the dropdowns above to start comparing vehicles side by side.
          </p>
        </div>
      )}
    </div>
  );
}
