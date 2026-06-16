"use client";

import styles from "./Sidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>PF</div>
        <span className={styles.logoText}>PathFinder</span>
      </div>
      
      <nav className={styles.nav}>
        <Link 
          href="/create-resume" 
          className={`${styles.navItem} ${isActive("/create-resume") ? styles.active : ""}`}
        >
          Create Resumes
        </Link>
        <Link 
          href="/" 
          className={`${styles.navItem} ${isActive("/") ? styles.active : ""}`}
        >
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
