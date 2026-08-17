'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown, Check, Sparkles } from 'lucide-react';
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

const SEARCH_SUGGESTIONS = [
  '7 seater under AED 150k',
  'GCC spec SUV under AED 80k',
  'Best first car in Dubai',
  'Electric cars under AED 200k',
  'Toyota Land Cruiser',
  'Nissan Patrol',
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [selectedEmirate, setSelectedEmirate] = useState('Dubai');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const marketRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus search input when search modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  const handleSearchSubmit = (query?: string) => {
    const q = query !== undefined ? query : searchQuery;
    if (!q.trim()) return;
    setSearchModalOpen(false);
    setSearchQuery('');
    router.push(`/new-cars?search=${encodeURIComponent(q.trim())}`);
  };

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
          <button
            className={styles.searchBtn}
            aria-label="Search"
            id="search-btn"
            onClick={() => setSearchModalOpen(true)}
          >
            <Search size={16} />
          </button>

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
                <div className={styles.marketDropdownHeader}>Select Location (UAE)</div>
                {EMIRATES.map((e) => (
                  <button
                    key={e.id}
                    className={cn(
                      styles.marketItem,
                      selectedEmirate === e.name && styles.marketItemActive
                    )}
                    onClick={() => {
                      setSelectedEmirate(e.name);
                      setMarketOpen(false);
                    }}
                  >
                    <span>{e.name}</span>
                    {selectedEmirate === e.name && <Check size={14} color="var(--green)" />}
                  </button>
                ))}
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

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div
          className={styles.searchModalOverlay}
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className={styles.searchModal}
            onClick={(e) => e.stopPropagation()}
          >
            <form
              className={styles.searchModalHeader}
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
            >
              <Search size={18} color="var(--muted)" />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchModalInput}
                placeholder="Search cars by model, brand, or feature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className={styles.searchModalClose}
                onClick={() => setSearchModalOpen(false)}
              >
                <X size={20} />
              </button>
            </form>

            <div className={styles.searchModalSuggestions}>
              <div className={styles.searchModalSectionTitle}>Popular Searches</div>
              <div className={styles.searchModalChips}>
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.searchModalChip}
                    onClick={() => handleSearchSubmit(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
