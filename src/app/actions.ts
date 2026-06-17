"use server";

import { revalidatePath } from "next/cache";
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
};

type DraftSuccess = {
  success: true;
  message: string;
  draftId: string;
};

export type AnalysisActionState = ActionError | AnalysisSuccess;
export type DraftActionState =
  | ActionError
  | DraftSuccess
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
  draftId?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resume_analyses")
    .insert({
      user_id: params.userId,
      draft_id: params.draftId ?? null,
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

export async function saveResumeDraft(
  _state: DraftActionState | undefined,
  formData: FormData,
): Promise<DraftActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const skills = String(formData.get("skills") ?? "").trim();
  const templateName = String(formData.get("templateName") ?? "").trim();
  const draftId = String(formData.get("draftId") ?? "").trim();

  if (!title) {
    return { success: false, error: "Add a title before saving your draft." };
  }

  if (!content) {
    return { success: false, error: "Add some resume content before saving." };
  }

  const authed = await getAuthedUser();
  if (!authed) {
    return {
      success: false,
      error: "Please sign in to save drafts to your dashboard.",
    };
  }

  const payload = {
    title,
    summary: summary || null,
    content,
    skills: skills || null,
    template_name: templateName || null,
    updated_at: new Date().toISOString(),
  };

  if (draftId) {
    const { data, error } = await authed.supabase
      .from("resume_drafts")
      .update(payload)
      .eq("id", draftId)
      .eq("user_id", authed.user.id)
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "Failed to update the draft.",
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Draft updated and synced to your dashboard.",
      draftId: data.id,
    };
  }

  const { data, error } = await authed.supabase
    .from("resume_drafts")
    .insert({
      user_id: authed.user.id,
      title,
      summary: summary || null,
      content,
      skills: skills || null,
      template_name: templateName || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Failed to save the draft.",
    };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Draft saved to your dashboard.",
    draftId: data.id,
  };
}

export async function analyzeResume(formData: FormData): Promise<AnalysisActionState> {
  const resumeLabel = String(formData.get("resumeTitle") ?? "").trim();
  const draftId = String(formData.get("draftId") ?? "").trim();
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
      draftId: draftId || null,
    });

    revalidatePath("/dashboard");
    return { success: true, feedback, saved: true, analysisId };
  } catch {
    return { success: true, feedback, saved: false };
  }
}
