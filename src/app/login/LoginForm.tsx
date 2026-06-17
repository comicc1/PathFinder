"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./page.module.css";

type Mode = "sign-in" | "sign-up";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      setError("Add both email and password.");
      setPending(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "sign-up") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }

        setMessage("Account created. Check your inbox if email confirmation is enabled.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.push(nextPath);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <Link href="/" className={styles.backLink}>
          Back to PathFinder
        </Link>

        <div className={styles.header}>
          <span className={styles.kicker}>Supabase Auth</span>
          <h1>Sign in to save drafts and keep analysis history.</h1>
          <p>
            Your dashboard will automatically collect resume drafts, saved analysis runs, and the
            files you revisit most often.
          </p>
        </div>

        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === "sign-in" ? styles.activeTab : ""}`}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "sign-up" ? styles.activeTab : ""}`}
            onClick={() => setMode("sign-up")}
          >
            Create account
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="••••••••"
            />
          </label>

          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={pending}>
            {pending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className={styles.footerNote}>
          <p>
            Once you’re in, save a draft on Create Resume and review the saved history from your
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
