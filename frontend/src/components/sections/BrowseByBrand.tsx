import Link from 'next/link';
import { brandsMock } from '@/data/brands.mock';
import styles from './sections.module.css';

export default function BrowseByBrand() {
  return (
    <section className={styles.brands} id="browse-by-brand">
      <h2 className="section-title">Browse by Brand</h2>
      <p className="section-subtitle">
        Explore the brands available in your market.
      </p>
      <div className={styles.brandsGrid}>
        {brandsMock.map((brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            className={styles.brand}
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
