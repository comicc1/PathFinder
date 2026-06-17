import Link from "next/link";
import styles from "./page.module.css";
import { ResumeAnalyzerIcon } from "@/components/ResumeAnalyzerIcon";
import { CreateResumeIcon } from "@/components/CreateResumeIcon";
import { getOptionalUser } from "@/lib/supabase/auth";
import SiteChrome from "@/components/SiteChrome";

const featurePack = [
  "Resume scoring",
  "Draft history",
  "Template starter",
  "PDF import",
  "Skill targeting",
  "Private dashboard",
  "Saved analyses",
  "Action notes",
  "Account sync",
];

export default async function Home() {
  const user = await getOptionalUser();

  return (
    <div className={styles.landingPage}>
      <SiteChrome
        title="Build better lineups"
        eyebrow="AI resume intelligence"
        description="Use smart data to build better resume drafts, sharpen your positioning, and keep every iteration in one focused workspace."
        primaryHref={user ? "/dashboard" : "/login"}
        primaryLabel={user ? "Open app" : "Start trial"}
        secondaryHref="/analyzer"
        secondaryLabel="Learn more"
      >
        <section className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div className={styles.heroActions}>
              <Link href="/create-resume" className={styles.heroButtonPrimary}>
                Start my free trial
              </Link>
              <Link href="/dashboard" className={styles.heroButtonSecondary}>
                View dashboard
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualBase}>
              <div className={styles.visualPanel}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className={styles.visualTowerOne}></div>
              <div className={styles.visualTowerTwo}></div>
              <div className={styles.visualTowerThree}></div>
              <div className={styles.visualMetric}></div>
            </div>
          </div>
        </section>

        <section className={styles.proofBand}>
          <p>Trusted workflow for modern career documents</p>
          <div className={styles.proofLogos} aria-label="PathFinder highlights">
            <span>AI Review</span>
            <span>Draft Sync</span>
            <span>PDF Import</span>
            <span>Career Notes</span>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Complete toolkit</span>
            <h2>Everything you need to improve a resume</h2>
            <p>Move from rough draft to targeted application without leaving the workspace.</p>
          </div>

          <div className={styles.featureGrid}>
            <Link href="/analyzer" className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <ResumeAnalyzerIcon />
              </div>
              <h3>Resume Analyzer</h3>
              <p className={styles.featureDescription}>
                Upload a PDF and get structured feedback on clarity, strengths, gaps, and next edits.
              </p>
              <div className={styles.featureHighlight}>
                <span>Professional feedback</span>
                <span>Strengths analysis</span>
                <span>Improvement tips</span>
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
                Save resume drafts, pick a template direction, and keep your content organized.
              </p>
              <div className={styles.featureHighlight}>
                <span>Modern templates</span>
                <span>Easy editor</span>
                <span>PDF import</span>
              </div>
              <div className={styles.ctaButton}>
                Create New Resume
                <span>→</span>
              </div>
            </Link>
          </div>
        </section>

        <section className={styles.insightSection}>
          <div className={styles.insightCard}>
            <span>01</span>
            <h3>Clearer positioning</h3>
            <p>Turn scattered career history into concise summary, skills, and experience blocks.</p>
          </div>
          <div className={styles.insightMockup} aria-hidden="true">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className={styles.insightCard}>
            <span>02</span>
            <h3>Actionable feedback</h3>
            <p>Review saved analysis history and keep improving the documents that matter most.</p>
          </div>
        </section>

        <section className={styles.darkFeatures}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Feature packed</span>
            <h2>Built for repeated career work</h2>
            <p>Small tools that make resume review, drafting, and iteration easier.</p>
          </div>
          <div className={styles.darkFeatureGrid}>
            {featurePack.map((feature) => (
              <div key={feature} className={styles.darkFeatureCard}>
                <span></span>
                <h3>{feature}</h3>
                <p>Keep your resume process focused, measurable, and easy to revisit.</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>Try PathFinder for free</h2>
          <p>Start building better resume drafts right now.</p>
          <Link href={user ? "/dashboard" : "/login"}>Start free</Link>
        </section>
      </SiteChrome>
    </div>
  );
}
