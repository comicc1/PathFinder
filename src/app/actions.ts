"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";

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
    
    // Extract text from PDF using the new PDFParse API
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const resumeText = textResult.text;

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
      ${resumeText}
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
