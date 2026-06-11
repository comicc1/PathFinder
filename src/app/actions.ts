"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeResume(formData: FormData) {
  const file = formData.get("resume") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try pdf-parse first (dynamic import), then fallback to pdfjs-dist if needed
    let resumeText = "";
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParseFn = (pdfParseModule && ((pdfParseModule as any).default ?? pdfParseModule)) as any;
      let data: any;
      if (typeof pdfParseFn === 'function') {
        data = await pdfParseFn(buffer as any);
      } else if (typeof (pdfParseModule as any).parse === 'function') {
        data = await (pdfParseModule as any).parse(buffer as any);
      } else {
        throw new Error('Unexpected pdf-parse module shape');
      }
      resumeText = (data && data.text) ? data.text : "";
    } catch (err) {
      // Fallback: use pdfjs-dist to extract text
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
        const loadingTask = (pdfjs as any).getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        const maxPages = pdf.numPages || 0;
        const pageTexts: string[] = [];
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((s: any) => (s.str || '')).join(' ');
          pageTexts.push(strings);
        }
        resumeText = pageTexts.join('\n\n');
      } catch (err2) {
        console.error('Both pdf-parse and pdfjs-dist failed:', err, err2);
        throw new Error('Could not extract text from PDF (pdf-parse/pdfjs failed)');
      }
    }

    // Truncate very large PDFs to avoid sending enormous prompts
    const MAX_CHARS = 50000;
    const trimmedText = resumeText.length > MAX_CHARS ? resumeText.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]" : resumeText;

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Could not extract text from the PDF");
    }

    // Initialize Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert career coach and professional resume reviewer. 
      I will provide you with the text extracted from a resume. 
      Please analyze it and provide feedback on:
      1. Overall impact and professional tone.
      2. Strengths and achievements.
      3. Areas for improvement (layout, wording, missing sections).
      4. Keyword optimization for Applicant Tracking Systems (ATS).
      5. A brief summary of recommendations.

      Resume Text:
      ${trimmedText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      feedback: text,
    };
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    return {
      success: false,
      error: error.message || "An error occurred during analysis",
    };
  }
}
