"use client";

import styles from "../page.module.css";
import localStyles from "./page.module.css";

const templates = [
  {
    id: 1,
    name: "Modern",
    description: "Clean, contemporary design",
    icon: "▭",
    preview: "Minimalist layout with clear sections",
  },
  {
    id: 2,
    name: "Professional",
    description: "Corporate & formal",
    icon: "▬",
    preview: "Traditional format for established careers",
  },
  {
    id: 3,
    name: "Creative",
    description: "Bold & expressive",
    icon: "◆",
    preview: "Visual emphasis with accent colors",
  },
  {
    id: 4,
    name: "Minimal",
    description: "Essential information only",
    icon: "─",
    preview: "Distraction-free, text-focused layout",
  },
];

export default function CreateResumePage() {
  return (
    <div className={styles.page}>
      <main className={localStyles.main}>
        <div className={localStyles.header}>
          <h1 className={localStyles.title}>Create Resume</h1>
          <p className={localStyles.subtitle}>Start with a template or import an existing resume</p>
        </div>

        {/* Quick Start */}
        <section className={localStyles.quickStart}>
          <div className={localStyles.card}>
            <div className={localStyles.cardIcon}>+</div>
            <h3>Start from Scratch</h3>
            <p>Begin with a blank resume and build it step by step</p>
            <input
              type="text"
              placeholder="Resume title (e.g., Software Engineer 2024)"
              className={localStyles.input}
            />
            <button className={localStyles.button}>Create New Resume</button>
          </div>

          <div className={localStyles.card}>
            <div className={localStyles.cardIcon}>📄</div>
            <h3>Import PDF</h3>
            <p>Upload your existing resume and enhance it</p>
            <input type="file" accept=".pdf" className={localStyles.fileInput} />
            <button className={localStyles.button}>Import Resume</button>
          </div>
        </section>

        {/* Template Gallery */}
        <section className={localStyles.templatesSection}>
          <div className={localStyles.sectionHeader}>
            <h2>Choose a Template</h2>
            <p>Select a design that matches your style</p>
          </div>

          <div className={localStyles.templateGrid}>
            {templates.map((template) => (
              <div key={template.id} className={localStyles.templateCard}>
                <div className={localStyles.templatePreview}>
                  <div className={localStyles.templateIcon}>{template.icon}</div>
                </div>
                <h4>{template.name}</h4>
                <p className={localStyles.templateDesc}>{template.description}</p>
                <small className={localStyles.templatePreviewText}>{template.preview}</small>
                <button className={localStyles.templateButton}>Use Template</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
