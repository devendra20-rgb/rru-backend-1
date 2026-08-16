'use client';

import { useState } from 'react';
import { Car } from 'lucide-react';
import { vehiclesMock } from '@/data/vehicles.mock';
import { formatPrice } from '@/lib/utils';
import styles from './sections.module.css';

const TABS = ['Popular', 'Latest', 'Upcoming'] as const;

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState<string>('Popular');

  return (
    <section className={styles.featured} id="featured-cars">
      <h2 className="section-title">Explore New Cars</h2>
      <p className="section-subtitle">
        Popular and latest vehicles with useful information at a glance.
      </p>

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
        {vehiclesMock.map((vehicle) => (
          <div key={vehicle._id} className={styles.car}>
            <div className={styles.carImg}>
              <div className={styles.carImgPlaceholder}>
                <Car size={32} />
                <span>VEHICLE IMAGE</span>
              </div>
            </div>
            <div className={styles.carInfo}>
              <div className={styles.carBrand}>{vehicle.brand}</div>
              <h3 className={styles.carName}>
                {vehicle.brand} {vehicle.model}
              </h3>
              <div className={styles.carMeta}>
                {vehicle.bodyType} · {vehicle.fuelType} · {vehicle.transmission} · {vehicle.seats} Seats
              </div>
              <div className={styles.receipt}>
                <span>Price from</span>
                <span className={styles.receiptValue}>
                  {formatPrice(vehicle.priceFrom || 0)}
                </span>
              </div>
              <div className={styles.receipt}>
                <span>Est. monthly ownership</span>
                <span className={styles.receiptValue}>
                  {formatPrice(vehicle.costToOwnMonthly || 0)}
                </span>
              </div>
              {vehicle.tags && (
                <div className={styles.chips}>
                  {vehicle.tags.map((tag) => (
                    <span key={tag} className={styles.chip}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
