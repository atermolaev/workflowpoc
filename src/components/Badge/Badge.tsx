import styles from './Badge.module.css';
import type { BadgeProps, BadgeVariant } from './Badge.types';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  gray:   styles.gray,
  blue:   styles.blue,
  orange: styles.orange,
  purple: styles.purple,
  green:  styles.green,
  red:    styles.red,
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${VARIANT_CLASS[variant]}`}>
      {children}
    </span>
  );
}
