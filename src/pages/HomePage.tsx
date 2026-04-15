import Avatar from '@/components/Avatar';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>WorkFlow PoC</h1>
        <p className={styles.subtitle}>Proof of Concept</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Команда</h2>
        <div className={styles.avatarRow}>
          <Avatar name="Anton Termolaev" size="lg" status="online" ring />
          <Avatar name="Ivan Petrov" size="lg" status="away" />
          <Avatar name="Maria Sidorova" size="lg" status="busy" />
          <Avatar size="lg" status="offline" />
        </div>
      </section>
    </main>
  );
}

export default HomePage;
