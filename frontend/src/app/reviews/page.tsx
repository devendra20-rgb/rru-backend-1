'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { reviewsMock } from '@/data/homepage.mock';
import styles from './content.module.css';

export default function ReviewsPage() {
  const [filterBrand, setFilterBrand] = useState<string>('all');

  const filteredReviews = filterBrand === 'all'
    ? reviewsMock
    : reviewsMock.filter((r) => r.vehicleName.toLowerCase().includes(filterBrand.toLowerCase()));

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Reviews</span>
      </div>

      <h1 className={styles.pageTitle}>Driver Reviews & Ratings</h1>
      <p className={styles.pageSubtitle}>
        Real experiences and transparent feedback from verified car owners across the UAE.
      </p>

      {/* Review Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statsBig}>
          <div className={styles.statsBigNumber}>4.8</div>
          <div className={styles.statsBigStars}>★★★★★</div>
          <div className={styles.statsBigCount}>Based on 1,420+ driver reviews</div>
        </div>

        <div className={styles.statsDistribution}>
          <div className={styles.statsRow}>
            <span className={styles.statsRowLabel}>5 Star</span>
            <div className={styles.statsRowBar}>
              <div className={styles.statsRowBarFill} style={{ width: '82%' }} />
            </div>
            <span className={styles.statsRowCount}>82%</span>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statsRowLabel}>4 Star</span>
            <div className={styles.statsRowBar}>
              <div className={styles.statsRowBarFill} style={{ width: '13%' }} />
            </div>
            <span className={styles.statsRowCount}>13%</span>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statsRowLabel}>3 Star</span>
            <div className={styles.statsRowBar}>
              <div className={styles.statsRowBarFill} style={{ width: '3%' }} />
            </div>
            <span className={styles.statsRowCount}>3%</span>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statsRowLabel}>2 Star</span>
            <div className={styles.statsRowBar}>
              <div className={styles.statsRowBarFill} style={{ width: '1%' }} />
            </div>
            <span className={styles.statsRowCount}>1%</span>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statsRowLabel}>1 Star</span>
            <div className={styles.statsRowBar}>
              <div className={styles.statsRowBarFill} style={{ width: '1%' }} />
            </div>
            <span className={styles.statsRowCount}>1%</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterBtn} ${filterBrand === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilterBrand('all')}
        >
          All Reviews
        </button>
        <button
          className={`${styles.filterBtn} ${filterBrand === 'toyota' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilterBrand('toyota')}
        >
          Toyota
        </button>
        <button
          className={`${styles.filterBtn} ${filterBrand === 'nissan' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilterBrand('nissan')}
        >
          Nissan
        </button>
        <button
          className={`${styles.filterBtn} ${filterBrand === 'bmw' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilterBrand('bmw')}
        >
          BMW
        </button>
      </div>

      {/* Review Grid */}
      <div className={styles.reviewGrid}>
        {filteredReviews.map((review) => (
          <div key={review._id} className={styles.reviewCard}>
            <div className={styles.reviewStars}>
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>
            <h3 className={styles.reviewTitle}>{review.title}</h3>
            <p className={styles.reviewContent}>{review.content}</p>

            <div className={styles.reviewMeta}>
              <span className={styles.reviewVerified}>✓ Verified Owner</span>
              <span>·</span>
              <span>{review.authorName}</span>
              {review.authorLocation && (
                <>
                  <span>·</span>
                  <span>{review.authorLocation}</span>
                </>
              )}
            </div>

            <div className={styles.reviewVehicle}>
              🚗 {review.vehicleName}
            </div>

            <div className={styles.ratingsGrid}>
              <div className={styles.ratingItem}>
                <div className={styles.ratingItemValue}>4.9</div>
                <div className={styles.ratingItemLabel}>Comfort</div>
              </div>
              <div className={styles.ratingItem}>
                <div className={styles.ratingItemValue}>4.8</div>
                <div className={styles.ratingItemLabel}>Reliability</div>
              </div>
              <div className={styles.ratingItem}>
                <div className={styles.ratingItemValue}>4.7</div>
                <div className={styles.ratingItemLabel}>Value</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
