import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants';
import styles from './Footer.module.css';

export default function Footer() {
  const footerSections = [
    { title: 'Cars', links: FOOTER_LINKS.cars },
    { title: 'Discover', links: FOOTER_LINKS.discover },
    { title: 'Services', links: FOOTER_LINKS.services },
    { title: 'Legal', links: FOOTER_LINKS.legal },
  ];

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand column */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              ride<span className={styles.footerLogoRound}>roundup</span>
            </div>
            <p className={styles.footerTagline}>
              Automotive discovery built around better vehicle data and honest
              ownership information.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title} className={styles.footerSection}>
              <h4>{section.title}</h4>
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.footerLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} RideRoundUp. All rights reserved.</span>
          <span>UAE · English</span>
        </div>
      </div>
    </footer>
  );
}
