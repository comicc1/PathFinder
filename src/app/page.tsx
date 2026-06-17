import Link from "next/link";
import styles from "./page.module.css";
import { ResumeAnalyzerIcon } from "@/components/ResumeAnalyzerIcon";
import { CreateResumeIcon } from "@/components/CreateResumeIcon";
import { getOptionalUser } from "@/lib/supabase/auth";

export default async function Home() {
  const user = await getOptionalUser();

  return (
    <div className={styles.landingPage}>
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

          <div className={styles.heroActions}>
            {user ? (
              <>
                <Link href="/dashboard" className={styles.heroButtonPrimary}>
                  Open dashboard
                </Link>
                <Link href="/create-resume" className={styles.heroButtonSecondary}>
                  Save a draft
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.heroButtonPrimary}>
                  Sign in
                </Link>
                <Link href="/dashboard" className={styles.heroButtonSecondary}>
                  View dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.heroDecoration}></div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>What We Offer</h2>
          <p>Choose the tool you need to advance your career</p>
        </div>

        <div className={styles.featureGrid}>
          <Link href="/analyzer" className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ResumeAnalyzerIcon />
            </div>
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

          <Link href="/create-resume" className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <CreateResumeIcon />
            </div>
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

      <footer className={styles.landingFooter}>
        <p>© {new Date().getFullYear()} PathFinder. All rights reserved.</p>
      </footer>
    </div>
  );
}
