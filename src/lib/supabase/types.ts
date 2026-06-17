export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ResumeDraft = {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  content: string;
  skills: string | null;
  template_name: string | null;
  created_at: string;
  updated_at: string;
};

export type ResumeAnalysis = {
  id: string;
  user_id: string;
  draft_id: string | null;
  resume_title: string;
  resume_text: string;
  feedback: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      resume_drafts: {
        Row: ResumeDraft;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          summary?: string | null;
          content: string;
          skills?: string | null;
          template_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          summary?: string | null;
          content?: string;
          skills?: string | null;
          template_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_analyses: {
        Row: ResumeAnalysis;
        Insert: {
          id?: string;
          user_id: string;
          draft_id?: string | null;
          resume_title: string;
          resume_text: string;
          feedback: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          draft_id?: string | null;
          resume_title?: string;
          resume_text?: string;
          feedback?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
