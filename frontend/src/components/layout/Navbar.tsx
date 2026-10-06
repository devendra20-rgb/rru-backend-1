'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Check, Sparkles } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import styles from './Navbar.module.css';

const EMIRATES = [
  { id: 'dubai', name: 'Dubai' },
  { id: 'abu-dhabi', name: 'Abu Dhabi' },
  { id: 'sharjah', name: 'Sharjah' },
  { id: 'ajman', name: 'Ajman' },
  { id: 'rak', name: 'Ras Al Khaimah' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [mobileMarketOpen, setMobileMarketOpen] = useState(false);
  const [selectedEmirate, setSelectedEmirate] = useState('Dubai');
  const [visitorCount, setVisitorCount] = useState(128);
  const [exploreOpen, setExploreOpen] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Simulated visitor count fluctuation between 118 and 146 every 3-7 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleUpdate = () => {
      const nextDelay = Math.floor(Math.random() * 4000) + 3000;
      timeoutId = setTimeout(() => {
        setVisitorCount((prev) => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const nextCount = prev + delta;
          return Math.min(146, Math.max(118, nextCount));
        });
        scheduleUpdate();
      }, nextDelay);
    };

    scheduleUpdate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (marketRef.current && !marketRef.current.contains(event.target as Node)) {
        setMarketOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={styles.navbar} id="navbar">
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={handleLogoClick}>
          <Image
            src="/logo.png"
            alt="RideRoundUp"
            width={170}
            height={38}
            priority
            className={styles.logoImg}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.links}>
          {NAV_LINKS.map((link) => {
            const isHighlighted = 'isHighlighted' in link && link.isHighlighted;
            const isActive = pathname === link.href;

            if (link.label === 'Explore Cars') {
              return (
                <div
                  key={link.href}
                  className={styles.exploreWrapper}
                  ref={exploreRef}
                  onMouseEnter={() => setExploreOpen(true)}
                  onMouseLeave={() => setExploreOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      styles.navLink,
                      styles.exploreTrigger,
                      (isActive || exploreOpen) && styles.navLinkActive,
                    )}
                    onClick={() => setExploreOpen(false)}
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      size={13}
                      className={cn(styles.chevronIcon, exploreOpen && styles.chevronRotate)}
                    />
                  </Link>

                  {exploreOpen && (
                    <div className={styles.megaMenu}>
                      <div className={styles.megaMenuGrid}>
                        <div className={styles.megaCol}>
                          <div className={styles.megaHeading}>Browse & Discover</div>
                          <Link
                            href="/new-cars"
                            className={styles.megaItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <div className={styles.megaIconBox}>🚗</div>
                            <div>
                              <div className={styles.megaTitle}>All New Cars 2026</div>
                              <div className={styles.megaDesc}>
                                Filter 140+ models by specs, price & fuel
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/new-cars?status=upcoming"
                            className={styles.megaItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <div className={styles.megaIconBox}>🔮</div>
                            <div>
                              <div className={styles.megaTitle}>
                                Upcoming Launches <span className={styles.newBadge}>Hot</span>
                              </div>
                              <div className={styles.megaDesc}>
                                Future models coming soon to UAE
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/brands"
                            className={styles.megaItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <div className={styles.megaIconBox}>🏭</div>
                            <div>
                              <div className={styles.megaTitle}>Browse by Brand</div>
                              <div className={styles.megaDesc}>
                                Toyota, BMW, Nissan, Mercedes & more
                              </div>
                            </div>
                          </Link>
                        </div>

                        <div className={styles.megaCol}>
                          <div className={styles.megaHeading}>By Lifestyle</div>
                          <Link
                            href="/new-cars?bodyType=SUV&seats=7"
                            className={styles.megaSubItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <span>🚙 7-Seater Family SUVs</span>
                            <span className={styles.countBadge}>18 models</span>
                          </Link>
                          <Link
                            href="/new-cars?fuelType=Electric"
                            className={styles.megaSubItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <span>⚡ Electric & Hybrid (EV)</span>
                            <span className={styles.countBadge}>24 models</span>
                          </Link>
                          <Link
                            href="/new-cars?maxPrice=100000"
                            className={styles.megaSubItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <span>💰 Cars Under AED 100k</span>
                            <span className={styles.countBadge}>32 models</span>
                          </Link>
                          <Link
                            href="/new-cars?minPrice=250000"
                            className={styles.megaSubItem}
                            onClick={() => setExploreOpen(false)}
                          >
                            <span>🚀 Performance & Luxury</span>
                            <span className={styles.countBadge}>15 models</span>
                          </Link>
                        </div>

                        <div className={styles.megaColFeatured}>
                          <div className={styles.megaHeading}>Smart Tools</div>
                          <Link
                            href="/car-matchmaker"
                            className={styles.featuredCard}
                            onClick={() => setExploreOpen(false)}
                          >
                            <div className={styles.featuredBadge}>AI Quiz</div>
                            <div className={styles.featuredTitle}>🎯 Car Matchmaker</div>
                            <div className={styles.featuredText}>
                              Answer 3 quick questions to discover your ideal car match in UAE.
                            </div>
                          </Link>

                          <Link
                            href="/cost-to-own"
                            className={styles.featuredCardSecondary}
                            onClick={() => setExploreOpen(false)}
                          >
                            <div className={styles.featuredTitleSec}>
                              💰 Cost-to-Own Calculator
                            </div>
                            <div className={styles.featuredTextSec}>
                              Know true 5-year running costs: insurance, fuel, servicing.
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (isHighlighted) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    styles.navLinkHighlight,
                    isActive && styles.navLinkHighlightActive
                  )}
                >
                  <Sparkles size={14} className={styles.navSparkleIcon} />
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(styles.navLink, isActive && styles.navLinkActive)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Utility buttons */}
        <div className={styles.utility}>
          {/* Simulated Visitor / Browsing Indicator */}
          <div
            className={styles.browsingBadge}
            id="browsing-indicator"
          >
            <span className={styles.pulseDot} />
            <span>{visitorCount} active users</span>
          </div>

          {/* Market Selector */}
          <div className={styles.marketWrapper} ref={marketRef}>
            <button
              className={styles.marketBtn}
              id="market-selector"
              onClick={() => setMarketOpen(!marketOpen)}
            >
              🇦🇪 {selectedEmirate} <ChevronDown size={12} />
            </button>

            {marketOpen && (
              <div className={styles.marketDropdown}>
                <div className={styles.marketDropdownHeader}>Select Location</div>
                {EMIRATES.map((e) => {
                  const isDubai = e.id === 'dubai';
                  const isSelected = selectedEmirate === e.name;
                  return (
                    <button
                      key={e.id}
                      className={cn(
                        styles.marketItem,
                        isSelected && styles.marketItemActive,
                        !isDubai && styles.marketItemDisabled
                      )}
                      onClick={() => {
                        if (!isDubai) return;
                        setSelectedEmirate(e.name);
                        setMarketOpen(false);
                      }}
                      disabled={!isDubai}
                    >
                      <span className={styles.marketItemName}>{e.name}</span>
                      {isDubai ? (
                        isSelected && <Check size={14} color="var(--green)" />
                      ) : (
                        <span className={styles.comingSoonTag}>Coming Soon</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/auth/login" className={styles.loginBtn} id="login-btn">
            Login
          </Link>

          <button
            type="button"
            className={styles.hamburger}
            onClick={(e) => {
              e.stopPropagation();
              setMarketOpen(false);
              setMobileOpen(true);
            }}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            id="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => {
            setMobileOpen(false);
            setMobileMarketOpen(false);
          }}
        >
          <div
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileClose}>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileMarketOpen(false);
                }}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            {NAV_LINKS.map((link) => {
              const isHighlighted = 'isHighlighted' in link && link.isHighlighted;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    styles.mobileLink,
                    isHighlighted && styles.mobileLinkHighlight
                  )}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileMarketOpen(false);
                  }}
                >
                  {isHighlighted && <Sparkles size={16} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className={styles.mobileActions}>
              {/* Browsing Badge inside mobile drawer */}
              <div className={styles.mobileBrowsingBadge}>
                <span className={styles.pulseDot} />
                <span>{visitorCount} active users</span>
              </div>

              {/* Location Selector inside mobile drawer */}
              <div className={styles.mobileMarketWrapper}>
                <button
                  type="button"
                  className={styles.mobileMarketBtn}
                  onClick={() => setMobileMarketOpen(!mobileMarketOpen)}
                  aria-expanded={mobileMarketOpen}
                >
                  <span>🇦🇪 UAE · {selectedEmirate}</span>
                  <ChevronDown
                    size={14}
                    className={cn(styles.chevron, mobileMarketOpen && styles.chevronRotated)}
                  />
                </button>

                {mobileMarketOpen && (
                  <div className={styles.mobileMarketDropdown}>
                    <div className={styles.marketDropdownHeader}>Select Location</div>
                    {EMIRATES.map((e) => {
                      const isDubai = e.id === 'dubai';
                      const isSelected = selectedEmirate === e.name;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          className={cn(
                            styles.marketItem,
                            isSelected && styles.marketItemActive,
                            !isDubai && styles.marketItemDisabled
                          )}
                          onClick={() => {
                            if (!isDubai) return;
                            setSelectedEmirate(e.name);
                            setMobileMarketOpen(false);
                          }}
                          disabled={!isDubai}
                        >
                          <span className={styles.marketItemName}>{e.name}</span>
                          {isDubai ? (
                            isSelected && <Check size={14} color="var(--green)" />
                          ) : (
                            <span className={styles.comingSoonTag}>Coming Soon</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                href="/auth/login"
                className={styles.mobileLoginBtn}
                onClick={() => {
                  setMobileOpen(false);
                  setMobileMarketOpen(false);
                }}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

