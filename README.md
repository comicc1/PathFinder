# PathFinder 🚀

**PathFinder** is a next-generation, AI-powered resume builder and analysis platform designed to help job seekers optimize their resumes, pass ATS filters, and land their dream jobs. By combining the power of modern LLMs with a seamless user experience, PathFinder provides real-time feedback, readability scores, and actionable recommendations.

---

## 🌟 Key Features

- **🤖 AI Resume Analyzer**: Scan and review your resumes instantly. Get detailed feedback on grammar, impact, formatting, and keyword matching.
- **✍️ Interactive Resume Builder**: Create, edit, and manage resume drafts within a sleek, intuitive editor.
- **📊 User Dashboard**: Persist your draft resumes and scan histories securely. Track your optimization progress over time.
- **🔐 Secure Authentication**: Integrated authentication powered by Supabase, ensuring your personal career data remains private and secure.
- **📱 Fully Responsive Design**: Seamlessly transition from desktop to tablet and mobile screens with a polished, modern sticky navbar and navigation drawer.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) utilizing Turbopack for lightning-fast hot reloads.
- **Library**: [React 19](https://react.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, SSR helper client)
- **Styling**: Vanilla CSS Modules for robust scoping and custom design controls.
- **AI Integration**: [Groq API](https://groq.com/) for high-throughput, low-latency resume evaluations.

---

## 📁 Repository Structure

```text
├── public/                 # Static assets and media
├── src/
│   ├── app/                # Next.js App Router pages and routes
│   │   ├── analyzer/       # AI Scan and review suite
│   │   ├── create-resume/  # Interactive resume builder
│   │   ├── dashboard/      # Draft and scan history dashboard
│   │   ├── login/          # Supabase authentication interface
│   │   └── layout.tsx      # Global shell structure
│   ├── components/         # Reusable React components (Header, Video bg, etc.)
│   └── lib/                # Database clients, auth logic, and utilities
└── supabase/
    └── schema.sql          # PostgreSQL database schema & tables
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0.0 or higher) and [npm](https://www.npmjs.com/) installed.

### ⚙️ Environment Configuration

Create a `.env.local` file in the root of the project and populate the following variables:

```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

*Note: For backward compatibility, the application also accepts `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in place of the anon key.*

### 🗄️ Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** in your project dashboard.
3. Paste and run the SQL script found in [supabase/schema.sql](./supabase/schema.sql). This will create:
   - `resume_drafts` table (stores interactive builder drafts).
   - `resume_analyses` table (stores scan feedback history).
4. Verify Row-Level Security (RLS) policies are active to ensure users can only read/write their own records.

### 🏃 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & Privacy

PathFinder takes your privacy seriously:
- **Row-Level Security (RLS)**: Enforced database-side via Supabase. Users can only query or mutate rows linked to their unique User ID.
- **Isolated Credentials**: All API credentials and keys are securely stored server-side and never exposed to the client.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
