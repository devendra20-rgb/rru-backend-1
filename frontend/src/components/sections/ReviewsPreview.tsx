import { reviewsMock } from '@/data/homepage.mock';
import styles from './sections.module.css';

export default function ReviewsPreview() {
  const main = reviewsMock[0];
  const minis = reviewsMock.slice(1);

  return (
    <section className={styles.reviews} id="reviews-preview">
      <h2 className="section-title">What drivers are saying.</h2>
      <p className="section-subtitle">
        Real-world opinions alongside structured vehicle information.
      </p>

      <div className={styles.reviewGrid}>
        {/* Main review */}
        <div className={styles.reviewMain}>
          <div className={styles.stars}>★★★★★</div>
          <div className={styles.reviewText}>
            &ldquo;{main.content}&rdquo;
          </div>
          <div className={styles.reviewMeta}>
            Verified RRU reader · {main.authorLocation} · {main.vehicleName}
          </div>
        </div>

        {/* Mini reviews */}
        <div className={styles.reviewCards}>
          {minis.map((review) => (
            <div key={review._id} className={styles.miniReview}>
              <div className={styles.stars}>
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <div className={styles.miniReviewTitle}>{review.title}</div>
              <p className={styles.miniReviewText}>{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
