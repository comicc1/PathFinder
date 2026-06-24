"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./page.module.css";
import SiteChrome from "@/components/SiteChrome";

type Mode = "sign-in" | "sign-up";

export default function LoginForm({
  nextPath,
  initialMode = "sign-in",
}: {
  nextPath: string;
  initialMode?: Mode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      setError("Add both email and password.");
      setPending(false);
      return;
    }

    if (mode === "sign-up" && !username) {
      setError("Choose a username before creating your account.");
      setPending(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    try {
      if (mode === "sign-up") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: username,
            },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }
        setMessage("Account created. Check your inbox if email confirmation is enabled.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
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
    <SiteChrome showNav={false}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>{mode === "sign-in" ? "Sign In" : "Create Account"}</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === "sign-up" ? (
              <input
                name="username"
                type="text"
                autoComplete="nickname"
                placeholder="Username"
                className={styles.input}
              />
            ) : null}
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              className={styles.input}
            />
            <input
              name="password"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="Password"
              className={styles.input}
            />
            {message && <p className={styles.success}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.submitButton} type="submit" disabled={pending}>
              {pending ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.tab} ${mode === "sign-in" ? styles.activeTab : ""}`}
              onClick={() => setMode("sign-in")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === "sign-up" ? styles.activeTab : ""}`}
              onClick={() => setMode("sign-up")}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
