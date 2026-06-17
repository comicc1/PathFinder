import Link from "next/link";
import styles from "./SiteChrome.module.css";

type SiteChromeProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showNav?: boolean;
  children?: React.ReactNode;
};

export default function SiteChrome({
  title,
  eyebrow,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  showNav = true,
  children,
}: SiteChromeProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>PF</span>
          <span className={styles.brandText}>PathFinder</span>
        </Link>
        {showNav ? (
          <nav className={styles.nav} aria-label="Primary">
            <Link href="/analyzer">Analyzer</Link>
            <Link href="/create-resume">Create Resume</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        ) : (
          <div className={styles.navSpacer} />
        )}
        <div className={styles.actions}>
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className={styles.secondaryButton}>
              {secondaryLabel}
            </Link>
          ) : null}
          {primaryHref && primaryLabel ? (
            <Link href={primaryHref} className={styles.primaryButton}>
              {primaryLabel}
            </Link>
          ) : null}
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </section>
        {children}
      </main>
    </div>
  );
}
