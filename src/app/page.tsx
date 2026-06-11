"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { analyzeResume } from "./actions";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await analyzeResume(formData);
      if (result.success) {
        setFeedback(result.feedback || "No feedback received");
      } else {
        setError(result.error || "An unknown error occurred");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>PathFinder</h1>
          <p>
            Upload your resume and get instant AI-powered feedback to help you
            land your dream job.
          </p>
        </div>

        <section className={styles.uploadSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fileInputContainer}>
              <label htmlFor="resume" className={styles.label}>
                Upload Resume (PDF)
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf"
                required
                className={styles.fileInput}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>
        </section>

        {error && (
          <section className={styles.errorSection}>
            <p className={styles.errorText}>{error}</p>
          </section>
        )}

        {feedback && (
          <section className={styles.feedbackSection}>
            <h2>Analysis Results</h2>
            <div className={styles.feedbackContent}>
              {feedback.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
