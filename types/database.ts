// ===========================================
// LUUC.AI - Database Types (Supabase)
// ===========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          company: string | null;
          company_id: string | null;
          role: "owner" | "admin" | "member" | null;
          avatar_url: string | null;
          plan: "free" | "pro" | "enterprise";
          usage_documents: number;
          usage_analyses: number;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          company?: string | null;
          company_id?: string | null;
          role?: "owner" | "admin" | "member" | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
          usage_documents?: number;
          usage_analyses?: number;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          company?: string | null;
          company_id?: string | null;
          role?: "owner" | "admin" | "member" | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
          usage_documents?: number;
          usage_analyses?: number;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string | null;
          company_id: string | null;
          title: string;
          doc_type: string;
          content: string;
          variables: Json;
          is_custom: boolean;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          company_id?: string | null;
          title: string;
          doc_type: string;
          content: string;
          variables?: Json;
          is_custom?: boolean;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          company_id?: string | null;
          title?: string;
          doc_type?: string;
          content?: string;
          variables?: Json;
          is_custom?: boolean;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string | null;
          filename: string;
          file_path: string | null;
          file_size: number | null;
          focus_context: string | null;
          risk_score: number;
          summary: string | null;
          findings: Json;
          missing_clauses: Json;
          observations: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          filename: string;
          file_path?: string | null;
          file_size?: number | null;
          focus_context?: string | null;
          risk_score: number;
          summary?: string | null;
          findings?: Json;
          missing_clauses?: Json;
          observations?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          filename?: string;
          file_path?: string | null;
          file_size?: number | null;
          focus_context?: string | null;
          risk_score?: number;
          summary?: string | null;
          findings?: Json;
          missing_clauses?: Json;
          observations?: string | null;
          created_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          variables: Json;
          system_prompt: string | null;
          is_public: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          category?: string | null;
          variables?: Json;
          system_prompt?: string | null;
          is_public?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string | null;
          variables?: Json;
          system_prompt?: string | null;
          is_public?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action_type: "generate" | "analyze" | "custom_generate";
          tokens_used: number;
          model_used: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action_type: "generate" | "analyze" | "custom_generate";
          tokens_used?: number;
          model_used?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action_type?: "generate" | "analyze" | "custom_generate";
          tokens_used?: number;
          model_used?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          industry: string | null;
          description: string | null;
          document_rules: Json | null;
          status: "active" | "inactive" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          industry?: string | null;
          description?: string | null;
          document_rules?: Json | null;
          status?: "active" | "inactive" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          industry?: string | null;
          description?: string | null;
          document_rules?: Json | null;
          status?: "active" | "inactive" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
      };
      company_documents: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          content: string;
          doc_type: string | null;
          category: "aprobado" | "borrador" | "ejemplo";
          uploaded_by: string | null;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          content: string;
          doc_type?: string | null;
          category?: "aprobado" | "borrador" | "ejemplo";
          uploaded_by?: string | null;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          content?: string;
          doc_type?: string | null;
          category?: "aprobado" | "borrador" | "ejemplo";
          uploaded_by?: string | null;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      user_stats: {
        Row: {
          id: string | null;
          email: string | null;
          plan: string | null;
          usage_documents: number | null;
          usage_analyses: number | null;
          total_documents: number | null;
          total_analyses: number | null;
          last_document_at: string | null;
          last_analysis_at: string | null;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}

// Tipos de ayuda
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyDocument = Database["public"]["Tables"]["company_documents"]["Row"];
