'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Car, ChevronDown } from 'lucide-react';
import { vehiclesMock } from '@/data/vehicles.mock';
import { formatPrice } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle';
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

export default function ComparePage() {
  const [selectedSlugs, setSelectedSlugs] = useState<(string | null)[]>([null, null, null, null]);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const selectedVehicles = useMemo(
    () => selectedSlugs.map((slug) => (slug ? vehiclesMock.find((v) => v.slug === slug) || null : null)),
    [selectedSlugs]
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
        Select up to 4 vehicles to compare side by side. See the differences that matter.
      </p>

      {/* Vehicle Selectors */}
      <div className={styles.selectorRow}>
        {selectedSlugs.map((slug, index) => {
          const vehicle = slug ? vehiclesMock.find((v) => v.slug === slug) : null;
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
                    <Car size={24} />
                  </div>
                  <div className={styles.selectorCarName}>
                    {vehicle.brand} {vehicle.model}
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
                {vehiclesMock
                  .filter((v) => v.status === 'active')
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

      {/* Comparison Table */}
      {filledVehicles.length >= 2 ? (
        <div className={styles.tableContainer} style={{ '--col-count': colCount } as React.CSSProperties}>
          <div className={styles.tableToolbar}>
            <h3 className={styles.tableToolbarTitle}>Comparison Details</h3>
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
