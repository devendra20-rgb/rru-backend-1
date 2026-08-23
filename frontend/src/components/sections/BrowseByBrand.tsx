'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  Coins,
  Banknote,
  Sparkles,
  Gauge,
  Fuel,
  Zap,
  User,
  Users,
} from 'lucide-react';
import { brandsService } from '@/services/brands.service';
import type { Brand } from '@/types/brand';
import { getBrandLogoUrl } from '@/lib/brandLogos';
import {
  SUVIcon,
  SedanIcon,
  HatchbackIcon,
  CoupeIcon,
  ConvertibleIcon,
} from '@/components/ui/BodyTypeIcons';
import styles from './sections.module.css';

type BrandTab = 'makes' | 'bodyTypes' | 'budget' | 'fuel' | 'seats';

const CARDS_PER_PAGE = 10;

const BODY_TYPES_LIST = [
  { name: 'SUV', query: 'bodyType=SUV', icon: <SUVIcon /> },
  { name: 'Sedan', query: 'bodyType=Sedan', icon: <SedanIcon /> },
  { name: 'Hatchback', query: 'bodyType=Hatchback', icon: <HatchbackIcon /> },
  { name: 'Coupe', query: 'bodyType=Coupe', icon: <CoupeIcon /> },
  { name: 'Convertible', query: 'bodyType=Convertible', icon: <ConvertibleIcon /> },
];

const BUDGET_LIST = [
  { name: 'Under AED 100k', query: 'maxPrice=100000', icon: <Wallet size={28} strokeWidth={1.75} /> },
  { name: 'AED 100k – 150k', query: 'minPrice=100000&maxPrice=150000', icon: <Coins size={28} strokeWidth={1.75} /> },
  { name: 'AED 150k – 250k', query: 'minPrice=150000&maxPrice=250000', icon: <Banknote size={28} strokeWidth={1.75} /> },
  { name: 'AED 250k – 400k', query: 'minPrice=250000&maxPrice=400000', icon: <Sparkles size={28} strokeWidth={1.75} /> },
  { name: 'AED 400k+', query: 'minPrice=400000', icon: <Gauge size={28} strokeWidth={1.75} /> },
];

const FUEL_LIST = [
  { name: 'Petrol', query: 'fuelType=Petrol', icon: <Fuel size={30} strokeWidth={1.75} /> },
  { name: 'Hybrid', query: 'fuelType=Hybrid', icon: <Zap size={30} strokeWidth={1.75} /> },
  { name: 'Electric (EV)', query: 'fuelType=Electric', icon: <Sparkles size={30} strokeWidth={1.75} /> },
];

const SEATS_LIST = [
  { name: '2 Seater', query: 'seats=2', icon: <User size={28} strokeWidth={1.75} /> },
  { name: '4 Seater', query: 'seats=4', icon: <Users size={28} strokeWidth={1.75} /> },
  { name: '5 Seater', query: 'seats=5', icon: <Users size={30} strokeWidth={1.75} /> },
  { name: '7 Seater', query: 'seats=7', icon: <Users size={34} strokeWidth={1.75} /> },
  { name: '8+ Seater', query: 'seats=8', icon: <Users size={36} strokeWidth={1.75} /> },
];

export default function BrowseByBrand() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BrandTab>('makes');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    let isMounted = true;
    brandsService.getAll()
      .then((res) => {
        if (isMounted) {
          setBrands(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load brands:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleTabChange = (tab: BrandTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'makes':
        return brands;
      case 'bodyTypes':
        return BODY_TYPES_LIST;
      case 'budget':
        return BUDGET_LIST;
      case 'fuel':
        return FUEL_LIST;
      case 'seats':
        return SEATS_LIST;
      default:
        return [];
    }
  };

  const totalItems = getCurrentItems();
  const totalPages = Math.max(1, Math.ceil(totalItems.length / CARDS_PER_PAGE));
  const visibleItems = totalItems.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);

  return (
    <section className={styles.brands} id="browse-by-brand">
      <div className={styles.brandsHeader}>
        <h2 className="section-title">Find Cars Your Way</h2>
        <p className="section-subtitle">
          Explore official manufacturers, body styles, budgets, and fuel choices in the UAE.
        </p>

        {/* Tab Bar */}
        <div className={styles.brandTabs}>
          <button
            type="button"
            className={`${styles.brandTab} ${activeTab === 'makes' ? styles.brandTabActive : ''}`}
            onClick={() => handleTabChange('makes')}
          >
            Makes
          </button>
          <button
            type="button"
            className={`${styles.brandTab} ${activeTab === 'bodyTypes' ? styles.brandTabActive : ''}`}
            onClick={() => handleTabChange('bodyTypes')}
          >
            Body Types
          </button>
          <button
            type="button"
            className={`${styles.brandTab} ${activeTab === 'budget' ? styles.brandTabActive : ''}`}
            onClick={() => handleTabChange('budget')}
          >
            Budget
          </button>
          <button
            type="button"
            className={`${styles.brandTab} ${activeTab === 'fuel' ? styles.brandTabActive : ''}`}
            onClick={() => handleTabChange('fuel')}
          >
            Fuel Type
          </button>
          <button
            type="button"
            className={`${styles.brandTab} ${activeTab === 'seats' ? styles.brandTabActive : ''}`}
            onClick={() => handleTabChange('seats')}
          >
            Seats
          </button>
        </div>
      </div>

      {/* Carousel Container with Side Arrows */}
      <div className={styles.carouselWrapper}>
        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          aria-label="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>

        <div className={styles.brandsGrid}>
          {loading && activeTab === 'makes' ? (
            <div style={{ padding: '40px 0', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
              Loading brands...
            </div>
          ) : visibleItems.length > 0 ? (
            activeTab === 'makes' ? (
              (visibleItems as Brand[]).map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brands/${brand.slug}`}
                  className={styles.brand}
                >
                  <div className={styles.brandLogoBox}>
                    <img
                      src={getBrandLogoUrl(brand.slug, brand.name)}
                      alt={brand.name}
                      className={styles.brandLogoImg}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className={styles.brandNameText}>{brand.name}</span>
                </Link>
              ))
            ) : activeTab === 'bodyTypes' ? (
              (visibleItems as typeof BODY_TYPES_LIST).map((item) => (
                <Link
                  key={item.name}
                  href={`/new-cars?${item.query}`}
                  className={styles.brand}
                >
                  <div className={styles.bodyTypeSvgBox}>{item.icon}</div>
                  <span className={styles.brandNameText}>{item.name}</span>
                </Link>
              ))
            ) : activeTab === 'budget' ? (
              (visibleItems as typeof BUDGET_LIST).map((item) => (
                <Link
                  key={item.name}
                  href={`/new-cars?${item.query}`}
                  className={styles.brand}
                >
                  <div className={styles.brandIconBox}>{item.icon}</div>
                  <span className={styles.brandNameText}>{item.name}</span>
                </Link>
              ))
            ) : activeTab === 'fuel' ? (
              (visibleItems as typeof FUEL_LIST).map((item) => (
                <Link
                  key={item.name}
                  href={`/new-cars?${item.query}`}
                  className={styles.brand}
                >
                  <div className={styles.brandIconBox}>{item.icon}</div>
                  <span className={styles.brandNameText}>{item.name}</span>
                </Link>
              ))
            ) : (
              (visibleItems as typeof SEATS_LIST).map((item) => (
                <Link
                  key={item.name}
                  href={`/new-cars?${item.query}`}
                  className={styles.brand}
                >
                  <div className={styles.brandIconBox}>{item.icon}</div>
                  <span className={styles.brandNameText}>{item.name}</span>
                </Link>
              ))
            )
          ) : (
            <div style={{ padding: '40px 0', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
              No items available.
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Dots at Bottom */}
      {totalPages > 1 && (
        <div className={styles.carouselPagination}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.paginationDot} ${currentPage === idx ? styles.paginationDotActive : ''}`}
              onClick={() => setCurrentPage(idx)}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
