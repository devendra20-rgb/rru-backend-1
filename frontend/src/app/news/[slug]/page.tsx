'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Calendar, User, Clock, FileText } from 'lucide-react';
import { articlesMock } from '@/data/homepage.mock';
import { formatDate } from '@/lib/utils';
import styles from '@/app/reviews/content.module.css';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const article = articlesMock.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/news">News</Link>
          <ChevronRight size={12} />
          <span>Not Found</span>
        </div>
        <h1 style={{ marginTop: 40, textAlign: 'center' }}>Article not found</h1>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 8 }}>
          The article you are looking for does not exist or has been moved.
        </p>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/news" className="btn-primary">
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.articlePage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <Link href="/news">News & Blogs</Link>
        <ChevronRight size={12} />
        <span style={{ textTransform: 'capitalize' }}>{article.category.replace('-', ' ')}</span>
      </div>

      <header className={styles.articleHeader}>
        <div className={styles.articleCategoryBig}>
          {article.category.replace('-', ' ')}
        </div>
        <h1 className={styles.articleTitleBig}>{article.title}</h1>
        <div className={styles.articleMetaBig}>
          <span><User size={14} style={{ display: 'inline', marginRight: 4 }} />{article.author.name}</span>
          <span><Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />{formatDate(article.publishedAt)}</span>
          <span><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />{article.readingTime} min read</span>
        </div>
      </header>

      <div className={styles.articleHeroImg}>
        <FileText size={48} />
      </div>

      <div className={styles.articleBody}>
        <p>
          {article.excerpt}
        </p>
        <p>
          When shopping for a vehicle in the UAE market, upfront price often dominates the conversation. However, factors like localized GCC specifications, high-temperature cooling packages, regional fuel pricing, and realistic annual depreciation trends play a far more substantial role over a 3-to-5 year ownership cycle.
        </p>
        <p>
          At RideRoundUp, our mission is to empower automotive consumers with structured data transparency. Whether comparing powertrain efficiency, scheduled maintenance intervals, or insurance brackets, understanding total cost of ownership is the foundation of confident automotive decisions.
        </p>
      </div>

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/news" className="btn-light">
          ← Back to all articles
        </Link>
        <Link href="/new-cars" className="btn-primary">
          Explore New Cars
        </Link>
      </div>
    </div>
  );
}
