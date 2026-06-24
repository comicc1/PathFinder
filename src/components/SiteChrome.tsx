import Link from "next/link";
import LoopingBackgroundVideo from "./LoopingBackgroundVideo";
import styles from "./SiteChrome.module.css";

type SiteChromeProps = {
  title?: string;
  eyebrow?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showNav?: boolean;
  showHero?: boolean;
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
  showHero = true,
  children,
}: SiteChromeProps) {
  return (
    <div className={styles.shell}>
      <LoopingBackgroundVideo />
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
          
        </div>
      </header>

      <main className={styles.main}>
        {showHero ? (
          <section className={styles.hero}>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            {title ? <h1>{title}</h1> : null}
            {description ? <p>{description}</p> : null}
          </section>
        ) : null}
        {children}
      </main>
    </div>
  );
}
