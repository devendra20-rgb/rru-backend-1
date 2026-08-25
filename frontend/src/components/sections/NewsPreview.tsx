'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { articlesService } from '@/services/articles.service';
import type { Article } from '@/types/article';
import styles from './sections.module.css';

export default function NewsPreview() {
  const [articles, setArticles] = useState<Article[]>([]);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    articlesService.getAll().then(setArticles).catch(console.error);
  }, []);

  const checkScroll = () => {
    if (scrollTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollTrackRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // use -1 to account for fractional pixel differences
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [articles]);

  const handleScrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -scrollTrackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: scrollTrackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  if (articles.length === 0) return null;

  return (
    <section className={styles.news} id="news-preview">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 className="section-title">Latest from the automotive world.</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            News, UAE buying guides, EV analyses and ownership advice.
          </p>
        </div>
        <Link href="/news" className="btn-light" style={{ fontSize: 12, padding: '8px 16px' }}>
          View All Stories →
        </Link>
      </div>

      <div className={styles.carouselWrapper}>
        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll Left"
          style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          className={styles.newsCarouselTrack} 
          ref={scrollTrackRef}
          onScroll={checkScroll}
        >
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/news/${article.slug}`}
              className={styles.article}
            >
              <div className={styles.articleImg}>
                <FileText size={28} />
              </div>
              <div className={styles.articleInfo}>
                <div className={styles.articleCategory}>
                  {article.category.replace('-', ' ').toUpperCase()}
                </div>
                <h3 className={styles.articleTitle} title={article.title}>{article.title}</h3>
                <p className={styles.articleExcerpt}>{article.excerpt}</p>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{article.author.name}</span>
                  <span>{article.readingTime} min read</span>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <span className="btn-light" style={{ display: 'block', textAlign: 'center', fontSize: '13px', padding: '8px 12px' }}>
                    View Article &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll Right"
          style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
