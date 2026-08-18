import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_LINKS } from '@/lib/constants';
import styles from './Footer.module.css';

export default function Footer() {
  const footerSections = [
    { title: 'Cars', links: FOOTER_LINKS.cars },
    { title: 'Discover', links: FOOTER_LINKS.discover },
    { title: 'Company', links: FOOTER_LINKS.company },
    { title: 'Legal', links: FOOTER_LINKS.legal },
  ];

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand column */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Image
                src="/logo.png"
                alt="RideRoundUp"
                width={130}
                height={30}
                style={{ height: '26px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
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
                  key={link.label}
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
