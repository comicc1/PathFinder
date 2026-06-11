# PathFinder 🚀

**PathFinder** is an AI-powered resume scanner and analyzer designed to help job seekers optimize their resumes. By leveraging Gemini AI, PathFinder evaluates your resume against industry standards, checks for keyword optimization, and provides actionable feedback.

## Features
- **PDF Upload:** Directly upload your resume in PDF format.
- **AI Analysis:** Get detailed feedback on tone, strengths, improvements, and ATS optimization.
- **Modern UI:** A clean, responsive interface built with Next.js.

## Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **AI:** Google Generative AI (Gemini 2.0 Flash)
- **PDF Parsing:** Modern `pdf-parse` fork
- **Styling:** Vanilla CSS

## Getting Started

### 1. Setup Environment Variables
Create a `.env.local` file in the root directory and add your Gemini API Key:
```bash
GEMINI_API_KEY=your_api_key_here
```
You can get a free API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `src/app/page.tsx`: Main UI for the application.
- `src/app/actions.ts`: Server Action for PDF processing and AI analysis.
- `src/app/page.module.css`: Styles for the main page.
