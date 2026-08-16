import styles from './ui.module.css';

interface SkeletonProps {
  type?: 'text' | 'title' | 'image' | 'card';
  width?: string;
  height?: string;
  count?: number;
}

export default function Skeleton({ type = 'text', width, height, count = 1 }: SkeletonProps) {
  const typeClass = {
    text: styles.skeletonText,
    title: styles.skeletonTitle,
    image: styles.skeletonImage,
    card: '',
  };

  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={`${styles.skeleton} ${styles.skeletonImage}`} />
            <div style={{ padding: '17px' }}>
              <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '40%' }} />
              <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60%' }} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80%', marginTop: '12px' }} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80%' }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${styles.skeleton} ${typeClass[type]}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
}
