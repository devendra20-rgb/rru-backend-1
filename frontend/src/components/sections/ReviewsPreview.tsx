'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { reviewsService } from '@/services/reviews.service';
import type { Review } from '@/types/review';
import styles from './sections.module.css';

function MiniReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const textTruncated = textRef.current.scrollHeight > textRef.current.clientHeight + 1;
        const titleTruncated = titleRef.current ? titleRef.current.scrollHeight > titleRef.current.clientHeight + 1 : false;
        setIsTruncated(textTruncated || titleTruncated || review.content.length > 80);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [review.content, review.title]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <Link href="/reviews" className={styles.miniReview} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.stars}>
        {'★'.repeat(review.rating)}
        {'☆'.repeat(5 - review.rating)}
      </div>
      <div ref={titleRef} className={isExpanded ? styles.miniReviewTitleExpanded : styles.miniReviewTitle}>
        {review.title}
      </div>
      <p ref={textRef} className={isExpanded ? styles.miniReviewTextExpanded : styles.miniReviewText}>
        {review.content}
      </p>
      {isTruncated && (
        <span
          role="button"
          tabIndex={0}
          onClick={toggleExpand}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }
          }}
          className={styles.viewMoreBtn}
        >
          {isExpanded ? 'View less' : 'View more'}
        </span>
      )}
    </Link>
  );
}

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    reviewsService.getAll().then(setReviews).catch(console.error);
  }, []);

  if (reviews.length === 0) return null;

  const main = reviews[0];
  const leftMini = reviews[1];
  const rightMinis = reviews.slice(2, 4);

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
        {/* Left column: Main review + 1 mini review */}
        <div className={styles.reviewLeftCol}>
          {main && (
            <Link href="/reviews" className={styles.reviewMain} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.stars}>★★★★★</div>
              <div className={styles.reviewText}>
                &ldquo;{main.content}&rdquo;
              </div>
              <div className={styles.reviewMeta}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Verified RRU Reader</span> · {main.authorLocation || 'Dubai'} · {main.vehicleName}
              </div>
            </Link>
          )}

          {leftMini && <MiniReviewCard review={leftMini} />}
        </div>

        {/* Right column: Remaining mini reviews */}
        <div className={styles.reviewCards}>
          {rightMinis.map((review) => (
            <MiniReviewCard key={review._id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
