import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Find out which cookies RideRoundUp uses and how to control them.',
};

export default function CookiesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Cookie Policy</span>
      </div>

      <div className={styles.layout}>
        <nav className={styles.toc}>
          <div className={styles.tocLabel}>Contents</div>
          <ul className={styles.tocList}>
            {['What Are Cookies', 'Cookies We Use', 'Third-Party Cookies', 'Managing Cookies', 'Updates', 'Contact'].map((s) => (
              <li key={s}>
                <a href={`#${s.toLowerCase().replace(/\s+/g, '-')}`} className={styles.tocLink}>{s}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Cookie Policy</h1>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Effective date */}
            <div className={styles.pageMeta}>Last updated: 02 Oct 2026</div>
          </div>

          {/* <div className={styles.confirmationBanner}>
            ⚠️ <strong>Legal confirmation required.</strong> The specific list of cookies, their
            names, and durations must be populated by your development and legal teams before
            publication.
          </div> */}

          <section className={styles.section} id="what-are-cookies">
            <h2 className={styles.sectionTitle}>1. What Are Cookies</h2>
            <p className={styles.body}>
              Cookies are small text files placed on your device when you visit a website. They are
              widely used to make websites work efficiently and to provide reporting information to
              site operators.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="cookies-we-use">
            <h2 className={styles.sectionTitle}>2. Cookies We Use</h2>

            <h3 className={styles.sectionSubtitle}>Strictly Necessary</h3>
            <p className={styles.body}>
              These cookies are required for the Platform to function. They cannot be disabled.
              Examples include session management and security tokens.
            </p>

            <h3 className={styles.sectionSubtitle}>Analytics &amp; Performance</h3>
            <p className={styles.body}>
              These cookies help us understand how visitors interact with the Platform — which pages
              are visited, how long users spend on them, and where they come from. This data is
              aggregated and anonymous.
            </p>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: List actual analytics cookie names, durations, providers */}
            <div className={styles.highlight}>
              ⚠ Specific analytics cookie names, providers, and retention periods require technical
              and legal confirmation.
            </div>

            <h3 className={styles.sectionSubtitle}>Preferences</h3>
            <p className={styles.body}>
              These cookies remember your choices on the Platform, such as display preferences, to
              improve your experience on return visits.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="third-party-cookies">
            <h2 className={styles.sectionTitle}>3. Third-Party Cookies</h2>
            <p className={styles.body}>
              Some cookies are set by third-party services that appear on our pages. We do not
              control these cookies. Third-party services may include:
            </p>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Confirm actual third-party services used (e.g., Google Analytics, YouTube embeds) */}
            <div className={styles.highlight}>
              ⚠ Actual third-party cookie providers require business and technical confirmation
              (e.g., Google Analytics, social embeds, video players).
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="managing-cookies">
            <h2 className={styles.sectionTitle}>4. Managing Cookies</h2>
            <p className={styles.body}>
              You can control and delete cookies through your browser settings. Most browsers allow
              you to:
            </p>
            <ul className={styles.list}>
              <li>View cookies stored on your device</li>
              <li>Delete all or individual cookies</li>
              <li>Block cookies from specific sites or all sites</li>
              <li>Receive a notification when a cookie is set</li>
            </ul>
            <p className={styles.body}>
              Disabling certain cookies may affect the functionality of the Platform. For
              browser-specific instructions, refer to your browser&apos;s help documentation.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="updates">
            <h2 className={styles.sectionTitle}>5. Updates to This Policy</h2>
            <p className={styles.body}>
              We may update this Cookie Policy when we add or change cookies used on the Platform.
              The date at the top of this page will be updated accordingly.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="contact">
            <h2 className={styles.sectionTitle}>6. Contact</h2>
            <p className={styles.body}>
              For questions about our use of cookies, contact us via our{' '}
              <Link href="/contact" style={{ color: 'var(--petrol)', fontWeight: 600 }}>Contact page</Link>{' '}
              or review our{' '}
              <Link href="/privacy" style={{ color: 'var(--petrol)', fontWeight: 600 }}>Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
