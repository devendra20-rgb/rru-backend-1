'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Check, FileSpreadsheet, Sparkles } from 'lucide-react';
import styles from './HeroSection.module.css';

const HERO_SUGGESTIONS = [
  { label: 'GCC spec SUV under AED 80k', query: 'SUV under 80000' },
  { label: 'best first car in Dubai', query: 'first car' },
  { label: 'cheapest car to run', query: 'hybrid economical' },
];

export default function HeroSection() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

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

      {/* Floating 4-Card Quick Action Discovery Strip with True 50/50 Section Overlap */}
      <div className={styles.quickStrip}>
        <Link href="/new-cars" className={styles.quickCard}>
          <div className={`${styles.quickCardIcon} ${styles.iconNewCars}`}>
            <Search size={19} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>Browse new cars</div>
            <div className={styles.quickCardSubtitle}>412 models in the UAE</div>
          </div>
        </Link>

        <Link href="/new-cars" className={styles.quickCard}>
          <div className={`${styles.quickCardIcon} ${styles.iconVerified}`}>
            <Check size={19} strokeWidth={2.6} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>Verified used cars</div>
            <div className={styles.quickCardSubtitle}>1,840 listings · 62 dealers</div>
          </div>
        </Link>

        <Link href="/cost-to-own" className={`${styles.quickCard} ${styles.quickCardAccent}`}>
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

        <Link href="/ai-assistant" className={styles.quickCard}>
          <div className={`${styles.quickCardIcon} ${styles.iconHelp}`}>
            <Sparkles size={19} />
          </div>
          <div>
            <div className={styles.quickCardTitle}>Help me choose</div>
            <div className={styles.quickCardSubtitle}>8 questions, 5 matches</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
