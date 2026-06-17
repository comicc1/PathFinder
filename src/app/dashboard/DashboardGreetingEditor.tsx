"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./page.module.css";

type DashboardGreetingEditorProps = {
  displayName: string;
  email: string | null;
};

export default function DashboardGreetingEditor({ displayName, email }: DashboardGreetingEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = name.trim();
    if (!nextName) {
      setError("Add a display name before saving.");
      setMessage(null);
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: nextName },
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Greeting updated.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update your greeting.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.heroCopy}>
      <span className={styles.kicker}>Personal dashboard</span>
      <h1>
        Welcome back, <span className={styles.heroName}>{displayName}</span>.
      </h1>
      <p className={styles.heroDescription}>
        This is your private workspace for resume drafts, analysis history, and quick jumps back
        into the editor.
      </p>

      <form className={styles.nameEditor} onSubmit={handleSubmit}>
        {!isEditing ? (
          <div className={styles.nameReadoutRow}>
            <p className={styles.nameReadout}>
              <span>Display name:</span> <strong>{displayName}</strong>
            </p>
            <button
              type="button"
              className={styles.editButton}
              aria-label="Edit display name"
              onClick={() => {
                setIsEditing(true);
                setMessage(null);
                setError(null);
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={styles.editIcon}
                fill="none"
              >
                <path
                  d="M14.5 5.5L18.5 9.5M4 20H8L19 9C19.5523 8.44772 19.5523 7.55229 19 7L17 5C16.4477 4.44772 15.5523 4.44772 15 5L4 16V20Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <label className={styles.nameField}>
              <span>Display name</span>
              <input
                name="displayName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                aria-describedby="dashboard-name-help"
                className={styles.nameInput}
              />
            </label>

            <div className={styles.nameEditorFooter}>
              <p id="dashboard-name-help" className={styles.nameHelp}>
                {email ? `Saved to ${email}.` : "Saved to your account."}
              </p>

              <div className={styles.nameActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setName(displayName);
                    setIsEditing(false);
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Cancel
                </button>
                <button className={styles.nameButton} type="submit" disabled={pending}>
                  {pending ? "Saving..." : "Save name"}
                </button>
              </div>
            </div>
          </>
        )}

        {error ? <p className={styles.nameMessageError}>{error}</p> : null}
        {message ? <p className={styles.nameMessageSuccess}>{message}</p> : null}
      </form>
    </div>
  );
}
