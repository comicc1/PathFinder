import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DraftActions from "./DraftActions";
import styles from "./page.module.css";
import SiteChrome from "@/components/SiteChrome";

function getSupabaseErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return error instanceof Error ? error.message : String(error);
}

function isMissingResumeTableError(error: unknown) {
  const message = getSupabaseErrorMessage(error).toLowerCase();
  return (
    message.includes("public.resume_drafts") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  );
}

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
  const profileResult = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  const displayName =
    String(
      profileResult.data?.username ??
        user.user_metadata?.display_name ??
        user.user_metadata?.name ??
        "",
    ).trim() ||
    user.email?.split("@")[0] ||
    "PathFinder user";

  const [draftsResult, analysesResult] = await Promise.all([
    supabase.from("resume_drafts").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(8),
    supabase.from("resume_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
  ]);

  if (draftsResult.error && isMissingResumeTableError(draftsResult.error)) {
    return (
      
        <main className={styles.shell}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Profile</p>
              <h1 className={styles.greeting}>
                Welcome back, <span className={styles.name}>{displayName}</span>
              </h1>
              <p className={styles.heroText}>
              </p>
            </div>

            <div className={styles.heroRail}>
              <div className={styles.profileCard}>
                <span className={styles.profileLabel}>Account</span>
                <strong>{displayName}</strong>
                <span>{user.email ?? "No email on file"}</span>
              </div>

              <div className={styles.heroActions}>
                <SignOutButton />
              </div>
            </div>
          </header>

          <section className={styles.panel}>
            <div className={styles.emptyState}>
              <p>
                Supabase has not loaded the resume tables yet. Run
                <code>supabase/schema.sql</code> against your project, then refresh this page.
              </p>
            </div>
          </section>
        </main>
      
    );
  }

  const drafts = draftsResult.data ?? [];
  const analyses = analysesResult.data ?? [];

  return (
    <SiteChrome
      title="Dashboard"
    >
      <main className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Profile</p>
            <h1 className={styles.greeting}>
              Welcome back, <span className={styles.name}>{displayName}</span>
            </h1>
            <p className={styles.heroText}>
              Your username lives in Supabase, so the dashboard can use it everywhere without
              hardcoded placeholders.
            </p>
          </div>

          <div className={styles.heroRail}>
            <div className={styles.profileCard}>
              <span className={styles.profileLabel}>Account</span>
              <strong>{displayName}</strong>
              <span>{user.email ?? "No email on file"}</span>
            </div>

            <div className={styles.heroActions}>
              <SignOutButton />
            </div>
          </div>
        </header>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}><span>Resume drafts</span><strong>{drafts.length}</strong></article>
          <article className={styles.statCard}><span>Saved analyses</span><strong>{analyses.length}</strong></article>
          <article className={styles.statCard}><span>Username</span><strong>{displayName}</strong></article>
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
                    <div>
                      <h3>{draft.title}</h3>
                      <span>{formatDate(draft.updated_at)}</span>
                    </div>
                  </div>
                  {draft.summary && <p>{draft.summary}</p>}
                  <div className={styles.metaRow}>
                    <span>{draft.template_name ?? "No template"}</span>
                    <span>{draft.skills ?? "No skills saved"}</span>
                  </div>
                  <DraftActions draftId={draft.id} draftTitle={draft.title} />
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
    </SiteChrome>
  );
}
