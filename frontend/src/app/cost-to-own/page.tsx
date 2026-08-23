'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { costToOwnService } from '@/services/costToOwn.service';
import type { Vehicle } from '@/types/vehicle';
import type { CostToOwnBreakdown, SegmentComparison } from '@/types/cost';
import styles from './costoown.module.css';

function CostToOwnContent() {
  const searchParams = useSearchParams();
  const vehicleQuery = searchParams.get('vehicle');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [annualKm, setAnnualKm] = useState<number>(15000);
  const [ownershipYears, setOwnershipYears] = useState<number>(3);
  const [city, setCity] = useState<string>('Dubai');
  const [cost, setCost] = useState<CostToOwnBreakdown | null>(null);

  useEffect(() => {
    vehiclesService.getAll({ limit: 50 }).then((vList) => {
      setVehicles(vList);
      if (vList.length > 0) {
        if (vehicleQuery && vList.some((v) => v.slug === vehicleQuery)) {
          setSelectedSlug(vehicleQuery);
        } else {
          setSelectedSlug(vList[0].slug);
        }
      }
    }).catch(console.error);
  }, [vehicleQuery]);

  const vehicle = useMemo(
    () => vehicles.find((v) => v.slug === selectedSlug) || vehicles[0],
    [vehicles, selectedSlug]
  );

  useEffect(() => {
    if (vehicle) {
      costToOwnService.calculate({
        vehiclePrice: vehicle.priceFrom || 300000,
        annualMileageKm: annualKm,
        ownershipYears,
        fuelType: vehicle.fuelType?.toLowerCase() || 'petrol',
      }).then(setCost).catch(console.error);
    }
  }, [vehicle, annualKm, ownershipYears]);

  const dynamicSegmentComparison: SegmentComparison[] = useMemo(() => {
    if (!vehicle || !cost) return [];
    return [
      { vehicleName: `${vehicle.brand} ${vehicle.model} ${vehicle.variant}`, costPerMonth: cost.monthly.total, isCurrentVehicle: true },
      { vehicleName: `${vehicle.bodyType || 'SUV'} Segment Average`, costPerMonth: Math.round(cost.monthly.total * 1.12), isCurrentVehicle: false },
      { vehicleName: `${vehicle.bodyType || 'SUV'} Segment Best-in-Class`, costPerMonth: Math.round(cost.monthly.total * 0.88), isCurrentVehicle: false },
    ];
  }, [vehicle, cost]);

  if (!vehicle || !cost) {
    return (
      <div className={styles.costPage}>
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading Cost to Own calculator...
        </div>
      </div>
    );
  }

  const maxSegmentCost = Math.max(...dynamicSegmentComparison.map((s) => s.costPerMonth), 1);

  const costLines = [
    { label: 'Finance / depreciation', value: cost.monthly.financeDepreciation },
    { label: 'Insurance', value: cost.monthly.insurance, note: 'comprehensive' },
    { label: 'Fuel', value: cost.monthly.fuel, note: `${cost.assumptions.fuelPrice} AED/L` },
    { label: 'Servicing & maintenance', value: cost.monthly.servicing },
    { label: 'Tyres', value: cost.monthly.tyres, note: 'amortised' },
    { label: 'Registration & testing', value: cost.monthly.registration },
    { label: 'Salik / tolls', value: cost.monthly.tolls, note: '4/day' },
  ];

  return (
    <div className={styles.costPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Cost to Own</span>
      </div>

      <h1 className={styles.pageTitle}>Cost to Own Calculator</h1>
      <p className={styles.pageSubtitle}>
        See the real monthly cost of owning a car — not just the sticker price.
        Adjust your assumptions and compare across segments.
      </p>

      <div className={styles.costLayout}>
        {/* Config Panel */}
        <div className={styles.configPanel}>
          <h3 className={styles.configTitle}>Configure</h3>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Vehicle</label>
            <select
              className={styles.configSelect}
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
            >
              {vehicles
                .filter((v) => v.status === 'active' || v.status === 'upcoming')
                .map((v) => (
                  <option key={v._id} value={v.slug}>
                    {v.brand} {v.model} — {v.variant}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>City</label>
            <select
              className={styles.configSelect}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="Dubai">Dubai</option>
              <option value="Abu Dhabi">Abu Dhabi</option>
              <option value="Sharjah">Sharjah</option>
              <option value="Ajman">Ajman</option>
            </select>
          </div>

          <div className={styles.configDivider} />

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Annual Kilometres</label>
            <input
              type="range"
              className={styles.configSlider}
              min={5000}
              max={40000}
              step={1000}
              value={annualKm}
              onChange={(e) => setAnnualKm(parseInt(e.target.value))}
            />
            <div className={styles.configSliderMeta}>
              <span>5,000 km</span>
              <span className={styles.configSliderValue}>
                {annualKm.toLocaleString()} km/yr
              </span>
              <span>40,000 km</span>
            </div>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Ownership Period</label>
            <input
              type="range"
              className={styles.configSlider}
              min={1}
              max={7}
              step={1}
              value={ownershipYears}
              onChange={(e) => setOwnershipYears(parseInt(e.target.value))}
            />
            <div className={styles.configSliderMeta}>
              <span>1 yr</span>
              <span className={styles.configSliderValue}>
                {ownershipYears} years
              </span>
              <span>7 yrs</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={styles.resultsPanel}>
          {/* Receipt Card */}
          <div className={styles.receiptCard}>
            <div className={styles.receiptVehicle}>
              {vehicle.brand} {vehicle.model} {vehicle.variant} · {city}, UAE
            </div>
            <div className={styles.receiptBig}>
              AED {cost.monthly.total.toLocaleString()}
              <span className={styles.receiptUnit}> / month</span>
            </div>
            <div className={styles.receiptLabel}>Estimated monthly ownership cost</div>
            <div className={styles.receiptTotal3yr}>
              Total over {ownershipYears} years:{' '}
              <strong>AED {(cost.monthly.total * 12 * ownershipYears).toLocaleString()}</strong>
            </div>

            <div className={styles.receiptDash} />

            {costLines.map((line) => (
              <div key={line.label} className={styles.receiptLine}>
                <span className={styles.receiptLineLabel}>
                  {line.label}
                  {line.note && (
                    <span className={styles.receiptLineNote}>{line.note}</span>
                  )}
                </span>
                <span className={styles.receiptLineValue}>
                  AED {line.value.toLocaleString()}
                </span>
              </div>
            ))}

            <div className={styles.receiptTotalLine}>
              <span>Monthly total</span>
              <span>AED {cost.monthly.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Hidden Costs */}
          <div className={styles.hiddenSection}>
            <h3 className={styles.hiddenTitle}>
              <AlertTriangle size={16} />
              One-time / hidden costs
            </h3>
            <div className={styles.hiddenList}>
              <div className={styles.hiddenRow}>
                <span>Registration transfer</span>
                <span>AED {cost.hiddenCosts.registrationTransfer.toLocaleString()}</span>
              </div>
              <div className={styles.hiddenRow}>
                <span>Insurance (Year 1)</span>
                <span>AED {cost.hiddenCosts.insuranceYear1.toLocaleString()}</span>
              </div>
              <div className={styles.hiddenRow}>
                <span>Number plate</span>
                <span>AED {cost.hiddenCosts.numberPlate.toLocaleString()}</span>
              </div>
              {cost.hiddenCosts.bankProcessing ? (
                <div className={styles.hiddenRow}>
                  <span>Bank processing</span>
                  <span>AED {cost.hiddenCosts.bankProcessing.toLocaleString()}</span>
                </div>
              ) : null}
              <div className={styles.hiddenRow}>
                <span>Total one-time costs</span>
                <span>AED {cost.hiddenCosts.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Segment Comparison */}
          {dynamicSegmentComparison.length > 0 && (
            <div className={styles.segmentSection}>
              <h3 className={styles.segmentTitle}>How it compares in this segment</h3>
              {dynamicSegmentComparison.map((seg) => (
                <div key={seg.vehicleName} className={styles.segmentRow}>
                  <div
                    className={`${styles.segmentName} ${seg.isCurrentVehicle ? styles.segmentNameCurrent : ''}`}
                  >
                    {seg.vehicleName}
                  </div>
                  <div className={styles.segmentBar}>
                    <div
                      className={`${styles.segmentBarFill} ${seg.isCurrentVehicle ? styles.segmentBarFillCurrent : ''}`}
                      style={{ width: `${(seg.costPerMonth / maxSegmentCost) * 100}%` }}
                    />
                  </div>
                  <div className={styles.segmentCost}>
                    AED {seg.costPerMonth.toLocaleString()}/mo
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assumptions */}
          <div className={styles.assumptions}>
            <strong>Assumptions:</strong> Fuel price {cost.assumptions.fuelPrice} AED/L
            (as of {cost.assumptions.fuelPriceDate}). Insurance: {cost.assumptions.insuranceNote}.
            Depreciation: {cost.assumptions.depreciationNote}.
            Ownership: {ownershipYears} years at {annualKm.toLocaleString()} km/year.
            City: {city}.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CostToOwnPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading Cost to Own calculator...</div>}>
      <CostToOwnContent />
    </Suspense>
  );
}
