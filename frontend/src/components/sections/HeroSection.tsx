'use client';

import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero-section">
      {/* Background overlay */}
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <div className={styles.heroEyebrow}>
          Cost Honesty · Car Discovery
        </div>
        <h1 className={styles.heroTitle}>
          Know what your car{' '}
          <span className={styles.heroTitleAccent}>really</span> costs.
        </h1>
        <p className={styles.heroDesc}>
          Discover cars, compare real ownership costs and make a better-informed
          decision — all in one place.
        </p>

        {/* Search bar */}
        <div className={styles.heroSearch}>
          <Search size={18} className={styles.heroSearchIcon} />
          <input
            type="text"
            className={styles.heroSearchInput}
            placeholder='Try: "7 seater under AED 150k"'
            id="hero-search-input"
          />
          <div className={styles.heroSearchDivider} />
          <button className={styles.heroSearchLocation}>
            Dubai <ChevronDown size={12} />
          </button>
          <button className={styles.heroSearchBtn}>Search</button>
        </div>

        <div className={styles.heroSuggestions}>
          <span>Try:</span>
          <span className={styles.heroSuggestionLink}>GCC spec SUV under AED 80k</span>
          <span className={styles.heroSuggestionLink}>best first car in Dubai</span>
          <span className={styles.heroSuggestionLink}>cheapest car to run</span>
        </div>

        <div className={styles.heroActions}>
          <Link href="/new-cars" className="btn-primary" id="hero-explore-btn">
            Explore New Cars
          </Link>
          <Link href="/compare" className="btn-light" id="hero-compare-btn">
            Compare Cars
          </Link>
        </div>
      </div>
    </section>
  );
}
