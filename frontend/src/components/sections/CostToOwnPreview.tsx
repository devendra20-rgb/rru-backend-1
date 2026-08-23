'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { costToOwnService } from '@/services/costToOwn.service';
import type { CostToOwnBreakdown } from '@/types/cost';
import styles from './sections.module.css';

export default function CostToOwnPreview() {
  const [cost, setCost] = useState<CostToOwnBreakdown | null>(null);

  useEffect(() => {
    costToOwnService.calculate({
      vehiclePrice: 335000,
      annualMileageKm: 15000,
      ownershipYears: 3,
      fuelType: 'petrol',
    }).then(setCost).catch(console.error);
  }, []);

  if (!cost) return null;

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
    <section className={styles.cost} id="cost-to-own-preview">
      <div className={styles.costGrid}>
        <div>
          <div className={`eyebrow ${styles.costEyebrow}`}>
            THE RRU DIFFERENTIATOR
          </div>
          <h2 className={styles.costTitle}>
            See the cost beyond the sticker price.
          </h2>
          <p className={styles.costDesc}>
            Purchase price is only the beginning. RRU surfaces the running costs
            that shape the real ownership decision.
          </p>
          <Link href="/cost-to-own" className="btn-primary">
            <Calculator size={16} /> See Cost to Own Calculator
          </Link>
        </div>

        <div className={styles.costBox}>
          <div className={styles.costVehicle}>
            <Link
              href="/new-cars/toyota-land-cruiser-gxr-v6-2026"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Toyota Land Cruiser GXR · {cost.market} →
            </Link>
          </div>
          <div className={styles.costBig}>
            AED {cost.monthly.total.toLocaleString()}{' '}
            <span className={styles.costBigUnit}>/ month</span>
          </div>
          <div className={styles.costLabel}>Estimated ownership cost</div>
          <div className={styles.costDash} />
          {costLines.map((line) => (
            <div key={line.label} className={styles.costLine}>
              <span className={styles.costLineLabel}>
                {line.label}
                {line.note && (
                  <span className={styles.costLineNote}>{line.note}</span>
                )}
              </span>
              <span className={styles.costLineValue}>
                AED {line.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
