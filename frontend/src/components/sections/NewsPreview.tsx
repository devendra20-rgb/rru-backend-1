import Link from 'next/link';
import { FileText } from 'lucide-react';
import { articlesMock } from '@/data/homepage.mock';
import styles from './sections.module.css';

export default function NewsPreview() {
  return (
    <section className={styles.news} id="news-preview">
      <h2 className="section-title">Latest from the automotive world.</h2>
      <p className="section-subtitle">
        News, buying guides, reviews and useful car content.
      </p>

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
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
