import Link from 'next/link';
import { Car, Wallet, Fuel, Users, Compass, Building2 } from 'lucide-react';
import { BROWSE_HUBS } from '@/lib/constants';
import styles from './sections.module.css';

const iconMap: Record<string, React.ReactNode> = {
  car: <Car size={18} />,
  wallet: <Wallet size={18} />,
  fuel: <Fuel size={18} />,
  users: <Users size={18} />,
  compass: <Compass size={18} />,
  building: <Building2 size={18} />,
};

export default function BrowseHubs() {
  return (
    <section className={styles.hubs} id="browse-hubs">
      <h2 className="section-title">Find cars your way.</h2>
      <p className="section-subtitle">
        Start with the way you think about your next car — not a complicated filter.
      </p>
      <div className={styles.hubsGrid}>
        {BROWSE_HUBS.map((hub) => (
          <Link key={hub.title} href={hub.href} className={styles.hub}>
            <div>
              <div className={styles.hubIcon}>{iconMap[hub.icon]}</div>
              <div className={styles.hubTitle}>{hub.title}</div>
            </div>
            <div className={styles.hubDesc}>{hub.description}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
