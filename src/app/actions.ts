"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeResume(formData: FormData) {
  // If client extracted text was provided, prefer it
  const clientText = formData.get("resumeText") as string | null;
  if (clientText && clientText.trim().length > 0) {
    const trimmedText = clientText.length > 50000 ? clientText.slice(0, 50000) + "\n\n[TRUNCATED]" : clientText;
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
      const MAX_CHARS = 50000;
      const trimmedText = resumeText.length > MAX_CHARS ? resumeText.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]" : resumeText;
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `You are an expert career coach and professional resume reviewer.\n\nResume Text:\n${trimmedText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return { success: true, feedback: text };
    } catch (err: any) {
      console.error("pdf-parse extraction failed, error:", err);
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `resume_${Date.now()}.pdf`);
      fs.writeFileSync(tempFilePath, buffer);
      return { success: false, error: "PDF extraction failed on server. Saved temporary file at " + tempFilePath };
    }
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    return {
      success: false,
      error: error.message || "An error occurred during analysis",
    };
  }
}
  

