'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { brandsService } from '@/services/brands.service';
import type { Brand } from '@/types/brand';
import { getBrandLogoUrl } from '@/lib/brandLogos';
import styles from './brands.module.css';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    brandsService.getAll().then(setBrands).catch(console.error);
  }, []);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Brands</span>
      </div>

      <h1 className={styles.pageTitle}>All Car Brands in UAE</h1>
      <p className={styles.pageSubtitle}>
        Browse official manufacturers, view model line-ups and explore verified pricing.
      </p>

      <div className={styles.brandsGrid}>
        {brands.map((brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            className={styles.brandCard}
          >
            <div className={styles.brandLogoPlaceholder}>
              <img
                src={getBrandLogoUrl(brand.slug, brand.name)}
                alt={brand.name}
                style={{ maxHeight: 42, maxWidth: 64, objectFit: 'contain' }}
              />
            </div>
            <h3 className={styles.brandName}>{brand.name}</h3>
            <span className={styles.brandCount}>Explore Models</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
