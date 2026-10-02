import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Monitor, ZoomIn, Type, MousePointer, Keyboard } from 'lucide-react';
import styles from '../legal.module.css';
import accStyles from './accessibility.module.css';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'RideRoundUp is committed to making our platform accessible to all users.',
};

const COMMITMENTS = [
  {
    icon: Monitor,
    title: 'Responsive layouts',
    body: 'Every page adapts to mobile, tablet, and desktop screen sizes with no content loss.',
  },
  {
    icon: ZoomIn,
    title: 'Resizable text',
    body: 'The Platform supports browser zoom and large-text settings without breaking layouts.',
  },
  {
    icon: Type,
    title: 'Semantic HTML',
    body: 'We use proper heading hierarchies, landmark elements, and ARIA labels to support screen readers.',
  },
  {
    icon: MousePointer,
    title: 'Focus indicators',
    body: 'All interactive elements have visible focus states for keyboard and switch-control users.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard navigation',
    body: 'Core features — browsing, comparing, filtering — are accessible without a mouse.',
  },
];

export default function AccessibilityPage() {
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Accessibility</span>
      </div>

      <div className={styles.layout}>
        <nav className={styles.toc}>
          <div className={styles.tocLabel}>Contents</div>
          <ul className={styles.tocList}>
            {['Our Commitment', 'Standards', 'Known Limitations', 'Reporting Issues', 'Contact'].map((s) => (
              <li key={s}>
                <a href={`#${s.toLowerCase().replace(/\s+/g, '-')}`} className={styles.tocLink}>{s}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Accessibility Statement</h1>
            {/* ⚠️ BUSINESS CONFIRMATION REQUIRED: Review date */}
            <div className={styles.pageMeta}>Last reviewed: 02 Oct 2026</div>
          </div>

          <section className={styles.section} id="our-commitment">
            <h2 className={styles.sectionTitle}>1. Our Commitment</h2>
            <p className={styles.body}>
              RideRoundUp is committed to making our platform usable by as many people as possible,
              regardless of ability or the technology they use. We aim to meet recognised web
              accessibility standards and continuously improve the accessibility of our content.
            </p>

            <div className={accStyles.commitmentGrid}>
              {COMMITMENTS.map(({ icon: Icon, title, body }) => (
                <div key={title} className={accStyles.commitmentCard}>
                  <div className={accStyles.commitmentIcon}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className={accStyles.commitmentTitle}>{title}</div>
                    <div className={accStyles.commitmentBody}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="standards">
            <h2 className={styles.sectionTitle}>2. Standards We Target</h2>
            <p className={styles.body}>
              We aim for conformance with the{' '}
              <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> as published
              by the World Wide Web Consortium (W3C). These guidelines explain how to make web
              content more accessible to people with disabilities.
            </p>
            {/* ⚠️ BUSINESS CONFIRMATION REQUIRED: Confirm actual conformance level and formal audit status */}
            <div className={styles.highlight}>
              ⚠ A formal accessibility conformance audit has not yet been completed. This statement
              reflects our design intentions. Please confirm this with your development team before
              publishing.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="known-limitations">
            <h2 className={styles.sectionTitle}>3. Known Limitations</h2>
            <p className={styles.body}>
              While we strive for full accessibility, there may be areas of the Platform that do not
              yet meet all guidelines. Known areas we are actively working on include:
            </p>
            <ul className={styles.list}>
              <li>Some vehicle image galleries may have limited alternative text for complex colour swatches</li>
              <li>Certain third-party embedded content (such as maps or social media embeds) may not fully conform to WCAG 2.1 AA</li>
              <li>PDF documents, if present, may not yet be fully tagged for screen reader access</li>
            </ul>
            {/* ⚠️ BUSINESS CONFIRMATION REQUIRED: Confirm actual known limitations */}
            <div className={styles.highlight}>
              ⚠ This limitations list should be reviewed by your development team and updated to
              reflect actual current issues.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="reporting-issues">
            <h2 className={styles.sectionTitle}>4. Reporting Accessibility Issues</h2>
            <p className={styles.body}>
              If you experience an accessibility barrier on RideRoundUp — content you cannot access,
              a feature that does not work with your assistive technology, or anything that makes the
              Platform harder to use — please let us know.
            </p>
            <p className={styles.body}>
              We aim to respond to accessibility feedback within 5 business days and to resolve
              confirmed issues as quickly as possible.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} id="contact">
            <h2 className={styles.sectionTitle}>5. Contact</h2>
            <p className={styles.body}>
              To report an accessibility issue or request content in an alternative format, contact
              us via our{' '}
              <Link href="/contact" style={{ color: 'var(--petrol)', fontWeight: 600 }}>Contact page</Link>.
            </p>
            {/* ⚠️ BUSINESS CONFIRMATION REQUIRED: Dedicated accessibility contact email if available */}
            <div className={styles.highlight}>
              ⚠ If a dedicated accessibility contact email exists, add it here after business confirmation.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
