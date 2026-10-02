import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Read the Terms and Conditions governing your use of RideRoundUp.',
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Terms and Conditions</span>
      </div>

      <div className={styles.layout}>
        {/* TOC */}
        <nav className={styles.toc}>
          <div className={styles.tocLabel}>Contents</div>
          <ul className={styles.tocList}>
            {['Acceptance', 'Use of the Platform', 'Accuracy of Data', 'Intellectual Property', 'Third-Party Links', 'Disclaimers', 'Limitation of Liability', 'Governing Law', 'Changes', 'Contact'].map((s) => (
              <li key={s}>
                <a href={`#${s.toLowerCase().replace(/\s+/g, '-')}`} className={styles.tocLink}>{s}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Terms and Conditions</h1>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Effective date */}
            <div className={styles.pageMeta}>Last updated: 02 Oct 2026</div>
          </div>

          {/* <div className={styles.confirmationBanner}>
            ⚠️ <strong>Legal confirmation required.</strong> These Terms must be reviewed and
            approved by qualified legal counsel before publication. Placeholder items are marked.
          </div> */}

          <section className={styles.section} id="acceptance">
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.body}>
              By accessing or using RideRoundUp (&ldquo;the Platform&rdquo;), you agree to be bound
              by these Terms and Conditions. If you do not agree, please do not use the Platform.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="use-of-the-platform">
            <h2 className={styles.sectionTitle}>2. Use of the Platform</h2>
            <p className={styles.body}>You agree to use the Platform only for lawful purposes and in a manner that does not:</p>
            <ul className={styles.list}>
              <li>Infringe the rights of others</li>
              <li>Transmit unsolicited advertising or spam</li>
              <li>Attempt to gain unauthorised access to any part of the Platform</li>
              <li>Scrape, harvest, or systematically extract data without prior written permission</li>
              <li>Interfere with the normal operation of the Platform</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="accuracy-of-data">
            <h2 className={styles.sectionTitle}>3. Accuracy of Vehicle Data</h2>
            <p className={styles.body}>
              We make reasonable efforts to ensure that vehicle specifications, prices, and ownership
              cost estimates are accurate and up to date for the UAE market. However, manufacturer
              specifications are subject to change without notice, and regional variants may differ.
            </p>
            <p className={styles.body}>
              All information on the Platform is provided for research and reference purposes only.
              You should independently verify any information with the relevant manufacturer or
              authorised dealer before making a purchase decision.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="intellectual-property">
            <h2 className={styles.sectionTitle}>4. Intellectual Property</h2>
            <p className={styles.body}>
              All content on the Platform — including text, design, graphics, database structure,
              and code — is the property of RideRoundUp or its content suppliers and is protected by
              applicable intellectual property laws.
            </p>
            <p className={styles.body}>
              You may not reproduce, distribute, or create derivative works from any content on the
              Platform without prior written consent.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="third-party-links">
            <h2 className={styles.sectionTitle}>5. Third-Party Links</h2>
            <p className={styles.body}>
              The Platform may contain links to third-party websites, including dealer websites and
              manufacturer pages. These links are provided for convenience only. We do not control,
              endorse, or take responsibility for the content or practices of any third-party sites.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="disclaimers">
            <h2 className={styles.sectionTitle}>6. Disclaimers</h2>
            <p className={styles.body}>
              The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, either express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p className={styles.body}>
              Cost-to-own estimates are illustrative and based on publicly available averages. They
              are not a guarantee of actual costs.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="limitation-of-liability">
            <h2 className={styles.sectionTitle}>7. Limitation of Liability</h2>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Jurisdiction-appropriate liability cap language */}
            <p className={styles.body}>
              To the maximum extent permitted by applicable law, RideRoundUp shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from your
              use of or inability to use the Platform.
            </p>
            <div className={styles.highlight}>
              ⚠ Specific liability caps and applicable law jurisdiction require legal review.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="governing-law">
            <h2 className={styles.sectionTitle}>8. Governing Law</h2>
            {/* ⚠️ LEGAL CONFIRMATION REQUIRED: Confirm governing jurisdiction */}
            <div className={styles.highlight}>
              ⚠ Governing law and jurisdiction require legal confirmation (e.g., UAE / DIFC / ADGM).
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="changes">
            <h2 className={styles.sectionTitle}>9. Changes to These Terms</h2>
            <p className={styles.body}>
              We may update these Terms from time to time. The date at the top of this page reflects
              the most recent revision. Continued use of the Platform after changes constitutes your
              acceptance of the revised Terms.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="contact">
            <h2 className={styles.sectionTitle}>10. Contact</h2>
            <p className={styles.body}>
              For questions about these Terms, contact us via our{' '}
              <Link href="/contact" style={{ color: 'var(--petrol)', fontWeight: 600 }}>Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
