import Link from 'next/link';
import { Wrench, Snowflake, Settings, Search } from 'lucide-react';
import styles from './sections.module.css';

const services = [
  { icon: <Wrench size={20} />, label: 'Periodic Service' },
  { icon: <Snowflake size={20} />, label: 'AC Service' },
  { icon: <Settings size={20} />, label: 'General Service' },
  { icon: <Search size={20} />, label: 'Inspection' },
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
            Book routine maintenance and essential services through a simple,
            guided flow.
          </p>
          <Link href="/book-service" className="btn-light">
            Book a Service
          </Link>
        </div>

        <div className={styles.serviceCards}>
          {services.map((svc) => (
            <div key={svc.label} className={styles.serviceCard}>
              <span className={styles.serviceCardIcon}>{svc.icon}</span>
              <strong>{svc.label}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
