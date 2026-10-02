'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Check, FileSpreadsheet, Star, Award } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { brandsService } from '@/services/brands.service';
import { reviewsService } from '@/services/reviews.service';
import styles from './HeroSection.module.css';

const HERO_SUGGESTIONS = [
  { label: 'GCC spec SUV under AED 80k', query: 'SUV under 80000' },
  { label: 'best first car in Dubai', query: 'first car' },
  { label: 'cheapest car to run', query: 'hybrid economical' },
];

// Animated counter hook — counts from 0 to target over ~900ms
function useCountUp(target: number | null, duration = 900) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null || target === 0) return;
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return target === null ? null : count;
}

interface KpiData {
  variantCount: number | null;
  brandCount: number | null;
  bodyTypeCount: number | null;
  reviewCount: number | null;
}

export default function HeroSection() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [kpi, setKpi] = useState<KpiData>({
    variantCount: null,
    brandCount: null,
    bodyTypeCount: null,
    reviewCount: null,
  });

  // Fetch live KPI data in parallel
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      vehiclesService.getAllPages(),
      brandsService.getAll(),
      reviewsService.getAll(),
    ]).then(([vehiclesResult, brandsResult, reviewsResult]) => {
      if (cancelled) return;

      const vehicles = vehiclesResult.status === 'fulfilled' ? vehiclesResult.value : [];
      const brands = brandsResult.status === 'fulfilled' ? brandsResult.value : [];
      const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];

      // Count distinct body types from active vehicles
      const bodyTypes = new Set(
        vehicles
          .filter((v) => v.status === 'active' || v.status === 'upcoming')
          .map((v) => v.bodyType?.toLowerCase())
          .filter(Boolean),
      );

      setKpi({
        variantCount: vehicles.filter((v) => v.status === 'active' || v.status === 'upcoming').length,
        brandCount: brands.length,
        bodyTypeCount: bodyTypes.size,
        reviewCount: reviews.length,
      });
    });

    return () => { cancelled = true; };
  }, []);

  // Animated counts
  const variantCount = useCountUp(kpi.variantCount);
  const brandCount = useCountUp(kpi.brandCount);
  const bodyTypeCount = useCountUp(kpi.bodyTypeCount);
  const reviewCount = useCountUp(kpi.reviewCount);

  const handleSearch = (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : searchTerm;
    if (!q.trim()) {
      router.push('/new-cars');
      return;
    }
    router.push(`/new-cars?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className={styles.heroWrapper}>
      <section className={styles.hero} id="hero-section">
        {/* Background Stylized Car Vector / Silhouette */}
        <div className={styles.heroCarBackdrop} aria-hidden="true">
          <svg
            className={styles.heroCarSvg}
            viewBox="0 0 1000 450"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Aerodynamic Body Contour */}
            <path
              d="M 50 320 
                 C 90 320, 120 310, 150 290 
                 L 220 275 
                 C 250 200, 360 110, 520 100 
                 C 680 90, 780 160, 830 240 
                 L 920 270 
                 C 950 285, 970 310, 980 340 
                 L 980 360 
                 L 860 360 
                 C 850 320, 800 290, 750 290 
                 C 700 290, 650 320, 640 360 
                 L 360 360 
                 C 350 320, 300 290, 250 290 
                 C 200 290, 150 320, 140 360 
                 L 30 360 
                 C 20 340, 30 320, 50 320 Z"
              fill="rgba(125, 180, 194, 0.04)"
              stroke="#7db4c2"
              strokeWidth="2.5"
            />
            {/* Greenhouse / Windows */}
            <path
              d="M 280 250 
                 C 320 180, 400 130, 520 120 
                 C 640 115, 720 170, 760 240 
                 Z"
              fill="rgba(125, 180, 194, 0.08)"
              stroke="#7db4c2"
              strokeWidth="2"
            />
            {/* Window Pillar (B-Pillar) */}
            <line x1="520" y1="120" x2="520" y2="245" stroke="#7db4c2" strokeWidth="2.5" />
            {/* Front Wheel */}
            <circle cx="750" cy="355" r="55" stroke="#7db4c2" strokeWidth="3" fill="rgba(8, 41, 50, 0.9)" />
            <circle cx="750" cy="355" r="35" stroke="#7db4c2" strokeWidth="1.5" />
            <circle cx="750" cy="355" r="16" stroke="#7db4c2" strokeWidth="2" />
            {/* Rear Wheel */}
            <circle cx="250" cy="355" r="55" stroke="#7db4c2" strokeWidth="3" fill="rgba(8, 41, 50, 0.9)" />
            <circle cx="250" cy="355" r="35" stroke="#7db4c2" strokeWidth="1.5" />
            <circle cx="250" cy="355" r="16" stroke="#7db4c2" strokeWidth="2" />
            {/* Headlight & Tail lights Accent */}
            <path d="M 910 275 L 960 290" stroke="#e8942b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 55 315 L 80 320" stroke="#c4451d" strokeWidth="3" strokeLinecap="round" />
            {/* Character lines */}
            <path d="M 170 290 C 400 270, 650 260, 880 265" stroke="#7db4c2" strokeWidth="1.5" strokeDasharray="6 6" />
          </svg>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            VERIFIED DEALERS · REAL RUNNING COSTS · NO SURPRISES
          </div>
          <h1 className={styles.heroTitle}>
            Find the right car.<br />
            Know what it <span className={styles.heroTitleAccent}>really</span> costs.
          </h1>
          <p className={styles.heroDesc}>
            Every price includes the registration, insurance, servicing and fuel you&apos;ll actually pay.
          </p>

          {/* Search bar capsule */}
          <form
            className={styles.heroSearch}
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <Search size={18} className={styles.heroSearchIcon} />
            <input
              type="text"
              className={styles.heroSearchInput}
              placeholder="7 seater under 150k"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="hero-search-input"
            />

            <button type="submit" className={styles.heroSearchBtn}>
              Search
            </button>
          </form>

          <div className={styles.heroSuggestions}>
            <span>Try:</span>
            {HERO_SUGGESTIONS.map((item, idx) => (
              <span key={item.label}>
                <button
                  type="button"
                  className={styles.heroSuggestionLink}
                  onClick={() => handleSearch(item.query)}
                >
                  {item.label}
                </button>
                {idx < HERO_SUGGESTIONS.length - 1 && ' · '}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Floating 4-Card KPI Discovery Strip */}
      <div className={styles.quickStrip}>

        {/* KPI 1 — Browse New Cars (live variant + brand count) */}
        <Link href="/new-cars" className={styles.quickCard} id="kpi-browse-new-cars">
          <div className={`${styles.quickCardIcon} ${styles.iconNewCars}`}>
            <Search size={19} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>Browse new cars</div>
            <div className={styles.quickCardSubtitle}>
              {variantCount === null ? (
                <span className={styles.kpiSkeleton} />
              ) : (
                <>
                  <strong className={styles.kpiHighlight}>{variantCount.toLocaleString()}</strong>
                  {' variants · '}
                  <strong className={styles.kpiHighlight}>{brandCount ?? '—'}</strong>
                  {' brands'}
                </>
              )}
            </div>
          </div>
        </Link>

        {/* KPI 2 — Body Styles (live body type count + brand count) */}
        <Link href="/new-cars" className={styles.quickCard} id="kpi-body-styles">
          <div className={`${styles.quickCardIcon} ${styles.iconVerified}`}>
            <Award size={19} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>All body styles</div>
            <div className={styles.quickCardSubtitle}>
              {bodyTypeCount === null ? (
                <span className={styles.kpiSkeleton} />
              ) : (
                <>
                  <strong className={styles.kpiHighlight}>{bodyTypeCount}</strong>
                  {' styles · '}
                  <strong className={styles.kpiHighlight}>{brandCount ?? '—'}</strong>
                  {' brands'}
                </>
              )}
            </div>
          </div>
        </Link>

        {/* KPI 3 — Cost Calculator (static CTA) */}
        <Link href="/cost-to-own" className={`${styles.quickCard} ${styles.quickCardAccent}`} id="kpi-cost-calculator">
          <div className={`${styles.quickCardIcon} ${styles.iconCost}`}>
            <FileSpreadsheet size={19} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>What will it cost me?</div>
            <div className={styles.quickCardSubtitleCost}>
              Run the numbers first
            </div>
          </div>
        </Link>

        {/* KPI 4 — Expert Reviews (live review count) */}
        <Link href="/reviews" className={styles.quickCard} id="kpi-reviews">
          <div className={`${styles.quickCardIcon} ${styles.iconHelp}`}>
            <Star size={19} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>Owner reviews</div>
            <div className={styles.quickCardSubtitle}>
              {reviewCount === null ? (
                <span className={styles.kpiSkeleton} />
              ) : reviewCount > 0 ? (
                <>
                  <strong className={styles.kpiHighlight}>{reviewCount.toLocaleString()}</strong>
                  {' verified UAE reviews'}
                </>
              ) : (
                'Be the first to review'
              )}
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
