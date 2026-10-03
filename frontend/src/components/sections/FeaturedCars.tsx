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

function getUniqueModelVehicles(vehicles: Vehicle[]): Vehicle[] {
  const seen = new Set<string>();
  const result: Vehicle[] = [];

  for (const v of vehicles) {
    const rawBrand = (v.brand || '').toLowerCase().trim();
    const rawModel = (v.model || '').toLowerCase().trim();
    const cleanModel = rawModel.startsWith(rawBrand) ? rawModel.slice(rawBrand.length).trim() : rawModel;
    const key = `${rawBrand}_${cleanModel}`.replace(/[\s-]+/g, '');

    if (!seen.has(key)) {
      seen.add(key);
      result.push(v);
    }
  }

  return result;
}

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState<TabType>('Popular');
  const [displayedTab, setDisplayedTab] = useState<TabType>('Popular');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      vehiclesService.getAllPages().catch(() => []),
      vehiclesService.getUpcoming().catch(() => []),
    ]).then(([featured, all, upcomingFromApi]) => {
      if (!isMounted) return;

      const uniqueAll = getUniqueModelVehicles(all);

      // Popular: Top unique models from featured + catalog
      const uniqueFeatured = getUniqueModelVehicles(featured);
      const popular = (uniqueFeatured.length >= 4 ? uniqueFeatured : uniqueAll).slice(0, 8);
      setPopularCars(popular);

      // Latest: Distinct models not in popular, sorted by year/id
      const remainingForLatest = uniqueAll.filter((x) => !popular.some((p) => p._id === x._id));
      const latestSorted = [...remainingForLatest].sort((a, b) => (b.year || 2026) - (a.year || 2026));
      const latest = latestSorted.slice(0, 8);
      setLatestCars(latest);

      // Upcoming: Dedicated upcoming vehicles or distinct future entries not in popular/latest
      const uniqueUpcomingApi = getUniqueModelVehicles(upcomingFromApi).filter(
        (x) => !popular.some((p) => p._id === x._id) && !latest.some((l) => l._id === x._id)
      );
      const remainingForUpcoming = uniqueAll.filter(
        (x) => !popular.some((p) => p._id === x._id) && !latest.some((l) => l._id === x._id)
      );
      const upcoming = (uniqueUpcomingApi.length >= 4 ? uniqueUpcomingApi : remainingForUpcoming).slice(0, 8);
      setUpcomingCars(upcoming);

      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab || isTransitioning) return;
    setIsTransitioning(true);
    setActiveTab(tab);

    setTimeout(() => {
      setDisplayedTab(tab);
      if (scrollTrackRef.current) {
        scrollTrackRef.current.scrollLeft = 0;
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 40);
    }, 140);
  };

  const displayedCars = displayedTab === 'Upcoming' 
    ? upcomingCars 
    : displayedTab === 'Latest' 
    ? latestCars 
    : popularCars.length > 0 ? popularCars : latestCars;

  const checkScroll = () => {
    if (scrollTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollTrackRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayedCars, displayedTab]);

  const handleScrollLeft = () => {
    if (scrollTrackRef.current) {
      const container = scrollTrackRef.current;
      const firstChild = container.firstElementChild as HTMLElement;
      const scrollAmount = firstChild ? firstChild.offsetWidth : container.clientWidth;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollTrackRef.current) {
      const container = scrollTrackRef.current;
      const firstChild = container.firstElementChild as HTMLElement;
      const scrollAmount = firstChild ? firstChild.offsetWidth : container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab)}
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
          className={`${styles.newsCarouselTrack} ${isTransitioning ? styles.carouselTrackFading : ''}`} 
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
