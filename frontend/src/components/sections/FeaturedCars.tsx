'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { vehiclesMock, upcomingVehiclesMock } from '@/data/vehicles.mock';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from './sections.module.css';

const TABS = ['Popular', 'Latest', 'Upcoming'] as const;
type TabType = (typeof TABS)[number];

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState<TabType>('Popular');

  const displayedCars = useMemo(() => {
    if (activeTab === 'Upcoming') {
      return upcomingVehiclesMock;
    }
    if (activeTab === 'Latest') {
      return vehiclesMock.filter((v) => v.status === 'active').slice(4, 8);
    }
    // Popular
    return vehiclesMock.filter((v) => v.status === 'active').slice(0, 4);
  }, [activeTab]);

  return (
    <section className={styles.featured} id="featured-cars">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Explore Cars</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Popular, latest, and upcoming vehicles with useful information at a glance.
          </p>
        </div>
        <Link href="/new-cars" className="btn-light" style={{ fontSize: 12, padding: '8px 16px' }}>
          View All Cars →
        </Link>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.carsGrid}>
        {displayedCars.map((vehicle) => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}
