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
  ArrowRight,
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

interface BrowseByBrandProps {
  showBreadcrumb?: boolean;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  showTabs?: boolean;
}

export default function BrowseByBrand({
  showBreadcrumb = false,
  title = 'Find Cars Your Way',
  subtitle = 'Explore official manufacturers, body styles, budgets, and fuel choices in the UAE.',
  showViewAll = true,
  showTabs = true,
}: BrowseByBrandProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BrandTab>('makes');
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(10);

  // Touch swiping state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (!showViewAll) {
        setCardsPerPage(100);
      } else if (window.innerWidth <= 768) {
        setCardsPerPage(6);
      } else {
        setCardsPerPage(10);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showViewAll]);

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
  const totalPages = Math.max(1, Math.ceil(totalItems.length / cardsPerPage));

  // Touch swipe handlers
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance && currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (distance < -minSwipeDistance && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <section className={styles.brands} id="browse-by-brand">
      {showBreadcrumb && (
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <span>Brands</span>
        </div>
      )}
      <div className={styles.brandsHeader}>
        <div className={styles.brandsHeaderRow}>
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          {showViewAll && activeTab === 'makes' && (
            <Link href="/brands" className={styles.viewAllBrandsBtn} id="view-all-brands-btn">
              View All Brands
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* Tab Bar */}
        {showTabs && (
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
        )}
      </div>

      {/* Carousel Container with Side Arrows */}
      <div className={styles.carouselWrapper}>
        {totalPages > 1 && (
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            aria-label="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          className={styles.carouselTrackWrapper}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(-${currentPage * 100}%)`,
            }}
          >
            {loading && activeTab === 'makes' ? (
              <div className={styles.brandsGrid}>
                <div style={{ padding: '40px 0', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
                  Loading brands...
                </div>
              </div>
            ) : totalItems.length > 0 ? (
              Array.from({ length: totalPages }).map((_, pageIdx) => {
                const pageItems = totalItems.slice(
                  pageIdx * cardsPerPage,
                  (pageIdx + 1) * cardsPerPage
                );
                return (
                  <div key={pageIdx} className={styles.brandsGrid}>
                    {activeTab === 'makes' ? (
                      (pageItems as Brand[]).map((brand) => (
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
                      (pageItems as typeof BODY_TYPES_LIST).map((item) => (
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
                      (pageItems as typeof BUDGET_LIST).map((item) => (
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
                      (pageItems as typeof FUEL_LIST).map((item) => (
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
                      (pageItems as typeof SEATS_LIST).map((item) => (
                        <Link
                          key={item.name}
                          href={`/new-cars?${item.query}`}
                          className={styles.brand}
                        >
                          <div className={styles.brandIconBox}>{item.icon}</div>
                          <span className={styles.brandNameText}>{item.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.brandsGrid}>
                <div style={{ padding: '40px 0', color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
                  No items available.
                </div>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        )}
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
