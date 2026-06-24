"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { saveResumeDraft, deleteResumeDraft, type DraftActionState } from "../actions";
import styles from "./page.module.css";

type DraftValues = {
  id: string;
  title: string;
  summary: string;
  skills: string;
  content: string;
  templateName: string;
};

type CreateResumeFormProps = {
  initialDraft: DraftValues | null;
};

const templates = [
  { id: 1, name: "Modern", description: "Clean, contemporary design" },
  { id: 2, name: "Professional", description: "Corporate and formal" },
  { id: 3, name: "Creative", description: "Bold and expressive" },
  { id: 4, name: "Minimal", description: "Essential information only" },
];

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

  return pageTexts.join("\n\n").trim();
}

export default function CreateResumeForm({ initialDraft }: CreateResumeFormProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    initialDraft?.templateName || "Modern",
  );
  const [draftState, draftAction, draftPending] = useActionState(
    saveResumeDraft,
    { success: false, error: "" } as DraftActionState,
  );
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file.name);
      setSelectedPdfFile(file);
    } else {
      setSelectedFile(null);
      setSelectedPdfFile(null);
    }
  };

  const handleImport = async () => {
    const file = selectedPdfFile ?? importInputRef.current?.files?.[0] ?? null;
    if (!file) return;

    setIsImporting(true);
    try {
      const extractedText = await extractTextFromPdf(file);
      const form = document.getElementById("draft-editor-form") as HTMLFormElement | null;
      if (!form) {
        throw new Error("Draft form not found.");
      }

      const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');
      const summaryInput = form.querySelector<HTMLTextAreaElement>('textarea[name="summary"]');
      const skillsInput = form.querySelector<HTMLInputElement>('input[name="skills"]');
      const contentInput = form.querySelector<HTMLTextAreaElement>('textarea[name="content"]');

      if (titleInput && !titleInput.value.trim()) {
        titleInput.value = file.name.replace(/\.pdf$/i, "");
      }

      if (contentInput) {
        contentInput.value = extractedText;
      }

      if (summaryInput && !summaryInput.value.trim()) {
        summaryInput.value = "Imported from PDF and ready to edit.";
      }

      if (skillsInput && !skillsInput.value.trim()) {
        skillsInput.value = "Imported from PDF";
      }
    } finally {
      setIsImporting(false);
    }
  };

  const effectiveDraftId =
    initialDraft?.id || (draftState.success && "draftId" in draftState ? draftState.draftId : "");
  const hasDraft = Boolean(effectiveDraftId);

  return (
    <>
      <section className={styles.pageHero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Draft studio</p>
          <h1 className={styles.title}>{initialDraft ? "Edit your draft" : "Create a resume"}</h1>
          <p className={styles.subtitle}>
            Start from scratch or import a PDF to fill in the structure faster.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span>{selectedTemplate}</span>
          <span>{selectedFile ?? "No PDF imported yet"}</span>
        </div>
      </section>

      <section className={styles.draftSection}>
        <div className={styles.sectionHeader}>
          <h2>Resume draft</h2>
          <p>
            Drafts are stored in Supabase and tied to your account. <Link href="/login">Sign in</Link> if you want them synced.
          </p>
        </div>

        <form action={draftAction} className={styles.draftCard} id="draft-editor-form">
          <input type="hidden" name="templateName" value={selectedTemplate} />
          <input type="hidden" name="draftId" value={effectiveDraftId} />

          <label className={styles.inputGroup}>
            <span>Draft title</span>
            <input
              name="title"
              type="text"
              defaultValue={initialDraft?.title ?? ""}
              placeholder="Product designer resume"
              className={styles.input}
            />
          </label>

          <label className={styles.inputGroup}>
            <span>Summary</span>
            <textarea
              name="summary"
              defaultValue={initialDraft?.summary ?? ""}
              placeholder="A short positioning statement for the top of the resume"
              className={styles.textarea}
            />
          </label>

          <label className={styles.inputGroup}>
            <span>Skills</span>
            <input
              name="skills"
              type="text"
              defaultValue={initialDraft?.skills ?? ""}
              placeholder="Figma, React, Product Strategy"
              className={styles.input}
            />
          </label>

          <label className={styles.inputGroup}>
            <span>Resume content</span>
            <textarea
              name="content"
              defaultValue={initialDraft?.content ?? ""}
              placeholder="Paste or draft your experience, projects, and achievements here."
              className={styles.textareaLarge}
            />
          </label>

          {draftState.success === false && draftState.error ? (
            <p className={styles.inlineError}>{draftState.error}</p>
          ) : null}
          {draftState.success ? <p className={styles.inlineSuccess}>{draftState.message}</p> : null}

          <div className={styles.formActions}>
            <button className={styles.actionLink} type="submit" disabled={draftPending}>
              {draftPending ? "Saving..." : hasDraft ? "Update draft" : "Save draft"}
            </button>

            {hasDraft ? (
              <button
                className={styles.deleteButton}
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                Delete
              </button>
            ) : null}
          </div>
        </form>

        {hasDraft && isDeleteConfirmOpen ? (
          <div className={styles.deleteConfirm} role="alert" aria-live="polite">
            <div className={styles.deleteConfirmCopy}>
              <span className={styles.deleteConfirmKicker}>Confirm delete</span>
              <h3>Delete this draft?</h3>
              <p>
                This will permanently remove <strong>{initialDraft?.title ?? "your draft"}</strong>{" "}
                from your dashboard and cannot be undone.
              </p>
            </div>

            <div className={styles.deleteConfirmActions}>
              <button
                type="button"
                className={styles.cancelDeleteButton}
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Keep draft
              </button>

              <form action={deleteResumeDraft}>
                <input type="hidden" name="draftId" value={effectiveDraftId} />
                <button type="submit" className={styles.confirmDeleteButton}>
                  Yes, delete it
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      <section className={styles.importSection}>
        <div className={styles.importCard}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon}>IM</div>
            <div>
              <h3>Import PDF</h3>
              <p>Upload an existing resume and fill the draft with extracted text.</p>
            </div>
          </div>

          <div
            className={`${styles.uploadDropZone} ${isDragging ? styles.dragging : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => importInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                importInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelect(e.dataTransfer.files?.[0] || null);
            }}
          >
            <input
              ref={importInputRef}
              type="file"
              id="import-pdf"
              accept=".pdf,application/pdf"
              className={styles.hiddenFileInput}
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            <span className={styles.dropIcon}>PDF</span>
            <div className={styles.dropCopy}>
              {selectedFile ? (
                <span className={styles.fileName}>{selectedFile}</span>
              ) : (
                <span>Drag a PDF here or click to browse</span>
              )}
              <small>The PDF text will be pulled into the resume draft automatically.</small>
            </div>
          </div>

          <button
            className={styles.button}
            disabled={!selectedFile || isImporting}
            type="button"
            onClick={handleImport}
          >
            {isImporting ? "Importing..." : "Import Resume"}
          </button>
        </div>

        <div className={styles.templateRail}>
          <div className={styles.sectionHeader}>
            <h2>Templates</h2>
            <p>Choose a style that fits the role you want.</p>
          </div>

          <div className={styles.templateGrid}>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`${styles.templateCard} ${
                  selectedTemplate === template.name ? styles.templateCardActive : ""
                }`}
                onClick={() => setSelectedTemplate(template.name)}
              >
                <div className={styles.templateBadge}>{template.name.slice(0, 2).toUpperCase()}</div>
                <h4>{template.name}</h4>
                <p className={styles.templateDesc}>{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
