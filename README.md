# PathFinder

**PathFinder** is an AI-powered resume scanner and analyzer designed to help job seekers optimize their resumes.

## Supabase setup

This repo now expects a Supabase project for auth and user-owned data.

Environment variables:

- `GROQ_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If your current `.env.local` still uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, the app will accept that too.

Database setup:

- Run the SQL in [`supabase/schema.sql`](./supabase/schema.sql) to create the `resume_drafts` and `resume_analyses` tables.
- Keep row-level security enabled so each user only sees their own records.

Routes:

- `/login` for Supabase sign-in and sign-up
- `/dashboard` for saved drafts and analysis history
- `/create-resume` for storing drafts
- `/analyzer` for scans that can also be saved to the dashboard when signed in
