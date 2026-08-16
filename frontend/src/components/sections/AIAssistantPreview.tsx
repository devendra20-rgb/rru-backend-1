import Link from 'next/link';
import styles from './sections.module.css';

export default function AIAssistantPreview() {
  return (
    <section className={styles.ai} id="ai-assistant-preview">
      <div className={styles.aiGrid}>
        <div>
          <div className={`eyebrow ${styles.aiEyebrow}`}>RIDE ROUNDUP AI</div>
          <h2 className={styles.aiTitle}>
            Ask for a car like you&apos;d ask a friend.
          </h2>
          <p className={styles.aiDesc}>
            Tell us your budget, family size, fuel preference or use case. The
            assistant answers from RRU&apos;s structured vehicle data and shows
            its assumptions and sources.
          </p>
          <Link href="/ai-assistant" className="btn-primary">
            Ask the AI Assistant
          </Link>
        </div>

        <div className={styles.chat}>
          <div className={`${styles.bubble} ${styles.bubbleUser}`}>
            I need a 7-seater under AED 150k for family trips.
          </div>
          <div className={`${styles.bubble} ${styles.bubbleBot}`}>
            <div className={styles.bubbleBotTitle}>
              Here are 3 strong matches.
            </div>
            <div>
              1. Nissan X-Terra — AED 146k
              <br />
              2. Kia Sorento — AED 139k
              <br />
              3. Hyundai Palisade — AED 149k
            </div>
            <div className={styles.bubbleSource}>
              Based on UAE market data · verified 06 Aug 2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
