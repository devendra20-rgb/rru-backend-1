'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { brandsService } from '@/services/brands.service';
import { vehiclesService } from '@/services/vehicles.service';
import type { Brand } from '@/types/brand';
import type { Vehicle } from '@/types/vehicle';
import { getBrandLogoUrl } from '@/lib/brandLogos';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from '@/app/brands/brands.module.css';

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandVehicles, setBrandVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      brandsService.getBySlug(slug).then((b) => {
        if (b) {
          setBrand(b);
        } else {
          // fallback if backend brands/slug endpoint isn't present
          setBrand({ _id: slug, brandCode: slug, name: slug.toUpperCase(), slug, status: 'active' });
        }
      }).catch(() => {
        setBrand({ _id: slug, brandCode: slug, name: slug.toUpperCase(), slug, status: 'active' });
      });

      vehiclesService.getByBrandSlug(slug).then((v) => {
        setBrandVehicles(v);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading brand details...
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
