'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import styles from './help.module.css';

const FAQ_SECTIONS = [
  {
    category: 'Using RideRoundUp',
    items: [
      {
        q: 'What is RideRoundUp?',
        a: 'RideRoundUp is an automotive research platform for the UAE. We provide accurate vehicle specifications, side-by-side comparisons, real ownership cost estimates, and editorial reviews — all in one place.',
      },
      {
        q: 'Is RideRoundUp free to use?',
        a: 'Yes. Browsing vehicles, comparing trims, reading reviews, and using our cost-to-own calculator are all completely free. We do not require registration to access any core features.',
      },
      {
        q: 'How do I compare two or more cars?',
        a: 'Open any vehicle detail page and click "Add to Compare". You can add up to 3 vehicles. A floating bar will appear at the bottom of the screen — click "Compare" to view the full side-by-side breakdown.',
      },
      {
        q: 'What does the Cost to Own calculator include?',
        a: 'Our calculator estimates annual fuel cost, insurance (approximate bracket), registration, and scheduled service based on manufacturer intervals and UAE labour rates. All figures are estimates and should be verified with your insurer and dealer.',
      },
    ],
  },
  {
    category: 'Vehicle Data',
    items: [
      {
        q: 'Where does your vehicle data come from?',
        a: 'We build our database from official manufacturer specification sheets, confirmed dealer lists, and regional pricing announcements. We do not rely on scraped or crowd-sourced data.',
      },
      {
        q: 'I found a specification error. How do I report it?',
        a: 'Please email data@rideroundup.com with the vehicle name, the incorrect field, and what the correct value should be. We review and correct verified reports within a few business days.',
      },
      {
        q: 'Why is a variant or trim I know exists not listed?',
        a: 'We add variants as manufacturer confirmations and pricing become available for the UAE market. Some trims available in other GCC markets may not yet be confirmed for UAE sale.',
      },
      {
        q: 'Are prices in AED?',
        a: 'Yes. All prices shown are in UAE Dirhams (AED) and reflect the UAE market unless explicitly labelled otherwise.',
      },
    ],
  },
  {
    category: 'Verified Dealers',
    items: [
      {
        q: 'What is a Verified Dealer?',
        a: 'Verified Dealers are automotive dealerships that have been reviewed and listed on RideRoundUp. Listing as a Verified Dealer does not influence search results or vehicle rankings.',
      },
      {
        q: 'How do I become a Verified Dealer?',
        a: 'Contact our partnerships team at partners@rideroundup.com to start the process. We will review your dealership details and get back to you.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    items: [
      {
        q: 'Do I need an account to use the platform?',
        a: 'No. All browsing, comparing, and research features are available without an account. An account may be required for some personalisation features in the future.',
      },
      {
        q: 'What data does RideRoundUp collect?',
        a: 'We collect standard analytics data (pages visited, device type) and any information you voluntarily provide, such as an email address. See our Privacy Policy for the full breakdown.',
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button className={styles.faqQuestion} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <ChevronDown
          size={16}
          className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
        />
      </button>
      {open && <div className={styles.faqAnswer}>{a}</div>}
    </div>
  );
}

export default function HelpFaq() {
  return (
    <>
      <div className={styles.faqBody}>
        {FAQ_SECTIONS.map((section) => (
          <div key={section.category} className={styles.faqSection}>
            <h2 className={styles.faqCategory}>{section.category}</h2>
            <div className={styles.faqList}>
              {section.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.contactCta}>
        <p>Still have a question?</p>
        <Link href="/contact" className={styles.contactCtaLink}>
          Contact our team →
        </Link>
      </div>
    </>
  );
}
