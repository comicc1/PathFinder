"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";

async function extractTextFromPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const maxPages = pdf.numPages || 0;
  const pageTexts: string[] = [];
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((s: any) => (s.str || '')).join(' ');
    pageTexts.push(strings);
  }
  return pageTexts.join('\n\n');
}

import { analyzeResume } from "../actions";

export default function AnalyzerPage() {
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
      const file = (event.currentTarget.querySelector('#resume') as HTMLInputElement).files?.[0];
      if (!file) throw new Error('No file selected');
      const text = await extractTextFromPdf(file);
      formData.delete('resume');
      formData.append('resumeText', text);

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
      {/* Header */}
      <header className={styles.pageHeader}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <div>
          <h1 className={styles.pageTitle}>Resume Analyzer</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.subtitle}>Get AI-powered insights to optimize your resume for success</p>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <section className={styles.feedbackSection}>
            <div className={styles.feedbackHeader}>
              <div className={styles.feedbackIcon}>✓</div>
              <h2>Analysis Results</h2>
            </div>
            <div className={styles.feedbackContent}>
              {feedback.split("\n").map((line, i) => (
                line.trim() && <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        )}

        {/* Error Display */}
        {error && (
          <section className={styles.errorSection}>
            <div className={styles.errorIcon}>!</div>
            <p className={styles.errorText}>{error}</p>
          </section>
        )}

        {/* Upload Section */}
        <section className={styles.uploadSection}>
          <div className={styles.uploadCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.uploadZone}>
                <div className={styles.uploadIcon}>📄</div>
                <h3>Upload Your Resume</h3>
                <p>Choose a PDF to get comprehensive feedback</p>
                
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf"
                  required
                  className={styles.fileInput}
                />
                <label htmlFor="resume" className={styles.fileLabel}>
                  Click to browse or drag and drop
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Analyzing Career Path...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <h4>What We Analyze</h4>
            <ul className={styles.analysisList}>
              <li>✓ Overall impact & professional tone</li>
              <li>✓ Strengths & achievements</li>
              <li>✓ Areas for improvement</li>
              <li>✓ Actionable recommendations</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} PathFinder. All rights reserved.
      </footer>
    </div>
  );
}
