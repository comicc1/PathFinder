export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
};

export type ResumeAnalysis = {
  id: string;
  user_id: string;
  resume_title: string;
  resume_text: string;
  feedback: string;
  created_at: string;
  updated_at: string;
};

export type InterviewSession = {
  id: string;
  user_id: string;
  analysis_id: string;
  questions: Json;
  created_at: string;
};

export type InterviewResponse = {
  id: string;
  session_id: string;
  question_id: string;
  question_text: string;
  user_answer: string;
  evaluation: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
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
          resume_title: string;
          resume_text: string;
          feedback: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_title?: string;
          resume_text?: string;
          feedback?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interview_sessions: {
        Row: InterviewSession;
        Insert: {
          id?: string;
          user_id: string;
          analysis_id: string;
          questions: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          analysis_id?: string;
          questions?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      interview_responses: {
        Row: InterviewResponse;
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          question_text: string;
          user_answer: string;
          evaluation: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          question_text?: string;
          user_answer?: string;
          evaluation?: Json;
          created_at?: string;
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
