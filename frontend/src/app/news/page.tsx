'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { articlesMock } from '@/data/homepage.mock';
import { formatDate } from '@/lib/utils';
import styles from '@/app/reviews/content.module.css';

export default function NewsPage() {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredArticles = selectedCat === 'all'
    ? articlesMock
    : articlesMock.filter((a) => a.category === selectedCat);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>News & Blogs</span>
      </div>

      <h1 className={styles.pageTitle}>Automotive News & Guides</h1>
      <p className={styles.pageSubtitle}>
        Latest automotive trends, UAE buying guides, EV analyses, and ownership tips.
      </p>

      {/* Categories */}
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterBtn} ${selectedCat === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCat('all')}
        >
          All Stories
        </button>
        <button
          className={`${styles.filterBtn} ${selectedCat === 'buying-guide' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCat('buying-guide')}
        >
          Buying Guides
        </button>
        <button
          className={`${styles.filterBtn} ${selectedCat === 'ev' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCat('ev')}
        >
          EV & Tech
        </button>
        <button
          className={`${styles.filterBtn} ${selectedCat === 'news' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCat('news')}
        >
          Market News
        </button>
      </div>

      {/* News Grid */}
      <div className={styles.newsGrid}>
        {filteredArticles.map((article) => (
          <Link
            key={article._id}
            href={`/news/${article.slug}`}
            className={styles.articleCard}
          >
            <div className={styles.articleCardImg}>
              <FileText size={32} />
            </div>
            <div className={styles.articleCardInfo}>
              <div className={styles.articleCardCategory}>
                {article.category.replace('-', ' ')}
              </div>
              <h3 className={styles.articleCardTitle}>{article.title}</h3>
              <p className={styles.articleCardExcerpt}>{article.excerpt}</p>
              <div className={styles.articleCardMeta}>
                <span>{article.author.name}</span>
                <span>{article.readingTime} min read · {formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
