import styles from "./Sidebar.module.css";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>PF</div>
        <span className={styles.logoText}>PathFinder</span>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/create-resume" className={styles.navItem}>
          Create Resumes
        </Link>
        <Link href="/" className={`${styles.navItem} ${styles.active}`}>
          Resume Analyzer
        </Link>
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>JD</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>John Doe</span>
          <span className={styles.userEmail}>john@example.com</span>
        </div>
      </div>
    </aside>
  );
}
