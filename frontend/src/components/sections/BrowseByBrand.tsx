import Link from 'next/link';
import { brandsMock } from '@/data/brands.mock';
import styles from './sections.module.css';

export default function BrowseByBrand() {
  return (
    <section className={styles.brands} id="browse-by-brand">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Browse by Brand</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Explore the official brands available in your market.
          </p>
        </div>
        <Link href="/brands" className="btn-light" style={{ fontSize: 12, padding: '8px 16px' }}>
          View All Brands →
        </Link>
      </div>

      <div className={styles.brandsGrid}>
        {brandsMock.map((brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            className={styles.brand}
          >
            <span>{brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
