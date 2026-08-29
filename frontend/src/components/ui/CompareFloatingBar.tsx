'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { vehiclesService } from '@/services/vehicles.service';
import type { Vehicle } from '@/types/vehicle';
import styles from './comparefloating.module.css';

export default function CompareFloatingBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const pathname = usePathname();
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});

  // Resolve slugs to vehicle data for thumbnails
  useEffect(() => {
    compareList.forEach((slug) => {
      if (!vehicles[slug]) {
        vehiclesService.getBySlug(slug).then((v) => {
          if (v) setVehicles((prev) => ({ ...prev, [slug]: v }));
        }).catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareList]);

  // Don't show on the compare page itself
  if (pathname === '/compare') return null;
  // Don't show if fewer than 1 vehicle selected
  if (compareList.length < 1) return null;

  return (
    <div className={styles.floatingBar}>
      <div className={styles.floatingInner}>
        <div className={styles.floatingLeft}>
          <GitCompare size={16} className={styles.floatingIcon} />
          <span className={styles.floatingLabel}>
            Compare ({compareList.length})
          </span>
          <div className={styles.floatingThumbs}>
            {compareList.map((slug) => {
              const v = vehicles[slug];
              return (
                <div key={slug} className={styles.floatingThumb}>
                  {v?.imageUrl ? (
                    <img src={v.imageUrl} alt={v.model} />
                  ) : (
                    <span className={styles.floatingThumbPlaceholder}>
                      {slug.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles.floatingThumbRemove}
                    onClick={() => removeFromCompare(slug)}
                    title="Remove"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.floatingRight}>
          <button type="button" className={styles.clearBtn} onClick={clearCompare}>
            Clear
          </button>
          <Link
            href={`/compare?slugs=${compareList.join(',')}`}
            className={styles.compareBtn}
          >
            Compare Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
