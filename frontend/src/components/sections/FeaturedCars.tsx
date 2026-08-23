'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { vehiclesService } from '@/services/vehicles.service';
import type { Vehicle } from '@/types/vehicle';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from './sections.module.css';

const TABS = ['Popular', 'Latest', 'Upcoming'] as const;
type TabType = (typeof TABS)[number];

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState<TabType>('Popular');
  const [popularCars, setPopularCars] = useState<Vehicle[]>([]);
  const [latestCars, setLatestCars] = useState<Vehicle[]>([]);
  const [upcomingCars, setUpcomingCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      vehiclesService.getFeatured().catch(() => []),
      vehiclesService.getAll({ limit: 12 }).catch(() => []),
      vehiclesService.getUpcoming().catch(() => []),
    ]).then(([featured, all, upcoming]) => {
      if (!isMounted) return;
      setPopularCars(featured.length > 0 ? featured : all.slice(0, 4));
      setLatestCars(all.slice(0, 4));
      setUpcomingCars(upcoming);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const displayedCars = activeTab === 'Upcoming' 
    ? upcomingCars 
    : activeTab === 'Latest' 
    ? latestCars 
    : popularCars.length > 0 ? popularCars : latestCars;

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
        {loading ? (
          <div style={{ padding: '30px 0', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
            Loading vehicles...
          </div>
        ) : displayedCars.length > 0 ? (
          displayedCars.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))
        ) : (
          <div style={{ padding: '30px 0', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
            No vehicles catalogued in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
