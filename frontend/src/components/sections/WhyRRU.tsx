import { Database, DollarSign, GitCompare, Sparkles } from 'lucide-react';
import styles from './sections.module.css';

const reasons = [
  {
    icon: <Database size={20} />,
    title: 'Structured Data',
    desc: 'Brand, model, variant, specifications, features, colors and market data are organized consistently.',
  },
  {
    icon: <DollarSign size={20} />,
    title: 'Cost Honesty',
    desc: 'See ownership costs instead of relying only on the sticker price.',
  },
  {
    icon: <GitCompare size={20} />,
    title: 'Compare Clearly',
    desc: 'Make side-by-side decisions using the same structured attributes.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'AI With Sources',
    desc: 'The assistant answers from RRU data and makes assumptions visible.',
  },
];

export default function WhyRRU() {
  return (
    <section className={styles.why} id="why-rru">
      <h2 className="section-title">Why RideRoundUp?</h2>
      <p className="section-subtitle">
        Built around trustworthy vehicle data, useful comparisons and
        transparent ownership information.
      </p>
      <div className={styles.whyGrid}>
        {reasons.map((r) => (
          <div key={r.title} className={styles.whyCard}>
            <div className={styles.whyIcon}>{r.icon}</div>
            <h3 className={styles.whyTitle}>{r.title}</h3>
            <p className={styles.whyDesc}>{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
