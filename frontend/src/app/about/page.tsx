import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Eye, Database, Globe, ShieldCheck } from 'lucide-react';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about RideRoundUp — our mission, values, and what we are building for UAE car buyers.',
};

const VALUES = [
  {
    icon: Eye,
    title: 'Radical Transparency',
    body: 'Every data point we publish is sourced from verified, manufacturer-provided specifications. We label estimates as estimates and facts as facts.',
  },
  {
    icon: Database,
    title: 'Better Vehicle Data',
    body: 'We built a structured automotive database from scratch — not scraped, not crowd-sourced. Each variant, trim, and spec is verified before going live.',
  },
  {
    icon: Globe,
    title: 'UAE-First Perspective',
    body: 'Pricing, availability, and ownership costs are all calculated for the UAE market in AED, with no global averages masquerading as local data.',
  },
  {
    icon: ShieldCheck,
    title: 'No Pay-to-Win Listings',
    body: 'Search results and comparisons are never influenced by advertising spend. Your discovery is driven by relevance, not dealer budgets.',
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>About Us</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>Our Mission</div>
        <h1 className={styles.heroTitle}>
          Honest automotive discovery,<br />built for UAE car buyers.
        </h1>
        <p className={styles.heroSubtitle}>
          RideRoundUp is an automotive research platform that gives drivers access to accurate
          vehicle data, real ownership costs, and unbiased comparisons — all in one place.
        </p>
      </section>

      {/* Story */}
      <section className={styles.section}>
        <div className={styles.sectionGrid}>
          <div className={styles.sectionText}>
            <h2 className={styles.sectionTitle}>Why we built this</h2>
            <p className={styles.body}>
              Buying a car in the UAE is genuinely complex. Trims vary by market, optional packages
              are rarely documented, and total cost of ownership — insurance, registration, fuel,
              service — is almost impossible to calculate in one place. Most car sites either
              aggregate dealer ads or copy manufacturer brochures.
            </p>
            <p className={styles.body}>
              We decided to build the platform we wished existed: structured, complete vehicle data
              per variant, real-cost estimates anchored to UAE pricing, and a compare tool that
              actually respects your time.
            </p>
          </div>
          <div className={styles.sectionStats}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>247+</div>
              <div className={styles.statLabel}>Active vehicle variants</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>400+</div>
              <div className={styles.statLabel}>Catalogued features</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>UAE-specific pricing</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Pay-to-rank listings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our values</h2>
        <div className={styles.valuesGrid}>
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className={styles.valueTitle}>{title}</h3>
              <p className={styles.valueBody}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Start exploring</h2>
        <p className={styles.ctaBody}>
          Browse hundreds of new-car variants, compare side-by-side, and get a clear view of what
          ownership actually costs in the UAE.
        </p>
        <div className={styles.ctaActions}>
          <Link href="/new-cars" className={styles.ctaPrimary}>Explore Cars</Link>
          <Link href="/compare" className={styles.ctaSecondary}>Compare Vehicles</Link>
        </div>
      </section>
    </div>
  );
}
