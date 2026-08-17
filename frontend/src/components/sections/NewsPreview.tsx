import Link from 'next/link';
import { FileText } from 'lucide-react';
import { articlesMock } from '@/data/homepage.mock';
import styles from './sections.module.css';

export default function NewsPreview() {
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

      <div className={styles.newsGrid}>
        {articlesMock.map((article) => (
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
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleExcerpt}>{article.excerpt}</p>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>{article.author.name}</span>
                <span>{article.readingTime} min read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
