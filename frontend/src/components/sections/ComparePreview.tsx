'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, GitCompare } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { useCompare } from '@/hooks/useCompare';
import type { Vehicle } from '@/types/vehicle';
import { formatPrice, resolveMediaUrl } from '@/lib/utils';
import VehicleSearchPicker from '@/components/ui/VehicleSearchPicker';
import styles from './sections.module.css';

export default function ComparePreview() {
  const [allCars, setAllCars] = useState<Vehicle[]>([]);
  const [carASlug, setCarASlug] = useState<string>('');
  const [carBSlug, setCarBSlug] = useState<string>('');
  const { addToCompare } = useCompare();
  const router = useRouter();

  useEffect(() => {
    vehiclesService.getAll({ limit: 100 }).then((cars) => {
      setAllCars(cars);
    }).catch(console.error);
  }, []);

  const carA = allCars.find(c => c.slug === carASlug || c._id === carASlug) || null;
  const carB = allCars.find(c => c.slug === carBSlug || c._id === carBSlug) || null;

  const compareData = [
    { label: 'Starting Price', a: carA ? formatPrice(carA.priceFrom || 0, 'AED', true) : '-', b: carB ? formatPrice(carB.priceFrom || 0, 'AED', true) : '-' },
    { label: 'Seats', a: carA ? `${carA.seats} Seats` : '-', b: carB ? `${carB.seats} Seats` : '-' },
    { label: 'Fuel', a: carA ? carA.fuelType : '-', b: carB ? carB.fuelType : '-' },
    { label: 'Ownership / month', a: carA ? formatPrice(carA.costToOwnMonthly || 0) : '-', b: carB ? formatPrice(carB.costToOwnMonthly || 0) : '-' },
  ];

  const handleBuildComparison = () => {
    if (carA) addToCompare(carA.slug);
    if (carB) addToCompare(carB.slug);
    router.push('/compare');
  };

  return (
    <section className={styles.compare} id="compare-preview">
      <h2 className="section-title">Compare cars before you buy.</h2>
      <p className="section-subtitle">
        Put two vehicles side by side and see the differences that actually matter.
      </p>

      <div className={styles.compareGrid}>
        <div className={styles.compareCarWrapper}>
          <VehicleSearchPicker
            excludeSlugs={carBSlug ? [carBSlug] : []}
            initialVehicles={allCars}
            onSelect={(slug) => setCarASlug(slug)}
            placeholder="Search Car 1 (brand, model, variant)…"
          />
          {carA ? (
            <Link href={`/new-cars/${carA.slug}`} className={styles.compareCar} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginTop: '12px' }}>
              <div className={styles.compareImg}>
                {carA.imageUrl ? <img src={resolveMediaUrl(carA.imageUrl)} alt={carA.model} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <Car size={32} />}
              </div>
              <h3 className={styles.compareCarName}>{carA.brand} {carA.model}</h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{carA.variant}</span>
            </Link>
          ) : (
            <div className={styles.compareCarEmpty}>
              <Car size={48} color="var(--muted)" />
              <p>Type to search and select Car 1</p>
            </div>
          )}
        </div>

        <div className={styles.vs}>
          <div className={styles.vsCircle}>VS</div>
        </div>

        <div className={styles.compareCarWrapper}>
          <VehicleSearchPicker
            excludeSlugs={carASlug ? [carASlug] : []}
            initialVehicles={allCars}
            onSelect={(slug) => setCarBSlug(slug)}
            placeholder="Search Car 2 (brand, model, variant)…"
          />
          {carB ? (
            <Link href={`/new-cars/${carB.slug}`} className={styles.compareCar} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginTop: '12px' }}>
              <div className={styles.compareImg}>
                {carB.imageUrl ? <img src={resolveMediaUrl(carB.imageUrl)} alt={carB.model} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <Car size={32} />}
              </div>
              <h3 className={styles.compareCarName}>{carB.brand} {carB.model}</h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{carB.variant}</span>
            </Link>
          ) : (
            <div className={styles.compareCarEmpty}>
              <Car size={48} color="var(--muted)" />
              <p>Type to search and select Car 2</p>
            </div>
          )}
        </div>
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
        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleBuildComparison}
          disabled={!carA || !carB}
          style={{ opacity: (!carA || !carB) ? 0.5 : 1 }}
        >
          <GitCompare size={16} /> Build Your Comparison
        </button>
      </div>
    </section>
  );
}
