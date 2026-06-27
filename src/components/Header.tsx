"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./SiteChrome.module.css";

type HeaderProps = {
  showNav?: boolean;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function Header({
  showNav = true,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.header}>
        <Link href="/" className={styles.brand} onClick={() => setIsMenuOpen(false)}>
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

          {showNav && (
            <button
              className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className={styles.menuIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {showNav && isMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav} aria-label="Mobile">
            <Link href="/analyzer" onClick={() => setIsMenuOpen(false)}>
              Analyzer
            </Link>
            <Link href="/create-resume" onClick={() => setIsMenuOpen(false)}>
              Create Resume
            </Link>
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>

            {(secondaryHref || primaryHref) && (
              <div className={styles.mobileActions}>
                {secondaryHref && secondaryLabel ? (
                  <Link
                    href={secondaryHref}
                    className={styles.mobileSecondaryButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {secondaryLabel}
                  </Link>
                ) : null}
                {primaryHref && primaryLabel ? (
                  <Link
                    href={primaryHref}
                    className={styles.mobilePrimaryButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {primaryLabel}
                  </Link>
                ) : null}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
