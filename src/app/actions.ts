"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const GROQ_MODEL = "llama-3.3-70b-versatile";

type ActionError = {
  success: false;
  error: string;
};

type AnalysisSuccess = {
  success: true;
  feedback: string;
  saved: boolean;
  analysisId?: string;
  resumeText?: string;
};

type DraftSuccess = {
  success: true;
  message: string;
  draftId: string;
};

type DeleteSuccess = {
  success: true;
  message: string;
};

export type AnalysisActionState = ActionError | AnalysisSuccess;
export type DraftActionState =
  | ActionError
  | DraftSuccess
  | DeleteSuccess
  | { success: false; error: string; draftId?: string };

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Put it in .env.local at the project root, then restart npm run dev.",
    );
  }
  return apiKey;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function getAuthedUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return { supabase, user: data.user };
}

function buildLocalResumeFeedback(resumeText: string, cause: string) {
  const normalized = resumeText.toLowerCase();
  const sectionChecks = [
    ["experience", "work experience / employment history"],
    ["education", "education"],
    ["skills", "skills"],
    ["projects", "projects"],
    ["summary", "summary / profile"],
    ["certifications", "certifications"],
  ] as const;

  const presentSections = sectionChecks
    .filter(([keyword]) => normalized.includes(keyword))
    .map(([, label]) => label);

  const missingSections = sectionChecks
    .filter(([keyword]) => !normalized.includes(keyword))
    .map(([, label]) => label);

  const bulletCount = (resumeText.match(/^[\s>*-]*[•\-\*\u2022]/gm) || []).length;
  const suggestionLines = [
    `Groq analysis was unavailable because of a quota/rate-limit error: ${cause}.`,
    "This fallback review was generated locally so your app still returns useful feedback.",
    "",
    `Detected sections: ${presentSections.length > 0 ? presentSections.join(", ") : "none detected"}.`,
    `Missing or unclear sections: ${missingSections.length > 0 ? missingSections.join(", ") : "none obvious"}.`,
    `Bullet-point usage: ${bulletCount > 0 ? `${bulletCount} bullets found` : "few or none found"}.`,
    "",
  ];

  return suggestionLines.join("\n");
}

async function getAiFeedback(resumeText: string) {
  const trimmedText =
    resumeText.length > 50000
      ? `${resumeText.slice(0, 50000)}\n\n[TRUNCATED]`
      : resumeText;
  const prompt = `
    You are an expert career coach and professional resume reviewer.
    I will provide you with the text extracted from a resume.
    Please analyze it and provide feedback on:
    1. Overall impact and professional tone.
    2. Strengths and achievements.
    3. Areas for improvement (layout, wording, missing sections).
    4. A brief summary of recommendations.
    Make it short and concise. Focus on providing actionable feedback that can help improve the resume's effectiveness in landing job interviews.
    Make sure it is in bullet form and keep it under 200 words.
    Keep the symbols for the bullet points consistent and use a professional tone.

    Resume Text:
    ${trimmedText}
  `;

  try {
    const apiKey = getGroqApiKey();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Groq returned no analysis text");
    }
    return text as string;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate")
    ) {
      return buildLocalResumeFeedback(resumeText, message);
    }
    throw error;
  }
}

async function saveAnalysisHistory(params: {
  userId: string;
  resumeTitle: string;
  resumeText: string;
  feedback: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resume_analyses")
    .insert({
      user_id: params.userId,
      resume_title: params.resumeTitle,
      resume_text: params.resumeText,
      feedback: params.feedback,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to save analysis history");
  }

  return data.id as string;
}

export async function generateInterviewQuestions(analysisId: string | null, resumeText: string) {
  const apiKey = getGroqApiKey();
  const prompt = `Resume Text:\n${resumeText}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a recruiter. Generate 5 behavioral interview questions based on the resume text. Return a JSON object with a key 'questions' containing an array of objects, each with 'id' (string) and 'text' (string)."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    
    // Save to Database (only if logged in and analysisId is present)
    const authed = await getAuthedUser();
    let sessionId = null;
    if (authed?.supabase && authed?.user && analysisId) {
      try {
        const { data: sessionData, error: dbError } = await authed.supabase
          .from("interview_sessions")
          .insert({
            user_id: authed.user.id,
            analysis_id: analysisId,
            questions: parsed.questions
          })
          .select("id")
          .single();
        if (dbError) {
          console.error("Database error saving session:", dbError.message);
        } else {
          sessionId = sessionData?.id || null;
        }
      } catch (dbErr) {
        console.error("Exception saving session to database:", dbErr);
      }
    }

    return { success: true, sessionId, questions: parsed.questions };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function evaluateInterviewAnswer({
  sessionId,
  questionId,
  questionText,
  userAnswer
}: {
  sessionId: string | null;
  questionId: string;
  questionText: string;
  userAnswer: string;
}) {
  const apiKey = getGroqApiKey();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are an interview coach. Evaluate the answer against the STAR method. Return a JSON object with: 'score' (number), 'strengths' (array of strings), 'weaknesses' (array of strings), 'suggestions' (string)."
          },
          {
            role: "user",
            content: `Question: ${questionText}\nCandidate Answer: ${userAnswer}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    // Save Response to Database if logged in and sessionId is present
    const authed = await getAuthedUser();
    if (authed?.supabase && sessionId) {
      try {
        const { error: dbError } = await authed.supabase
          .from("interview_responses")
          .insert({
            session_id: sessionId,
            question_id: questionId,
            question_text: questionText,
            user_answer: userAnswer,
            evaluation
          });
        if (dbError) {
          console.error("Database error saving response:", dbError.message);
        }
      } catch (dbErr) {
        console.error("Exception saving response to database:", dbErr);
      }
    }

    return { success: true, evaluation };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function analyzeResume(formData: FormData): Promise<AnalysisActionState> {
  const resumeLabel = String(formData.get("resumeTitle") ?? "").trim();
  const clientText = formData.get("resumeText") as string | null;

  let resumeText = clientText?.trim() || "";

  if (!resumeText) {
    const file = formData.get("resume") as File | null;
    if (!file) {
      return {
        success: false,
        error: "Upload a PDF or provide extracted resume text.",
      };
    }

    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: "Only PDF files are supported.",
      };
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const pdfParseModule = await import("pdf-parse");
      type PdfParseResult = { text?: string };
      type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;
      const pdfParseFn =
        ((pdfParseModule as unknown) as { default?: PdfParseFn }).default ??
        (pdfParseModule as unknown as PdfParseFn);
      const data = await pdfParseFn(buffer);
      resumeText = String(data?.text ?? "").trim();
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "PDF extraction failed on the server.",
      };
    }
  }

  if (!resumeText) {
    return {
      success: false,
      error: "Could not extract any text from the resume.",
    };
  }

  const feedback = await getAiFeedback(resumeText);

  const authed = await getAuthedUser();
  if (!authed) {
    return { success: true, feedback, saved: false };
  }

  const title = resumeLabel || "Untitled resume";
  try {
    const analysisId = await saveAnalysisHistory({
      userId: authed.user.id,
      resumeTitle: title,
      resumeText,
      feedback,
    });

    revalidatePath("/dashboard");
    return { success: true, feedback, saved: true, analysisId, resumeText };
  } catch {
    return { success: true, feedback, saved: false };
  }
}
