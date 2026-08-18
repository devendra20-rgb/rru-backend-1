import styles from './ui.module.css';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'info' | 'amber' | 'danger';
}

const typeMap: Record<string, string> = {
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  info: styles.badgeInfo,
  amber: styles.badgeAmber,
  danger: styles.badgeDanger,
};

export default function Badge({ label, type = 'info' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${typeMap[type] || styles.badgeInfo}`}>
      {label}
    </span>
  );
}
