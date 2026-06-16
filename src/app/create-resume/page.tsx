"use client";

import styles from "../page.module.css";

export default function CreateResumePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Create Resumes</h1>
          <p>Quickly create and manage resume templates.</p>
        </div>

        <section className={styles.uploadSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className={styles.label}>Resume Title</label>
            <input placeholder="New resume title" style={{ padding: 12, borderRadius: 8, border: '1px solid #e6e6e6' }} />
            <label className={styles.label}>Upload PDF (optional)</label>
            <input type="file" accept=".pdf" />
            <button className={styles.submitButton} style={{ marginTop: 8 }}>Create</button>
          </div>
        </section>
      </main>
    </div>
  );
}
