'use client';

import Link from 'next/link';
import { Car, GitCompare, Zap, ArrowRight } from 'lucide-react';
import type { ModelGroup } from '@/lib/modelGroup';
import { formatPrice, resolveMediaUrl } from '@/lib/utils';
import { useCompare } from '@/hooks/useCompare';
import Badge from './Badge';
import styles from './ModelCard.module.css';

interface ModelCardProps {
  modelGroup: ModelGroup;
}

export default function ModelCard({ modelGroup }: ModelCardProps) {
  const { isInCompare, addToCompare, removeFromCompare, isFull } = useCompare();

  // Primary variant (lowest price or first variant)
  const primaryVariant = modelGroup.variants[0];
  const inCompare = isInCompare(primaryVariant.slug);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(primaryVariant.slug);
    } else {
      addToCompare(primaryVariant.slug);
    }
  };

  const hasMultipleVariants = modelGroup.variants.length > 1;

  // Format price display
  const priceDisplay = () => {
    if (modelGroup.minPrice <= 0) return 'On Request';
    if (modelGroup.minPrice === modelGroup.maxPrice || !hasMultipleVariants) {
      return formatPrice(modelGroup.minPrice);
    }
    return `${formatPrice(modelGroup.minPrice)} – ${formatPrice(modelGroup.maxPrice)}`;
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        {/* Image / Media */}
        <div className={styles.imageContainer}>
          {modelGroup.imageUrl ? (
            <img
              src={resolveMediaUrl(modelGroup.imageUrl)}
              alt={`${modelGroup.brand} ${modelGroup.model}`}
              className={styles.carImg}
            />
          ) : (
            <div className={styles.carPlaceholder}>
              <Car size={36} />
            </div>
          )}

          {/* Badges */}
          {modelGroup.badges && modelGroup.badges.length > 0 && (
            <div className={styles.badgeGroup}>
              {modelGroup.badges.slice(0, 2).map((badge) => (
                <Badge key={badge.label} label={badge.label} type={badge.type} />
              ))}
            </div>
          )}

          {/* Variant Count Badge */}
          {hasMultipleVariants && (
            <div className={styles.variantCountBadge}>
              <Zap size={11} /> {modelGroup.variants.length} Variants
            </div>
          )}

          {/* Quick Compare Button */}
          <button
            type="button"
            className={`${styles.compareBtn} ${inCompare ? styles.compareBtnActive : ''}`}
            onClick={handleCompareToggle}
            title={
              inCompare
                ? `Remove ${modelGroup.brand} ${modelGroup.model} from compare`
                : isFull
                ? 'Compare list is full (max 4)'
                : `Add ${modelGroup.brand} ${modelGroup.model} to compare`
            }
            disabled={!inCompare && isFull}
          >
            <GitCompare size={14} />
          </button>
        </div>

        {/* Content Info */}
        <div className={styles.cardBody}>
          <div className={styles.brandTitle}>{modelGroup.brand}</div>
          <h3 className={styles.modelName}>
            <Link href={`/new-cars/${primaryVariant.slug}`}>
              {modelGroup.brand} {modelGroup.model}
            </Link>
          </h3>

          <div className={styles.metaRow}>
            <span>{modelGroup.year}</span>
            <span>·</span>
            <span>{modelGroup.bodyType}</span>
            <span>·</span>
            <span>{modelGroup.fuelTypes.join(', ')}</span>
            {modelGroup.seats ? (
              <>
                <span>·</span>
                <span>{modelGroup.seats} Seats</span>
              </>
            ) : null}
          </div>

          {/* Price & Monthly Cost Receipt */}
          <div className={styles.receiptBox}>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>
                {hasMultipleVariants ? 'Price Range' : 'Starting Price'}
              </span>
              <span className={styles.receiptPrice}>{priceDisplay()}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Est. Monthly Ownership</span>
              <span className={styles.receiptMonthly}>
                {modelGroup.minMonthlyCost > 0
                  ? `from ${formatPrice(modelGroup.minMonthlyCost)}/mo`
                  : 'On Request'}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className={styles.cardActions}>
            <Link href={`/new-cars/${primaryVariant.slug}`} className={styles.btnPrimary}>
              <span>Explore Model &amp; Variants</span>
              <ArrowRight size={14} style={{ marginLeft: 6 }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
