'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reviewsService } from '@/services/reviews.service';
import type { Review } from '@/types/review';
import styles from './sections.module.css';

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    reviewsService.getAll().then(setReviews).catch(console.error);
  }, []);

  if (reviews.length === 0) return null;

  const main = reviews[0];
  const minis = reviews.slice(1, 4);

  return (
    <section className={styles.reviews} id="reviews-preview">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 className="section-title">What drivers are saying.</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Real-world opinions alongside structured vehicle information.
          </p>
        </div>
        <Link href="/reviews" className="btn-light" style={{ fontSize: 12, padding: '8px 16px' }}>
          View All Reviews →
        </Link>
      </div>

      <div className={styles.reviewGrid}>
        {/* Main review */}
        <Link href="/reviews" className={styles.reviewMain} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.stars}>★★★★★</div>
          <div className={styles.reviewText}>
            &ldquo;{main.content}&rdquo;
          </div>
          <div className={styles.reviewMeta}>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Verified RRU Reader</span> · {main.authorLocation || 'Dubai'} · {main.vehicleName}
          </div>
        </Link>

        {/* Mini reviews */}
        <div className={styles.reviewCards}>
          {minis.map((review) => (
            <Link key={review._id} href="/reviews" className={styles.miniReview} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.stars}>
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <div className={styles.miniReviewTitle}>{review.title}</div>
              <p className={styles.miniReviewText}>{review.content}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
