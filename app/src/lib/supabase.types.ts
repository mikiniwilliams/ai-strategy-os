export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      engagements: {
        Row: {
          id: string;
          user_id: null | string;
          project_name: string;
          client_name: string;
          executive_sponsor: null | string;
          industry: null | string;
          status: string;
          notes: null | string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: null | string;
          project_name: string;
          client_name: string;
          executive_sponsor?: null | string;
          industry?: null | string;
          status?: string;
          notes?: null | string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: null | string;
          project_name?: string;
          client_name?: string;
          executive_sponsor?: null | string;
          industry?: null | string;
          status?: string;
          notes?: null | string;
          created_at?: string;
          updated_at?: string;
        };
      };
      discovery_responses: {
        Row: {
          id: string;
          engagement_id: string;
          primary_business_goal: string;
          transformation_thesis: null | string;
          primary_challenge: string;
          current_ai_maturity: null | string;
          data_environment: null | string;
          process_discipline: null | string;
          team_readiness: null | string;
          budget_horizon: null | string;
          success_metric: string;
          constraints: null | string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          primary_business_goal: string;
          transformation_thesis?: null | string;
          primary_challenge: string;
          current_ai_maturity?: null | string;
          data_environment?: null | string;
          process_discipline?: null | string;
          team_readiness?: null | string;
          budget_horizon?: null | string;
          success_metric: string;
          constraints?: null | string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          primary_business_goal?: string;
          transformation_thesis?: null | string;
          primary_challenge?: string;
          current_ai_maturity?: null | string;
          data_environment?: null | string;
          process_discipline?: null | string;
          team_readiness?: null | string;
          budget_horizon?: null | string;
          success_metric?: string;
          constraints?: null | string;
          created_at?: string;
          updated_at?: string;
        };
      };
      readiness_assessments: {
        Row: {
          id: string;
          engagement_id: string;
          overall_score: number;
          recommendation_posture: string;
          summary: string;
          leadership_alignment: number;
          data_readiness: number;
          process_readiness: number;
          capability_maturity: number;
          investment_capacity: number;
          editable_override: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          overall_score: number;
          recommendation_posture: string;
          summary: string;
          leadership_alignment: number;
          data_readiness: number;
          process_readiness: number;
          capability_maturity: number;
          investment_capacity: number;
          editable_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          overall_score?: number;
          recommendation_posture?: string;
          summary?: string;
          leadership_alignment?: number;
          data_readiness?: number;
          process_readiness?: number;
          capability_maturity?: number;
          investment_capacity?: number;
          editable_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      prioritized_use_cases: {
        Row: {
          id: string;
          engagement_id: string;
          use_case_name: string;
          impact_score: number;
          feasibility_score: number;
          overall_score: number;
          rationale: string;
          rank_order: number;
          editable_override: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          use_case_name: string;
          impact_score: number;
          feasibility_score: number;
          overall_score: number;
          rationale: string;
          rank_order: number;
          editable_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          use_case_name?: string;
          impact_score?: number;
          feasibility_score?: number;
          overall_score?: number;
          rationale?: string;
          rank_order?: number;
          editable_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      roadmap_items: {
        Row: {
          id: string;
          engagement_id: string;
          phase_number: number;
          phase_label: string;
          time_window: string;
          objective: string;
          actions: string;
          notes: null | string;
          editable_override: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          phase_number: number;
          phase_label: string;
          time_window: string;
          objective: string;
          actions: string;
          notes?: null | string;
          editable_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          phase_number?: number;
          phase_label?: string;
          time_window?: string;
          objective?: string;
          actions?: string;
          notes?: null | string;
          editable_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      export_summaries: {
        Row: {
          id: string;
          engagement_id: string;
          summary_text: string;
          editable_summary_text: null | string;
          export_format: string;
          generated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          summary_text: string;
          editable_summary_text?: null | string;
          export_format?: string;
          generated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          summary_text?: string;
          editable_summary_text?: null | string;
          export_format?: string;
          generated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_artifacts: {
        Row: {
          id: string;
          engagement_id: string;
          artifact_type: string;
          version_number: number;
          is_current: boolean;
          regeneration_group_id: string;
          parent_artifact_id: string | null;
          raw_content: Json;
          editable_content: Json;
          status: string;
          generated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          artifact_type: string;
          version_number?: number;
          is_current?: boolean;
          regeneration_group_id?: string;
          parent_artifact_id?: string | null;
          raw_content: Json;
          editable_content: Json;
          status?: string;
          generated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          artifact_type?: string;
          version_number?: number;
          is_current?: boolean;
          regeneration_group_id?: string;
          parent_artifact_id?: string | null;
          raw_content?: Json;
          editable_content?: Json;
          status?: string;
          generated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
