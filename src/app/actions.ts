"use server";

const GROQ_MODEL = "llama-3.3-70b-versatile";

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Put it in .env.local at the project root, then restart npm run dev."
    );
  }
  return apiKey;
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
  const trimmedText = resumeText.length > 50000 ? resumeText.slice(0, 50000) + "\n\n[TRUNCATED]" : resumeText;
  const prompt = `
    You are an expert career coach and professional resume reviewer.
    I will provide you with the text extracted from a resume.
    Please analyze it and provide feedback on:
    1. Overall impact and professional tone.
    2. Strengths and achievements.
    3. Areas for improvement (layout, wording, missing sections).
    4. A brief summary of recommendations. 
    Make it short and concise and dont generate asterisks or bullet points since the formatting may be lost. Focus on providing actionable feedback that can help improve the resume's effectiveness in landing job interviews.

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
    return text;
  } catch (error: any) {
    const message = String(error?.message || error);
    if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("rate")) {
      return buildLocalResumeFeedback(resumeText, message);
    }
    throw error;
  }
}

export async function analyzeResume(formData: FormData) {
  // If client extracted text was provided, prefer it
  const clientText = formData.get("resumeText") as string | null;
  if (clientText && clientText.trim().length > 0) {
    const text = await getAiFeedback(clientText);
    return { success: true, feedback: text };
  }

  // Otherwise fall back to server-side file extraction
  const file = formData.get("resume") as File;
  if (!file) {
    throw new Error("No file uploaded and no extracted text provided");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // server-side pdf-parse
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParseFn = (pdfParseModule && ((pdfParseModule as any).default ?? pdfParseModule)) as any;
      const data = await pdfParseFn(buffer as any);
      const resumeText = (data && data.text) ? data.text : "";
      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error("Could not extract text from the PDF");
      }
      const text = await getAiFeedback(resumeText);
      return { success: true, feedback: text };
    } catch (err: any) {
      console.error("pdf-parse extraction failed, error:", err);
      const cause = String(err?.message || err);
      if (clientText && clientText.trim().length > 0) {
        return { success: true, feedback: buildLocalResumeFeedback(clientText, cause) };
      }
      return { success: false, error: "PDF extraction failed on server: " + cause };
    }
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    return {
      success: false,
      error: error.message || "An error occurred during analysis",
    };
  }
}
  

