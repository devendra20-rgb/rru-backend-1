import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { brandsMock } from '@/data/brands.mock';
import styles from './brands.module.css';

export default function BrandsPage() {
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
        {brandsMock.map((brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            className={styles.brandCard}
          >
            <div className={styles.brandLogoPlaceholder}>
              {brand.name.charAt(0)}
            </div>
            <h3 className={styles.brandName}>{brand.name}</h3>
            <span className={styles.brandCount}>{brand.modelCount} models available</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
