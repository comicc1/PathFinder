"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteResumeDraft } from "../actions";
import styles from "./page.module.css";

type DraftActionsProps = {
  draftId: string;
  draftTitle: string;
};

export default function DraftActions({ draftId, draftTitle }: DraftActionsProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <>
      <div className={styles.recordActions}>
        <Link href={`/create-resume?draftId=${draftId}`} className={styles.actionLink}>
          Edit draft
        </Link>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          Delete
        </button>
      </div>

      {isDeleteConfirmOpen ? (
        <div className={styles.deleteConfirm} role="alert" aria-live="polite">
          <div className={styles.deleteConfirmCopy}>
            <span className={styles.deleteConfirmKicker}>Confirm delete</span>
            <h3>Delete this draft?</h3>
            <p>
              This will permanently remove <strong>{draftTitle}</strong> from your dashboard and cannot be undone.
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
              <input type="hidden" name="draftId" value={draftId} />
              <button type="submit" className={styles.confirmDeleteButton}>
                Yes, delete it
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
