import Header from "./Header";
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
      <Header
        showNav={showNav}
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        secondaryHref={secondaryHref}
        secondaryLabel={secondaryLabel}
      />

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
