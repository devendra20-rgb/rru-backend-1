import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './help.module.css';
import HelpFaq from './HelpFaq';

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description:
    'Answers to common questions about RideRoundUp — how to use the platform, vehicle data sources, cost-to-own, and more.',
};

export default function HelpPage() {
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Help &amp; FAQ</span>
      </div>

      <h1 className={styles.title}>Help &amp; Frequently Asked Questions</h1>
      <p className={styles.subtitle}>
        Answers to common questions about how RideRoundUp works, our data, and the platform.
        Can&apos;t find what you need?{' '}
        <Link href="/contact">Contact us</Link>.
      </p>

      <HelpFaq />
    </div>
  );
}
