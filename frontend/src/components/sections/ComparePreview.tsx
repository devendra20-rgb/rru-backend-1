'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, GitCompare } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import type { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/lib/utils';
import styles from './sections.module.css';

export default function ComparePreview() {
  const [carA, setCarA] = useState<Vehicle | null>(null);
  const [carB, setCarB] = useState<Vehicle | null>(null);

  useEffect(() => {
    vehiclesService.getAll({ limit: 10 }).then((cars) => {
      if (cars.length >= 2) {
        setCarA(cars[0]);
        setCarB(cars[1]);
      } else if (cars.length === 1) {
        setCarA(cars[0]);
      }
    }).catch(console.error);
  }, []);

  if (!carA || !carB) return null;

  const compareData = [
    { label: 'Starting Price', a: formatPrice(carA.priceFrom || 0, 'AED', true), b: formatPrice(carB.priceFrom || 0, 'AED', true) },
    { label: 'Seats', a: `${carA.seats} Seats`, b: `${carB.seats} Seats` },
    { label: 'Fuel', a: carA.fuelType, b: carB.fuelType },
    { label: 'Ownership / month', a: formatPrice(carA.costToOwnMonthly || 0), b: formatPrice(carB.costToOwnMonthly || 0) },
  ];

  return (
    <section className={styles.compare} id="compare-preview">
      <h2 className="section-title">Compare cars before you buy.</h2>
      <p className="section-subtitle">
        Put two vehicles side by side and see the differences that actually matter.
      </p>

      <div className={styles.compareGrid}>
        <Link href={`/new-cars/${carA.slug}`} className={styles.compareCar} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.compareImg}>
            {carA.imageUrl ? <img src={carA.imageUrl} alt={carA.model} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <Car size={32} />}
          </div>
          <h3 className={styles.compareCarName}>{carA.brand} {carA.model}</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{carA.variant}</span>
        </Link>

        <div className={styles.vs}>
          <div className={styles.vsCircle}>VS</div>
        </div>

        <Link href={`/new-cars/${carB.slug}`} className={styles.compareCar} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.compareImg}>
            {carB.imageUrl ? <img src={carB.imageUrl} alt={carB.model} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <Car size={32} />}
          </div>
          <h3 className={styles.compareCarName}>{carB.brand} {carB.model}</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{carB.variant}</span>
        </Link>
      </div>

      <div className={styles.compareRows}>
        {compareData.map((row) => (
          <div key={row.label} className={styles.compareRow}>
            <span className={styles.compareRowLabel}>{row.label}</span>
            <span className={styles.compareRowValue}>{row.a}</span>
            <span className={styles.compareRowValueRight}>{row.b}</span>
          </div>
        ))}
      </div>

      <div className={styles.compareCta}>
        <Link href="/compare" className="btn-primary">
          <GitCompare size={16} /> Build Your Comparison
        </Link>
      </div>
    </section>
  );
}
