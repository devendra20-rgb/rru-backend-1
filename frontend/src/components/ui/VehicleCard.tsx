'use client';

import Link from 'next/link';
import { Car, GitCompare } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { formatPrice, resolveMediaUrl } from '@/lib/utils';
import { useCompare } from '@/hooks/useCompare';
import Badge from './Badge';
import styles from './ui.module.css';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { isInCompare, addToCompare, removeFromCompare, isFull } = useCompare();
  const inCompare = isInCompare(vehicle.slug);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(vehicle.slug);
    } else {
      addToCompare(vehicle.slug);
    }
  };

  const displayModelName = vehicle.model.toLowerCase().startsWith(vehicle.brand.toLowerCase())
    ? vehicle.model
    : `${vehicle.brand} ${vehicle.model}`;

  return (
    <Link href={`/new-cars/${vehicle.slug}`} className={styles.vehicleCard}>
      <div className={styles.vehicleCardImg}>
        {vehicle.imageUrl ? (
          <img
            src={resolveMediaUrl(vehicle.imageUrl)}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className={styles.vehicleCardImage}
          />
        ) : (
          <Car size={32} />
        )}
        {vehicle.badges && vehicle.badges.length > 0 && (
          <div className={styles.vehicleCardBadges}>
            {vehicle.badges.map((badge) => (
              <Badge key={badge.label} label={badge.label} type={badge.type} />
            ))}
          </div>
        )}
        {/* Compare Toggle */}
        <button
          type="button"
          className={`${styles.compareToggle} ${inCompare ? styles.compareToggleActive : ''}`}
          onClick={handleCompareToggle}
          title={inCompare ? 'Remove from compare' : isFull ? 'Compare list full (max 4)' : 'Add to compare'}
          disabled={!inCompare && isFull}
        >
          <GitCompare size={14} />
        </button>
      </div>
      <div className={styles.vehicleCardInfo}>
        <div className={styles.vehicleCardMainContent}>
          <div className={styles.vehicleCardBrand}>{vehicle.brand}</div>
          <h3 className={styles.vehicleCardName}>
            {displayModelName}
          </h3>
          <div className={styles.vehicleCardVariant}>{vehicle.variant || ''}</div>
          <div className={styles.vehicleCardMeta}>
            {vehicle.bodyType} · {vehicle.fuelType} · {vehicle.transmission}
            {vehicle.seats ? ` · ${vehicle.seats} Seats` : ''}
          </div>
        </div>

        <div className={styles.vehicleCardBottom}>
          <div className={styles.vehicleCardReceipt}>
            <span>Price from</span>
            <span className={styles.vehicleCardReceiptValue}>
              {vehicle.priceFrom != null && vehicle.priceFrom > 0
                ? formatPrice(vehicle.priceFrom)
                : 'On request'}
            </span>
          </div>
          <div className={styles.vehicleCardReceipt}>
            <span>Est. monthly ownership</span>
            <span className={styles.vehicleCardReceiptValue}>
              {vehicle.costToOwnMonthly
                ? formatPrice(vehicle.costToOwnMonthly)
                : '—'}
            </span>
          </div>
          <div className={styles.vehicleCardChips}>
            {vehicle.tags && vehicle.tags.length > 0
              ? vehicle.tags.map((tag) => (
                  <span key={tag} className={styles.vehicleCardChip}>{tag}</span>
                ))
              : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
