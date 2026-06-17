import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DashboardGreetingEditor from "./DashboardGreetingEditor";
import styles from "./page.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await requireUserOrRedirect();
  const supabase = await createSupabaseServerClient();
  const displayName =
    String(user.user_metadata?.display_name ?? user.user_metadata?.name ?? "").trim() ||
    user.email?.split("@")[0] ||
    "PathFinder user";

  const [draftsResult, analysesResult] = await Promise.all([
    supabase
      .from("resume_drafts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("resume_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const drafts = draftsResult.data ?? [];
  const analyses = analysesResult.data ?? [];

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <DashboardGreetingEditor displayName={displayName} email={user.email ?? null} />
        <div className={styles.heroActions}>
          <Link href="/create-resume" className={styles.primaryButton}>
            New draft
          </Link>
          <Link href="/analyzer" className={styles.secondaryButton}>
            Run analysis
          </Link>
          <SignOutButton />
        </div>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span>Resume drafts</span>
          <strong>{drafts.length}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Saved analyses</span>
          <strong>{analyses.length}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Signed in as</span>
          <strong>{user.email ?? "Unknown"}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Your resumes</h2>
            <p>Drafts saved from the Create Resume flow.</p>
          </div>
        </div>

        {drafts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No drafts yet. Start one and it will appear here.</p>
            <Link href="/create-resume">Create your first draft</Link>
          </div>
        ) : (
          <div className={styles.listGrid}>
            {drafts.map((draft) => (
              <article key={draft.id} className={styles.recordCard}>
                <div className={styles.recordTop}>
                  <h3>{draft.title}</h3>
                  <span>{formatDate(draft.updated_at)}</span>
                </div>
                {draft.summary && <p>{draft.summary}</p>}
                <div className={styles.metaRow}>
                  <span>{draft.template_name ?? "No template"}</span>
                  <span>{draft.skills ?? "No skills saved"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Analysis history</h2>
            <p>Latest feedback saved from resume scans.</p>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No analyses saved yet. Upload a PDF from the analyzer to build history.</p>
            <Link href="/analyzer">Analyze a resume</Link>
          </div>
        ) : (
          <div className={styles.listStack}>
            {analyses.map((analysis) => (
              <article key={analysis.id} className={styles.historyCard}>
                <div className={styles.recordTop}>
                  <h3>{analysis.resume_title}</h3>
                  <span>{formatDate(analysis.created_at)}</span>
                </div>
                <p className={styles.feedbackText}>{analysis.feedback}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
