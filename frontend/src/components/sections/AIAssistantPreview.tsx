import Link from 'next/link';
import { Sparkles, Bot } from 'lucide-react';
import styles from './sections.module.css';

export default function AIAssistantPreview() {
  return (
    <section className={styles.ai} id="ai-assistant-preview">
      <div className={styles.aiGrid}>
        <div>
          <div className={`eyebrow ${styles.aiEyebrow}`}>
            <Bot size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            MEET RIDEIQ
          </div>
          <h2 className={styles.aiTitle}>
            Ask for a car like you&apos;d ask a friend.
          </h2>
          <p className={styles.aiDesc}>
            Tell RideIQ your budget, family size, fuel preference or use case.
            The assistant answers from RRU&apos;s verified vehicle data and shows
            its assumptions and sources.
          </p>
          <Link href="/ai-assistant" className="btn-primary">
            <Sparkles size={15} /> Ask RideIQ Assistant
          </Link>
        </div>

        <div className={styles.chat}>
          <div className={`${styles.bubble} ${styles.bubbleUser}`}>
            I need a 7-seater under AED 150k for family trips.
          </div>
          <div className={`${styles.bubble} ${styles.bubbleBot}`}>
            <div className={styles.bubbleBotTitle}>
              ✨ RideIQ: Here are 3 strong matches:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
              <Link
                href="/new-cars/nissan-x-terra-25l-s-4wd-2026"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'var(--mist)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  color: 'var(--deep)',
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                <span>1. Nissan X-Terra (4WD)</span>
                <span style={{ color: 'var(--amber)' }}>AED 146,000 →</span>
              </Link>
              <Link
                href="/new-cars"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'var(--mist)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  color: 'var(--deep)',
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                <span>2. Kia Sorento LX</span>
                <span style={{ color: 'var(--amber)' }}>AED 139,000 →</span>
              </Link>
              <Link
                href="/new-cars"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'var(--mist)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  color: 'var(--deep)',
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                <span>3. Hyundai Palisade</span>
                <span style={{ color: 'var(--amber)' }}>AED 149,000 →</span>
              </Link>
            </div>
            <div className={styles.bubbleSource}>
              ✓ Verified UAE automotive data · powered by RideIQ
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
