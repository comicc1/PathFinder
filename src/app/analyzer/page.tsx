"use client";

import { useRef, useState } from "react";
import SiteChrome from "@/components/SiteChrome";
import { ResumeAnalyzerIcon } from "@/components/ResumeAnalyzerIcon";
import { analyzeResume } from "../actions";
import styles from "./page.module.css";

async function extractTextFromPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= (pdf.numPages || 0); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = (content.items as Array<{ str?: string }>)
      .map((item) => item.str || "")
      .join(" ");
    pageTexts.push(strings);
  }
  return pageTexts.join("\n\n");
}

export default function AnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);
    setSaved(false);

    const formData = new FormData(event.currentTarget);

    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) throw new Error("No file selected");
      const text = await extractTextFromPdf(file);
      formData.delete("resume");
      formData.append("resumeText", text);

      const result = await analyzeResume(formData);
      if (result.success) {
        setFeedback(result.feedback || "No feedback received");
        setSaved(Boolean(result.saved));
      } else {
        setError(result.error || "An unknown error occurred");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
  }

  return (
    <SiteChrome
      title="Resume Analyzer"
      eyebrow="AI-powered review"
      description="Upload a resume PDF, extract the text, and get structured feedback that helps you tighten the story."
      primaryHref="/create-resume"
      primaryLabel="Create Resume"
      secondaryHref="/dashboard"
      secondaryLabel="Dashboard"
    >
      <main className={styles.main}>
        {saved && (
          <section className={styles.successSection}>
            <p className={styles.successText}>
              Saved to your dashboard. Sign in first if you want future scans stored automatically.
            </p>
          </section>
        )}

        {feedback && (
          <section className={styles.feedbackSection}>
            <div className={styles.feedbackHeader}>
              <div className={styles.feedbackIcon}>AI</div>
              <h2>Analysis Results</h2>
            </div>
            <div className={styles.feedbackContent}>
              {feedback
                .split("\n")
                .map((line, i) => line.trim() && <p key={i}>{line}</p>)}
            </div>
          </section>
        )}

        {error && (
          <section className={styles.errorSection}>
            <p className={styles.errorText}>{error}</p>
          </section>
        )}

        <section className={styles.uploadSection}>
          <div className={styles.uploadCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.textField}>
                <label htmlFor="resumeTitle">Resume title</label>
                <input
                  id="resumeTitle"
                  name="resumeTitle"
                  type="text"
                  placeholder="Primary product manager resume"
                  className={styles.textInput}
                />
              </div>

              <div
                className={styles.uploadZone}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <ResumeAnalyzerIcon />
                <h3>Upload your resume</h3>
                <p>Choose a PDF to get structured feedback.</p>
                <p className={styles.fileName}>{fileName ?? "No file selected"}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,application/pdf"
                  required
                  className={styles.fileInput}
                  onChange={handleFileChange}
                />
                <span className={styles.fileLabel}>Click to browse</span>
              </div>

              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Analyzing resume...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </form>
          </div>

          <div className={styles.infoBox}>
            <h4>What We Analyze</h4>
            <ul className={styles.analysisList}>
              <li>Overall impact and professional tone</li>
              <li>Strengths and achievements</li>
              <li>Areas for improvement</li>
              <li>Actionable recommendations</li>
            </ul>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
