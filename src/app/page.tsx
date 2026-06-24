import Link from "next/link";
import styles from "./page.module.css";
import { getOptionalUser } from "@/lib/supabase/auth";
import SiteChrome from "@/components/SiteChrome";

export default async function Home() {
  const user = await getOptionalUser();
  const isGuest = !user;
  const primaryHref = isGuest ? "/login?mode=sign-up" : "/dashboard";
  const primaryLabel = isGuest ? "Sign Up" : "Dashboard";

  return (
    <div className={styles.landingPage}>
      <SiteChrome
        showHero={false}
        showNav={false}
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
      >
        <nav className={styles.landingNav} aria-label="Landing">
          <Link href="/analyzer">Analyzer</Link>
          <Link href="/create-resume">Create Resume</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <section className={styles.hero}>
          <p className={styles.phrase}>One workspace for every resume.</p>
          <Link href={primaryHref} className={styles.openAppButton}>
            {primaryLabel}
          </Link>
        </section>
      </SiteChrome>
    </div>
  );
}
