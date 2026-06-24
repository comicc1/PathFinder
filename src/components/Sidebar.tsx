"use client";

import styles from "./Sidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  userName?: string | null;
  userEmail?: string | null;
};

function getInitials(value: string) {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return "PF";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const displayName = userName?.trim() || userEmail?.split("@")[0] || "PathFinder user";
  const avatarText = getInitials(displayName);
  
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
        <div className={styles.avatar}>{avatarText}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.userEmail}>{userEmail ?? "No email on file"}</span>
        </div>
      </div>
    </aside>
  );
}
