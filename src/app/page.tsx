"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>PF</div>
          </div>
          <h1 className={styles.heroTitle}>PathFinder.</h1>
          <p className={styles.heroSubtitle}>
            Optimize your resume with AI-powered insights and create stunning professional documents
          </p>
          <p className={styles.heroDescription}>
            Get comprehensive feedback to land your dream job
          </p>
        </div>

        <div className={styles.heroDecoration}></div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>What We Offer</h2>
          <p>Choose the tool you need to advance your career</p>
        </div>

        <div className={styles.featureGrid}>
          {/* Resume Analyzer Card */}
          <Link href="/analyzer" className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Resume Analyzer</h3>
            <p className={styles.featureDescription}>
              Get AI-powered analysis of your resume with actionable recommendations to improve your chances
            </p>
            <div className={styles.featureHighlight}>
              <span>✓ Professional feedback</span>
              <span>✓ Strengths analysis</span>
              <span>✓ Improvement tips</span>
            </div>
            <div className={styles.ctaButton}>
              Analyze Your Resume
              <span>→</span>
            </div>
          </Link>

          {/* Create Resume Card */}
          <Link href="/create-resume" className={styles.featureCard}>
            <div className={styles.featureIcon}>✍️</div>
            <h3>Create Resume</h3>
            <p className={styles.featureDescription}>
              Build a professional resume from scratch using modern templates or import your existing one
            </p>
            <div className={styles.featureHighlight}>
              <span>✓ Modern templates</span>
              <span>✓ Easy editor</span>
              <span>✓ PDF export</span>
            </div>
            <div className={styles.ctaButton}>
              Create New Resume
              <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.landingFooter}>
        <p>© {new Date().getFullYear()} PathFinder. All rights reserved.</p>
      </footer>
    </div>
  );
}
