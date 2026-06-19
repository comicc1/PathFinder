"use client";

import { useActionState, useState } from "react";
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
  { id: 1, name: "Modern", description: "Clean, contemporary design", icon: "▭", preview: "Minimalist layout with clear sections" },
  { id: 2, name: "Professional", description: "Corporate & formal", icon: "▬", preview: "Traditional format for established careers" },
  { id: 3, name: "Creative", description: "Bold & expressive", icon: "◆", preview: "Visual emphasis with accent colors" },
  { id: 4, name: "Minimal", description: "Essential information only", icon: "─", preview: "Distraction-free, text-focused layout" },
];

export default function CreateResumeForm({ initialDraft }: CreateResumeFormProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialDraft?.templateName || "Modern");
  const [draftState, draftAction, draftPending] = useActionState(
    saveResumeDraft,
    { success: false, error: "" } as DraftActionState,
  );

  const handleFileSelect = (file: File | null) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file.name);
    }
  };

const effectiveDraftId =
  initialDraft?.id || (draftState.success && "draftId" in draftState ? draftState.draftId : "");
const hasDraft = Boolean(effectiveDraftId);

  return (
    <>
      <section className={styles.draftSection}>
        <div className={styles.sectionHeader}>
          <h2>{initialDraft ? "Edit your draft" : "Save a working draft"}</h2>
          <p>
            Drafts are stored in Supabase and tied to your account. <Link href="/login">Sign in</Link> if you want them synced.
          </p>
        </div>

        <form action={draftAction} className={styles.draftCard} id="draft-editor-form">
          <input type="hidden" name="templateName" value={selectedTemplate} />
          <input type="hidden" name="draftId" value={effectiveDraftId} />

          <label className={styles.inputGroup}>
            <span>Draft title</span>
            <input name="title" type="text" defaultValue={initialDraft?.title ?? ""} placeholder="Product designer resume" className={styles.input} />
          </label>
          <label className={styles.inputGroup}>
            <span>Summary</span>
            <textarea name="summary" defaultValue={initialDraft?.summary ?? ""} placeholder="A short positioning statement for the top of the resume" className={styles.textarea} />
          </label>
          <label className={styles.inputGroup}>
            <span>Skills</span>
            <input name="skills" type="text" defaultValue={initialDraft?.skills ?? ""} placeholder="Figma, React, Product Strategy" className={styles.input} />
          </label>
          <label className={styles.inputGroup}>
            <span>Resume content</span>
            <textarea name="content" defaultValue={initialDraft?.content ?? ""} placeholder="Paste or draft your experience, projects, and achievements here." className={styles.textareaLarge} />
          </label>

          {draftState.success === false && draftState.error ? <p className={styles.inlineError}>{draftState.error}</p> : null}
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
                This will permanently remove <strong>{initialDraft?.title ?? "your draft"}</strong> from your dashboard and cannot be undone.
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

      <section className={styles.quickStart}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>+</div>
          <h3>Start from Scratch</h3>
          <p>Begin with a blank resume and build it step by step.</p>
          <input type="text" placeholder="Resume title (e.g., Software Engineer 2024)" className={styles.input} />
          <button className={styles.button}>Create New Resume</button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📄</div>
          <h3>Import PDF</h3>
          <p>Upload your existing resume and enhance it.</p>
          <div
            className={`${styles.uploadDropZone} ${isDragging ? styles.dragging : ""}`}
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
              type="file"
              id="import-pdf"
              accept=".pdf"
              className={styles.hiddenFileInput}
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            <label htmlFor="import-pdf" className={styles.dropLabel}>
              <span className={styles.dropIcon}>📁</span>
              {selectedFile ? <span className={styles.fileName}>{selectedFile}</span> : <span>Drag PDF here or click to browse</span>}
            </label>
          </div>
          <button className={styles.button} disabled={!selectedFile}>
            Import Resume
          </button>
        </div>
      </section>

      <section className={styles.templatesSection}>
        <div className={styles.sectionHeader}>
          <h2>Choose a Template</h2>
          <p>Select a design that matches your style.</p>
        </div>

        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <div key={template.id} className={styles.templateCard}>
              <div className={styles.templatePreview}>
                <div className={styles.templateIcon}>{template.icon}</div>
              </div>
              <h4>{template.name}</h4>
              <p className={styles.templateDesc}>{template.description}</p>
              <small className={styles.templatePreviewText}>{template.preview}</small>
              <button type="button" className={styles.templateButton} onClick={() => setSelectedTemplate(template.name)}>
                {selectedTemplate === template.name ? "Selected" : "Use Template"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
