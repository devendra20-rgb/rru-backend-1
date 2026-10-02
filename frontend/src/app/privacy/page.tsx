import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how RideRoundUp collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Privacy Policy</span>
      </div>

      <div className={styles.layout}>
        {/* TOC Sidebar */}
        <nav className={styles.toc}>
          <div className={styles.tocLabel}>Contents</div>
          <ul className={styles.tocList}>
            {['Who We Are', 'Data We Collect', 'How We Use Data', 'Data Sharing', 'Cookies', 'Data Retention', 'Your Rights', 'Contact'].map((s) => (
              <li key={s}>
                <a href={`#${s.toLowerCase().replace(/\s+/g, '-')}`} className={styles.tocLink}>{s}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Privacy Policy</h1>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Confirm effective date */}
            <div className={styles.pageMeta}>Last updated: [DATE — requires legal confirmation]</div>
          </div>

          <div className={styles.confirmationBanner}>
            ⚠️ <strong>Legal confirmation required.</strong> This page contains placeholder text
            that must be reviewed and approved by your legal counsel before publication. Items
            marked [CONFIRM] require specific business details.
          </div>

          <section className={styles.section} id="who-we-are">
            <h2 className={styles.sectionTitle}>1. Who We Are</h2>
            <p className={styles.body}>
              RideRoundUp (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an automotive
              research platform serving users primarily in the United Arab Emirates. We operate the
              website at rideroundup.com.
            </p>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Legal entity name, registration number, registered address */}
            <div className={styles.highlight}>
              ⚠ Legal entity name, registration number, and registered address require business confirmation.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="data-we-collect">
            <h2 className={styles.sectionTitle}>2. Data We Collect</h2>
            <h3 className={styles.sectionSubtitle}>Information you provide directly</h3>
            <ul className={styles.list}>
              <li>Email address if you contact us or create an account</li>
              <li>Messages or enquiries submitted through our contact form</li>
            </ul>
            <h3 className={styles.sectionSubtitle}>Information collected automatically</h3>
            <ul className={styles.list}>
              <li>Pages visited, time spent, and navigation paths (analytics)</li>
              <li>Device type, operating system, and browser</li>
              <li>Approximate location (country/city level, derived from IP address)</li>
              <li>Referring website or search query that brought you to our site</li>
            </ul>
            <p className={styles.body}>
              We do not collect payment card information, government identification, or any sensitive
              personal data as defined under applicable data protection law.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="how-we-use-data">
            <h2 className={styles.sectionTitle}>3. How We Use Data</h2>
            <ul className={styles.list}>
              <li>To operate, maintain, and improve the platform</li>
              <li>To respond to enquiries you send us</li>
              <li>To understand how users navigate and use the site (analytics)</li>
              <li>To detect and prevent abuse or malicious activity</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className={styles.body}>
              We do not use your data to serve personalised advertising, and we do not sell your
              data to third parties.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="data-sharing">
            <h2 className={styles.sectionTitle}>4. Data Sharing</h2>
            <p className={styles.body}>
              We share data only in the following limited circumstances:
            </p>
            <ul className={styles.list}>
              {/* ⚠️ LEGAL CONFIRMATION REQUIRED: List actual service providers (analytics, hosting, email) */}
              <li><strong>Analytics providers</strong> — [CONFIRM: e.g., Google Analytics / Plausible] to measure platform usage</li>
              <li><strong>Hosting infrastructure</strong> — [CONFIRM: e.g., Vercel / AWS] to serve the website</li>
              <li><strong>Legal requirements</strong> — when required by law, regulation, or court order</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="cookies">
            <h2 className={styles.sectionTitle}>5. Cookies</h2>
            <p className={styles.body}>
              We use cookies and similar tracking technologies. For full details on which cookies we
              use and how to manage them, see our{' '}
              <Link href="/cookies" style={{ color: 'var(--petrol)', fontWeight: 600 }}>Cookie Policy</Link>.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="data-retention">
            <h2 className={styles.sectionTitle}>6. Data Retention</h2>
            <p className={styles.body}>
              We retain personal data only for as long as necessary to fulfil the purposes described
              in this policy, or as required by applicable law. Analytics data is retained in
              aggregated, anonymised form.
            </p>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Specific retention periods */}
            <div className={styles.highlight}>
              ⚠ Specific retention periods require legal review.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="your-rights">
            <h2 className={styles.sectionTitle}>7. Your Rights</h2>
            <p className={styles.body}>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className={styles.list}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className={styles.body}>
              To exercise any of these rights, contact us at the address below.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="contact">
            <h2 className={styles.sectionTitle}>8. Contact</h2>
            <p className={styles.body}>
              If you have questions about this Privacy Policy or wish to exercise your data rights,
              please contact us at:
            </p>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Privacy contact email / DPO details */}
            <div className={styles.highlight}>
              ⚠ Privacy contact email and any Data Protection Officer details require business confirmation.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
