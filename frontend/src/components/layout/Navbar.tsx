'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className={styles.navbar} id="navbar">
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span>
            ride<span className={styles.logoRound}>roundup</span>
          </span>
          <small className={styles.logoTagline}>Automotive Discovery</small>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                styles.navLink,
                pathname === link.href && styles.navLinkActive
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Utility buttons */}
        <div className={styles.utility}>
          <button className={styles.searchBtn} aria-label="Search" id="search-btn">
            <Search size={16} />
          </button>
          <button className={styles.marketBtn} id="market-selector">
            🇦🇪 UAE <ChevronDown size={12} />
          </button>
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileActions}>
              <button className={styles.marketBtn}>🇦🇪 UAE · Dubai</button>
              <Link href="/auth/login" className={styles.loginBtn}>
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
