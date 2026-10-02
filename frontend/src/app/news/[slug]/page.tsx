'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Calendar, User, Clock, FileText } from 'lucide-react';
import { articlesService } from '@/services/articles.service';
import type { Article } from '@/types/article';
import Skeleton from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import styles from '@/app/reviews/content.module.css';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      articlesService.getBySlug(slug).then((res) => {
        setArticle(res || null);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Skeleton type="text" width="160px" height="14px" />
        </div>
        <div style={{ maxWidth: 800, margin: '24px auto' }}>
          <Skeleton type="title" width="85%" height="32px" />
          <Skeleton type="text" width="40%" height="14px" />
          <Skeleton type="image" height="320px" />
          <div style={{ marginTop: 20 }}>
            <Skeleton type="text" width="100%" />
            <Skeleton type="text" width="95%" />
            <Skeleton type="text" width="90%" />
          </div>
        </div>
      </div>
    );
  }

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
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} />
        ) : (
          <FileText size={48} />
        )}
      </div>

      <div className={styles.articleBody}>
        <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>
          {article.excerpt}
        </p>
        <p>
          {article.content || 'When shopping for a vehicle in the UAE market, upfront price often dominates the conversation. However, factors like localized GCC specifications, high-temperature cooling packages, regional fuel pricing, and realistic annual depreciation trends play a far more substantial role over a 3-to-5 year ownership cycle.'}
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
