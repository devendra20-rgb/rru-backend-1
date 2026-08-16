'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { brandsMock } from '@/data/brands.mock';
import { vehiclesMock } from '@/data/vehicles.mock';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from '@/app/brands/brands.module.css';

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const brand = brandsMock.find((b) => b.slug === slug);
  const brandVehicles = vehiclesMock.filter((v) => v.brandSlug === slug);

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
          {brand.name.charAt(0)}
        </div>
        <div className={styles.brandHeaderInfo}>
          <h1>{brand.name} Cars in UAE</h1>
          <p>
            Explore all current {brand.name} models, starting prices, and transparent monthly cost of ownership.
          </p>
        </div>
      </div>

      {/* Models Grid */}
      <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 20 }}>
        {brand.name} Models ({brandVehicles.length})
      </h2>

      {brandVehicles.length > 0 ? (
        <div className={styles.modelsGrid}>
          {brandVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', background: 'var(--mist)', borderRadius: 'var(--radius-lg)' }}>
          <p>New {brand.name} models are being catalogued. Check back soon.</p>
          <Link href="/new-cars" className="btn-primary" style={{ marginTop: 16 }}>
            Browse All Cars
          </Link>
        </div>
      )}
    </div>
  );
}
