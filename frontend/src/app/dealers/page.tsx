import Link from 'next/link';
import { ChevronRight, MapPin, Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import styles from './dealers.module.css';

const dealersMock = [
  {
    id: 'd1',
    name: 'Al-Futtaim Motors',
    location: 'Dubai Festival City & Sheikh Zayed Road',
    city: 'Dubai',
    rating: 4.8,
    responseTime: '< 1 hour',
    inventoryCount: 142,
    brands: ['Toyota', 'Lexus', 'Honda'],
    phone: '+971 800 869682',
    isVerified: true,
  },
  {
    id: 'd2',
    name: 'Arabian Automobiles (AW Rostamani)',
    location: 'Deira & Sheikh Zayed Road',
    city: 'Dubai',
    rating: 4.7,
    responseTime: '2 hours',
    inventoryCount: 98,
    brands: ['Nissan', 'Infiniti', 'Renault'],
    phone: '+971 800 647726',
    isVerified: true,
  },
  {
    id: 'd3',
    name: 'AGMC (Arabian Gulf Mechanical Centre)',
    location: 'Al Quoz, Dubai & Sharjah',
    city: 'Dubai',
    rating: 4.9,
    responseTime: '< 30 mins',
    inventoryCount: 64,
    brands: ['BMW', 'MINI', 'Rolls-Royce'],
    phone: '+971 800 2462',
    isVerified: true,
  },
  {
    id: 'd4',
    name: 'Gargash Enterprises',
    location: 'Sheikh Zayed Road & Deira',
    city: 'Dubai',
    rating: 4.8,
    responseTime: '1 hour',
    inventoryCount: 82,
    brands: ['Mercedes-Benz', 'Alfa Romeo', 'GAC'],
    phone: '+971 800 4274274',
    isVerified: true,
  },
];

export default function DealersPage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Dealers</span>
      </div>

      <h1 className={styles.pageTitle}>Verified Dealerships in UAE</h1>
      <p className={styles.pageSubtitle}>
        Connect directly with authorized distributors and verified dealers across Dubai, Abu Dhabi, and Sharjah.
      </p>

      <div className={styles.dealersGrid}>
        {dealersMock.map((dealer) => (
          <div key={dealer.id} className={styles.dealerCard}>
            <div className={styles.dealerTop}>
              <div className={styles.dealerLogo}>
                {dealer.name.charAt(0)}
              </div>
              <div className={styles.dealerInfo}>
                <h3 className={styles.dealerName}>{dealer.name}</h3>
                <div className={styles.dealerLocation}>
                  <MapPin size={13} />
                  <span>{dealer.location}</span>
                </div>
                <div className={styles.dealerBadges}>
                  {dealer.isVerified && (
                    <Badge label="Verified Dealer" type="success" />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.dealerStats}>
              <div>
                <div className={styles.dealerStatVal}>★ {dealer.rating}</div>
                <div className={styles.dealerStatLbl}>Rating</div>
              </div>
              <div>
                <div className={styles.dealerStatVal}>{dealer.responseTime}</div>
                <div className={styles.dealerStatLbl}>Response</div>
              </div>
              <div>
                <div className={styles.dealerStatVal}>{dealer.inventoryCount}</div>
                <div className={styles.dealerStatLbl}>Cars Listed</div>
              </div>
            </div>

            <div className={styles.dealerBrands}>
              {dealer.brands.map((b) => (
                <span key={b} className={styles.dealerBrandTag}>{b}</span>
              ))}
            </div>

            <div className={styles.dealerActions}>
              <a href={`tel:${dealer.phone}`} className="btn-light">
                <Phone size={14} /> Call Dealer
              </a>
              <Link href="/new-cars" className="btn-primary">
                View Inventory
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
