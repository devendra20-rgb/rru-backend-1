'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Users, Menu, X, ChevronDown, Check, Sparkles } from 'lucide-react';
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
  const [selectedEmirate, setSelectedEmirate] = useState('Dubai');
  const [visitorCount, setVisitorCount] = useState(128);
  const marketRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (marketRef.current && !marketRef.current.contains(event.target as Node)) {
        setMarketOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={styles.navbar} id="navbar">
        {/* Logo */}
        <Link href="/" className={styles.logo}>
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
            // title="Simulated indicator: estimated active UAE shoppers"
            id="browsing-indicator"
          >
            <span className={styles.pulseDot} />
            <span>{visitorCount} browsing</span>
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
            className={styles.hamburger}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            id="mobile-menu-btn"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>



      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className={cn(styles.mobileOverlay, styles.mobileOverlayActive)}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className={cn(styles.mobileMenu, styles.mobileMenuActive)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileClose}>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
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
                  onClick={() => setMobileOpen(false)}
                >
                  {isHighlighted && <Sparkles size={16} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className={styles.mobileActions}>
              <button
                className={styles.marketBtn}
                onClick={() => {
                  setMarketOpen(!marketOpen);
                }}
              >
                🇦🇪 UAE · {selectedEmirate}
              </button>
              <Link
                href="/auth/login"
                className={styles.loginBtn}
                onClick={() => setMobileOpen(false)}
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
