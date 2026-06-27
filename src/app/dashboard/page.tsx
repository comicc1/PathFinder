import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
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
    (message.includes("public.interview_sessions") || message.includes("public.resume_analyses")) &&
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

interface SessionData {
  id: string;
  created_at: string;
  questions: Array<{ id: string; text: string }>;
  resume_analyses?: { resume_title: string } | null;
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

  const [sessionsResult, analysesResult] = await Promise.all([
    supabase
      .from("interview_sessions")
      .select(`
        id,
        created_at,
        questions,
        resume_analyses (
          resume_title
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("resume_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (sessionsResult.error && isMissingResumeTableError(sessionsResult.error)) {
    return (
      <SiteChrome title="Dashboard">
        <main className={styles.shell}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Profile</p>
              <h1 className={styles.greeting}>
                Welcome back, <span className={styles.name}>{displayName}</span>
              </h1>
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
                Supabase has not loaded the interview tables yet. Run
                <code>supabase/schema.sql</code> against your project, then refresh this page.
              </p>
            </div>
          </section>
        </main>
      </SiteChrome>
    );
  }

  const sessions = (sessionsResult.data ?? []) as unknown as SessionData[];
  const analyses = analysesResult.data ?? [];

  return (
    <SiteChrome title="Dashboard">
      <main className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Profile</p>
            <h1 className={styles.greeting}>
              Welcome back, <span className={styles.name}>{displayName}</span>
            </h1>
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
          <article className={styles.statCard}>
            <span>Practice Sessions</span>
            <strong>{sessions.length}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Saved Analyses</span>
            <strong>{analyses.length}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Username</span>
            <strong>{displayName}</strong>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Interview Practice History</h2>
              <p>Tailored behavioral simulator sessions.</p>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No practice sessions yet. Upload a resume to start practicing.</p>
              <Link href="/analyzer">Start mock interview</Link>
            </div>
          ) : (
            <div className={styles.listGrid}>
              {sessions.map((session) => (
                <article key={session.id} className={styles.recordCard}>
                  <div className={styles.recordTop}>
                    <div>
                      <h3>Practice: {session.resume_analyses?.resume_title || "Untitled Resume"}</h3>
                      <span>{formatDate(session.created_at)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--color-secondary)", marginTop: "8px" }}>
                    {session.questions ? `${session.questions.length} custom recruiter questions generated.` : "Custom recruiter questions generated."}
                  </p>
                  <div className={styles.recordActions} style={{ marginTop: "16px" }}>
                    <Link href="/analyzer" className={styles.actionLink} style={{ color: "var(--color-accent)", fontWeight: "bold" }}>
                      Resume practice
                    </Link>
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
    </SiteChrome>
  );
}
