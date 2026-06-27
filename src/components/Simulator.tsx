"use client";

import { useState } from "react";
import { evaluateInterviewAnswer } from "@/app/actions";
import styles from "./Simulator.module.css";

interface Question {
  id: string;
  text: string;
}

interface Evaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
}

interface SimulatorProps {
  sessionId: string | null;
  questions: Question[];
}

export default function Simulator({ sessionId, questions }: SimulatorProps) {
  const [activeQuestion, setActiveQuestion] = useState<Question>(questions[0]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (qId: string) => {
    const answer = answers[qId];
    if (!answer?.trim()) return;

    setLoading((prev) => ({ ...prev, [qId]: true }));
    setError(null);
    try {
      const result = await evaluateInterviewAnswer({
        sessionId,
        questionId: qId,
        questionText: activeQuestion.text,
        userAnswer: answer,
      });

      if (result.success && result.evaluation) {
        setEvaluations((prev) => ({ ...prev, [qId]: result.evaluation as Evaluation }));
      } else {
        setError(result.error || "Evaluation failed. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong during evaluation.");
    } finally {
      setLoading((prev) => ({ ...prev, [qId]: false }));
    }
  };

  return (
    <div className={styles.simulatorGrid}>
      {/* Left panel: List of Questions */}
      <aside className={styles.questionList}>
        <h3>Practice Questions</h3>
        <ul>
          {questions.map((q, idx) => (
            <li key={q.id}>
              <button
                type="button"
                className={`${styles.qButton} ${activeQuestion.id === q.id ? styles.active : ""}`}
                onClick={() => {
                  setActiveQuestion(q);
                  setError(null);
                }}
              >
                <span className={styles.qNumber}>Question {idx + 1}</span>
                <span className={styles.qText}>{q.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right panel: Active Workspace & Grading */}
      <main className={styles.workspace}>
        <h2>Interview Simulator</h2>
        <p className={styles.prompt}>{activeQuestion.text}</p>

        {error && (
          <div style={{ color: "#ff4f4f", fontSize: "14px", padding: "10px", background: "rgba(255, 79, 79, 0.1)", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        <textarea
          className={styles.textarea}
          placeholder="Draft your STAR response here (Situation, Task, Action, Result)..."
          value={answers[activeQuestion.id] || ""}
          onChange={(e) => setAnswers({ ...answers, [activeQuestion.id]: e.target.value })}
          rows={6}
          disabled={loading[activeQuestion.id]}
        />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => handleEvaluate(activeQuestion.id)}
            disabled={loading[activeQuestion.id] || !answers[activeQuestion.id]?.trim()}
            className={styles.primaryButton}
          >
            {loading[activeQuestion.id] ? "Evaluating response..." : "Submit Response"}
          </button>
        </div>

        {/* Display feedback */}
        {evaluations[activeQuestion.id] && (
          <div className={styles.feedbackCard}>
            <div className={styles.scoreRow}>
              <h4>STAR Evaluation</h4>
              <span className={styles.scoreBadge}>Score: {evaluations[activeQuestion.id].score}/100</span>
            </div>
            
            <div className={styles.critiqueSection}>
              <h5>Strengths</h5>
              <ul>
                {evaluations[activeQuestion.id].strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <h5>Weaknesses & Gaps</h5>
              <ul>
                {evaluations[activeQuestion.id].weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <h5>Coach Suggestion</h5>
              <p>{evaluations[activeQuestion.id].suggestions}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
