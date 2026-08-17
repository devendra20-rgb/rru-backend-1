import Link from 'next/link';
import { Car, GitCompare } from 'lucide-react';
import { vehiclesMock } from '@/data/vehicles.mock';
import { formatPrice } from '@/lib/utils';
import styles from './sections.module.css';

export default function ComparePreview() {
  const carA = vehiclesMock[0]; // Land Cruiser
  const carB = vehiclesMock[1]; // Patrol

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
            <Car size={32} />
          </div>
          <h3 className={styles.compareCarName}>{carA.brand} {carA.model}</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{carA.variant}</span>
        </Link>

        <div className={styles.vs}>
          <div className={styles.vsCircle}>VS</div>
        </div>

        <Link href={`/new-cars/${carB.slug}`} className={styles.compareCar} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.compareImg}>
            <Car size={32} />
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
