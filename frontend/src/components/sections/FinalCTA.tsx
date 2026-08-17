import Link from 'next/link';
import styles from './sections.module.css';

export default function FinalCTA() {
  return (
    <section className={styles.finalCta} id="final-cta">
      <h2 className={styles.finalTitle}>Ready to find your next car?</h2>
      <p className={styles.finalDesc}>
        Discover. Compare. Decide with confidence.
      </p>
      <Link href="/new-cars" className="btn-primary">
        Explore Cars
      </Link>
    </section>
  );
}
