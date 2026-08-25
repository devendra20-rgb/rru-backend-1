'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      vehiclesService.getFeatured().catch(() => []),
      vehiclesService.getAll({ limit: 8 }).catch(() => []),
      vehiclesService.getUpcoming().catch(() => []),
    ]).then(([featured, all, upcoming]) => {
      if (!isMounted) return;
      setPopularCars(featured.length > 0 ? featured.slice(0, 8) : all.slice(0, 8));
      setLatestCars(all.slice(0, 8));
      setUpcomingCars(upcoming.slice(0, 8));
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const displayedCars = activeTab === 'Upcoming' 
    ? upcomingCars 
    : activeTab === 'Latest' 
    ? latestCars 
    : popularCars.length > 0 ? popularCars : latestCars;

  const checkScroll = () => {
    if (scrollTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollTrackRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayedCars, activeTab]);

  const handleScrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -scrollTrackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: scrollTrackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

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

      <div className={styles.carouselWrapper}>
        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll Left"
          style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          className={styles.newsCarouselTrack} 
          ref={scrollTrackRef}
          onScroll={checkScroll}
          style={{ paddingBottom: '16px' }}
        >
          {loading ? (
            <div style={{ padding: '30px 0', color: 'var(--muted)', flex: '0 0 100%', textAlign: 'center' }}>
              Loading vehicles...
            </div>
          ) : displayedCars.length > 0 ? (
            displayedCars.map((vehicle) => (
              <div key={vehicle._id} style={{ height: '100%' }}>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))
          ) : (
            <div style={{ padding: '30px 0', color: 'var(--muted)', flex: '0 0 100%', textAlign: 'center' }}>
              No vehicles catalogued in this category yet.
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll Right"
          style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
