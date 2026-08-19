import Link from 'next/link';
import { Wrench, Snowflake, Settings, Search } from 'lucide-react';
import styles from './sections.module.css';

const services = [
  { icon: <Wrench size={20} />, label: 'Periodic Service', href: '/book-service' },
  { icon: <Snowflake size={20} />, label: 'AC Service', href: '/book-service' },
  { icon: <Settings size={20} />, label: 'General Service', href: '/book-service' },
  { icon: <Search size={20} />, label: 'Inspection', href: '/book-service' },
];

export default function BookServicePreview() {
  return (
    <section className={styles.service} id="book-service-preview">
      <div className={styles.serviceGrid}>
        <div>
          <div className={`eyebrow ${styles.serviceEyebrow}`}>
            AFTER THE PURCHASE
          </div>
          <h2 className={styles.serviceTitle}>Keep your car running right.</h2>
          <p className={styles.serviceDesc}>
            Book routine maintenance, certified inspections, and essential services through a simple,
            guided flow.
          </p>
          <Link href="/book-service" className="btn-light">
            Book a Service Now
          </Link>
        </div>

        <div className={styles.serviceCards}>
          {services.map((svc) => (
            <Link
              key={svc.label}
              href={svc.href}
              className={styles.serviceCard}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className={styles.serviceCardIcon}>{svc.icon}</span>
              <strong>{svc.label}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
