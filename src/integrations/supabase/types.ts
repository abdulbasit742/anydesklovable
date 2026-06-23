export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_review_campaigns: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          due_at: string | null
          id: string
          name: string
          scope: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          name: string
          scope?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          name?: string
          scope?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_review_campaigns_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      access_review_items: {
        Row: {
          campaign_id: string
          created_at: string
          current_permissions: string[]
          current_role_key: string | null
          decision: string | null
          id: string
          member_id: string
          note: string | null
          recommended_role: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          current_permissions?: string[]
          current_role_key?: string | null
          decision?: string | null
          id?: string
          member_id: string
          note?: string | null
          recommended_role?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          current_permissions?: string[]
          current_role_key?: string | null
          decision?: string | null
          id?: string
          member_id?: string
          note?: string | null
          recommended_role?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_review_items_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "access_review_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_review_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sessions: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          ip_address: string | null
          last_active_at: string
          location: string | null
          revoked_at: string | null
          session_label: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string
          location?: string | null
          revoked_at?: string | null
          session_label?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string
          location?: string | null
          revoked_at?: string | null
          session_label?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_action_guardrails: {
        Row: {
          action_category: string
          action_type: string
          allowed: boolean
          allowed_roles: string[]
          blocked_resource_types: string[]
          config: Json
          created_at: string
          created_by: string | null
          id: string
          max_risk_level: string
          requires_human_approval: boolean
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          action_category?: string
          action_type: string
          allowed?: boolean
          allowed_roles?: string[]
          blocked_resource_types?: string[]
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          max_risk_level?: string
          requires_human_approval?: boolean
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          action_category?: string
          action_type?: string
          allowed?: boolean
          allowed_roles?: string[]
          blocked_resource_types?: string[]
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          max_risk_level?: string
          requires_human_approval?: boolean
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_context_policies: {
        Row: {
          allowed: boolean
          allowed_model_risk_tiers: string[]
          context_type: string
          created_at: string
          created_by: string | null
          id: string
          max_context_items: number
          requires_permission: string | null
          requires_redaction: boolean
          retention_days: number | null
          rules: Json
          sensitivity_level: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          allowed?: boolean
          allowed_model_risk_tiers?: string[]
          context_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          max_context_items?: number
          requires_permission?: string | null
          requires_redaction?: boolean
          retention_days?: number | null
          rules?: Json
          sensitivity_level?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          allowed?: boolean
          allowed_model_risk_tiers?: string[]
          context_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          max_context_items?: number
          requires_permission?: string | null
          requires_redaction?: boolean
          retention_days?: number | null
          rules?: Json
          sensitivity_level?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_cost_budgets: {
        Row: {
          budget_key: string
          created_at: string
          created_by: string | null
          currency: string
          current_estimated_cents: number
          hard_limit_enabled: boolean
          id: string
          limit_cents: number
          name: string
          period: string
          scope_id: string | null
          scope_type: string
          status: string
          team_id: string
          updated_at: string
          warning_threshold_percent: number
        }
        Insert: {
          budget_key: string
          created_at?: string
          created_by?: string | null
          currency?: string
          current_estimated_cents?: number
          hard_limit_enabled?: boolean
          id?: string
          limit_cents?: number
          name: string
          period?: string
          scope_id?: string | null
          scope_type?: string
          status?: string
          team_id: string
          updated_at?: string
          warning_threshold_percent?: number
        }
        Update: {
          budget_key?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          current_estimated_cents?: number
          hard_limit_enabled?: boolean
          id?: string
          limit_cents?: number
          name?: string
          period?: string
          scope_id?: string | null
          scope_type?: string
          status?: string
          team_id?: string
          updated_at?: string
          warning_threshold_percent?: number
        }
        Relationships: []
      }
      ai_eval_cases: {
        Row: {
          case_key: string
          created_at: string
          created_by: string | null
          expected_behavior: string | null
          forbidden_behavior: string | null
          grading_rubric: Json
          id: string
          input_context: Json
          name: string
          risk_tags: string[]
          status: string
          suite_id: string
          team_id: string
        }
        Insert: {
          case_key: string
          created_at?: string
          created_by?: string | null
          expected_behavior?: string | null
          forbidden_behavior?: string | null
          grading_rubric?: Json
          id?: string
          input_context?: Json
          name: string
          risk_tags?: string[]
          status?: string
          suite_id: string
          team_id: string
        }
        Update: {
          case_key?: string
          created_at?: string
          created_by?: string | null
          expected_behavior?: string | null
          forbidden_behavior?: string | null
          grading_rubric?: Json
          id?: string
          input_context?: Json
          name?: string
          risk_tags?: string[]
          status?: string
          suite_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_eval_cases_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "ai_eval_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_eval_results: {
        Row: {
          created_at: string
          eval_case_id: string
          eval_run_id: string
          findings: Json
          grader: string
          id: string
          output_preview: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string
          eval_case_id: string
          eval_run_id: string
          findings?: Json
          grader?: string
          id?: string
          output_preview?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status: string
          team_id: string
        }
        Update: {
          created_at?: string
          eval_case_id?: string
          eval_run_id?: string
          findings?: Json
          grader?: string
          id?: string
          output_preview?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_eval_results_eval_case_id_fkey"
            columns: ["eval_case_id"]
            isOneToOne: false
            referencedRelation: "ai_eval_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_eval_results_eval_run_id_fkey"
            columns: ["eval_run_id"]
            isOneToOne: false
            referencedRelation: "ai_eval_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_eval_runs: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          model_id: string | null
          prompt_id: string | null
          run_name: string
          started_at: string | null
          started_by: string | null
          status: string
          suite_id: string
          summary: Json
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          model_id?: string | null
          prompt_id?: string | null
          run_name: string
          started_at?: string | null
          started_by?: string | null
          status?: string
          suite_id: string
          summary?: Json
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          model_id?: string | null
          prompt_id?: string | null
          run_name?: string
          started_at?: string | null
          started_by?: string | null
          status?: string
          suite_id?: string
          summary?: Json
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_eval_runs_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "ai_eval_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_eval_suites: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          eval_type: string
          id: string
          name: string
          status: string
          suite_key: string
          target_model_id: string | null
          target_prompt_id: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          eval_type?: string
          id?: string
          name: string
          status?: string
          suite_key: string
          target_model_id?: string | null
          target_prompt_id?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          eval_type?: string
          id?: string
          name?: string
          status?: string
          suite_key?: string
          target_model_id?: string | null
          target_prompt_id?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_governance_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      ai_governance_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_model_registry: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_for_autonomous_actions: boolean
          approved_for_customer_facing: boolean
          approved_for_production: boolean
          approved_for_sensitive_data: boolean
          approved_for_tool_calls: boolean
          cost_input_per_1k: number | null
          cost_output_per_1k: number | null
          created_at: string
          created_by: string | null
          currency: string
          data_processing_notes: string | null
          data_retention_policy: string | null
          display_name: string
          id: string
          max_input_tokens: number | null
          max_output_tokens: number | null
          metadata: Json
          model_family: string | null
          model_key: string
          model_type: string
          owner_user_id: string | null
          provider_config_id: string | null
          risk_tier: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_for_autonomous_actions?: boolean
          approved_for_customer_facing?: boolean
          approved_for_production?: boolean
          approved_for_sensitive_data?: boolean
          approved_for_tool_calls?: boolean
          cost_input_per_1k?: number | null
          cost_output_per_1k?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          data_processing_notes?: string | null
          data_retention_policy?: string | null
          display_name: string
          id?: string
          max_input_tokens?: number | null
          max_output_tokens?: number | null
          metadata?: Json
          model_family?: string | null
          model_key: string
          model_type?: string
          owner_user_id?: string | null
          provider_config_id?: string | null
          risk_tier?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_for_autonomous_actions?: boolean
          approved_for_customer_facing?: boolean
          approved_for_production?: boolean
          approved_for_sensitive_data?: boolean
          approved_for_tool_calls?: boolean
          cost_input_per_1k?: number | null
          cost_output_per_1k?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          data_processing_notes?: string | null
          data_retention_policy?: string | null
          display_name?: string
          id?: string
          max_input_tokens?: number | null
          max_output_tokens?: number | null
          metadata?: Json
          model_family?: string | null
          model_key?: string
          model_type?: string
          owner_user_id?: string | null
          provider_config_id?: string | null
          risk_tier?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_registry_provider_config_id_fkey"
            columns: ["provider_config_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_policy_evaluations: {
        Row: {
          ai_job_id: string | null
          conversation_id: string | null
          created_at: string
          decision: string
          evaluated_at: string
          evaluated_context_summary: Json
          id: string
          matched_pattern: string | null
          message_id: string | null
          model_id: string | null
          prompt_id: string | null
          reason: string | null
          risk_score: number | null
          rule_id: string | null
          team_id: string
        }
        Insert: {
          ai_job_id?: string | null
          conversation_id?: string | null
          created_at?: string
          decision: string
          evaluated_at?: string
          evaluated_context_summary?: Json
          id?: string
          matched_pattern?: string | null
          message_id?: string | null
          model_id?: string | null
          prompt_id?: string | null
          reason?: string | null
          risk_score?: number | null
          rule_id?: string | null
          team_id: string
        }
        Update: {
          ai_job_id?: string | null
          conversation_id?: string | null
          created_at?: string
          decision?: string
          evaluated_at?: string
          evaluated_context_summary?: Json
          id?: string
          matched_pattern?: string | null
          message_id?: string | null
          model_id?: string | null
          prompt_id?: string | null
          reason?: string | null
          risk_score?: number | null
          rule_id?: string | null
          team_id?: string
        }
        Relationships: []
      }
      ai_policy_rules: {
        Row: {
          applies_to_context_types: string[]
          applies_to_prompt_types: string[]
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          enforcement_mode: string
          id: string
          name: string
          pattern: string | null
          rule_key: string
          rule_type: string
          severity: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          applies_to_context_types?: string[]
          applies_to_prompt_types?: string[]
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforcement_mode?: string
          id?: string
          name: string
          pattern?: string | null
          rule_key: string
          rule_type: string
          severity?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          applies_to_context_types?: string[]
          applies_to_prompt_types?: string[]
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforcement_mode?: string
          id?: string
          name?: string
          pattern?: string | null
          rule_key?: string
          rule_type?: string
          severity?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_prompt_registry: {
        Row: {
          allowed_context_types: string[]
          allowed_model_ids: string[]
          allows_customer_facing_output: boolean
          allows_tool_calls: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          owner_user_id: string | null
          prompt_key: string
          prompt_type: string
          requires_redaction: boolean
          requires_review: boolean
          reviewed_by: string | null
          risk_level: string
          sensitivity_level: string
          status: string
          system_prompt: string | null
          team_id: string
          updated_at: string
          updated_by: string | null
          user_prompt_template: string
          variables: Json
          visibility: string
        }
        Insert: {
          allowed_context_types?: string[]
          allowed_model_ids?: string[]
          allows_customer_facing_output?: boolean
          allows_tool_calls?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          prompt_key: string
          prompt_type?: string
          requires_redaction?: boolean
          requires_review?: boolean
          reviewed_by?: string | null
          risk_level?: string
          sensitivity_level?: string
          status?: string
          system_prompt?: string | null
          team_id: string
          updated_at?: string
          updated_by?: string | null
          user_prompt_template: string
          variables?: Json
          visibility?: string
        }
        Update: {
          allowed_context_types?: string[]
          allowed_model_ids?: string[]
          allows_customer_facing_output?: boolean
          allows_tool_calls?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          prompt_key?: string
          prompt_type?: string
          requires_redaction?: boolean
          requires_review?: boolean
          reviewed_by?: string | null
          risk_level?: string
          sensitivity_level?: string
          status?: string
          system_prompt?: string | null
          team_id?: string
          updated_at?: string
          updated_by?: string | null
          user_prompt_template?: string
          variables?: Json
          visibility?: string
        }
        Relationships: []
      }
      ai_prompt_reviews: {
        Row: {
          checklist: Json
          comments: string | null
          created_at: string
          created_by: string | null
          id: string
          prompt_id: string
          review_type: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          checklist?: Json
          comments?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          prompt_id: string
          review_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          checklist?: Json
          comments?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          prompt_id?: string
          review_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_reviews_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_summary: string | null
          created_at: string
          created_by: string | null
          id: string
          prompt_id: string
          status: string
          system_prompt: string | null
          team_id: string
          user_prompt_template: string
          variables: Json
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          prompt_id: string
          status?: string
          system_prompt?: string | null
          team_id: string
          user_prompt_template: string
          variables?: Json
          version_number: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          prompt_id?: string
          status?: string
          system_prompt?: string | null
          team_id?: string
          user_prompt_template?: string
          variables?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_configs: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          credential_reference: string | null
          credential_status: string
          data_processing_region_id: string | null
          default_timeout_seconds: number
          id: string
          last_error_message: string | null
          last_tested_at: string | null
          max_context_tokens: number | null
          name: string
          provider_key: string
          provider_type: string
          status: string
          supports_embeddings: boolean
          supports_json_mode: boolean
          supports_safety_metadata: boolean
          supports_streaming: boolean
          supports_tools: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credential_reference?: string | null
          credential_status?: string
          data_processing_region_id?: string | null
          default_timeout_seconds?: number
          id?: string
          last_error_message?: string | null
          last_tested_at?: string | null
          max_context_tokens?: number | null
          name: string
          provider_key: string
          provider_type: string
          status?: string
          supports_embeddings?: boolean
          supports_json_mode?: boolean
          supports_safety_metadata?: boolean
          supports_streaming?: boolean
          supports_tools?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credential_reference?: string | null
          credential_status?: string
          data_processing_region_id?: string | null
          default_timeout_seconds?: number
          id?: string
          last_error_message?: string | null
          last_tested_at?: string | null
          max_context_tokens?: number | null
          name?: string
          provider_key?: string
          provider_type?: string
          status?: string
          supports_embeddings?: boolean
          supports_json_mode?: boolean
          supports_safety_metadata?: boolean
          supports_streaming?: boolean
          supports_tools?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_safety_findings: {
        Row: {
          ai_job_id: string | null
          conversation_id: string | null
          created_at: string
          description: string | null
          detected_by: string
          evidence: Json
          finding_type: string
          id: string
          message_id: string | null
          recommended_action: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_job_id?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          detected_by?: string
          evidence?: Json
          finding_type: string
          id?: string
          message_id?: string | null
          recommended_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_job_id?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          detected_by?: string
          evidence?: Json
          finding_type?: string
          id?: string
          message_id?: string | null
          recommended_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_records: {
        Row: {
          ai_job_id: string | null
          context_type: string | null
          conversation_id: string | null
          created_at: string
          currency: string
          estimated_cost_cents: number | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          metadata: Json
          model_id: string | null
          output_tokens: number | null
          prompt_id: string | null
          provider_config_id: string | null
          recorded_at: string
          source: string
          status: string
          team_id: string
          total_tokens: number | null
        }
        Insert: {
          ai_job_id?: string | null
          context_type?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string
          estimated_cost_cents?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json
          model_id?: string | null
          output_tokens?: number | null
          prompt_id?: string | null
          provider_config_id?: string | null
          recorded_at?: string
          source?: string
          status?: string
          team_id: string
          total_tokens?: number | null
        }
        Update: {
          ai_job_id?: string | null
          context_type?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string
          estimated_cost_cents?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json
          model_id?: string | null
          output_tokens?: number | null
          prompt_id?: string | null
          provider_config_id?: string | null
          recorded_at?: string
          source?: string
          status?: string
          team_id?: string
          total_tokens?: number | null
        }
        Relationships: []
      }
      alert_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_rule_id: string | null
          created_at: string
          dedupe_key: string | null
          fired_at: string
          id: string
          incident_id: string | null
          message: string | null
          payload: Json
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string | null
          resource_type: string | null
          service_id: string | null
          severity: string
          source: string
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          fired_at?: string
          id?: string
          incident_id?: string | null
          message?: string | null
          payload?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          service_id?: string | null
          severity?: string
          source?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          fired_at?: string
          id?: string
          incident_id?: string | null
          message?: string | null
          payload?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          service_id?: string | null
          severity?: string
          source?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_incident_fk"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          auto_create_incident: boolean
          condition_config: Json
          cooldown_minutes: number
          created_at: string
          created_by: string | null
          dedupe_key: string | null
          description: string | null
          enabled: boolean
          id: string
          name: string
          notification_channels: Json
          rule_type: string
          service_id: string | null
          severity: string
          team_id: string
          updated_at: string
        }
        Insert: {
          auto_create_incident?: boolean
          condition_config?: Json
          cooldown_minutes?: number
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          notification_channels?: Json
          rule_type: string
          service_id?: string | null
          severity?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          auto_create_incident?: boolean
          condition_config?: Json
          cooldown_minutes?: number
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          notification_channels?: Json
          rule_type?: string
          service_id?: string | null
          severity?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "observability_services"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[]
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[]
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[]
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limit_events: {
        Row: {
          allowed: boolean
          api_key_id: string | null
          created_at: string
          id: string
          limit_count: number | null
          limit_key: string
          metadata: Json
          reason: string | null
          remaining: number | null
          reset_at: string | null
          scope: string
          team_id: string
        }
        Insert: {
          allowed: boolean
          api_key_id?: string | null
          created_at?: string
          id?: string
          limit_count?: number | null
          limit_key: string
          metadata?: Json
          reason?: string | null
          remaining?: number | null
          reset_at?: string | null
          scope: string
          team_id: string
        }
        Update: {
          allowed?: boolean
          api_key_id?: string | null
          created_at?: string
          id?: string
          limit_count?: number | null
          limit_key?: string
          metadata?: Json
          reason?: string | null
          remaining?: number | null
          reset_at?: string | null
          scope?: string
          team_id?: string
        }
        Relationships: []
      }
      api_requests: {
        Row: {
          api_key_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          latency_ms: number | null
          metadata: Json
          method: string
          path: string
          request_id: string
          status_code: number
          team_id: string
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number | null
          metadata?: Json
          method: string
          path: string
          request_id: string
          status_code: number
          team_id: string
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number | null
          metadata?: Json
          method?: string
          path?: string
          request_id?: string
          status_code?: number
          team_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      archive_references: {
        Row: {
          archive_location: string | null
          archive_provider: string
          archive_status: string
          archived_at: string | null
          archived_by: string | null
          checksum_sha256: string | null
          created_at: string
          data_category: string | null
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
          restore_requested_at: string | null
          restored_at: string | null
          size_bytes: number | null
          storage_path: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          archive_location?: string | null
          archive_provider?: string
          archive_status?: string
          archived_at?: string | null
          archived_by?: string | null
          checksum_sha256?: string | null
          created_at?: string
          data_category?: string | null
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
          restore_requested_at?: string | null
          restored_at?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          archive_location?: string | null
          archive_provider?: string
          archive_status?: string
          archived_at?: string | null
          archived_by?: string | null
          checksum_sha256?: string | null
          created_at?: string
          data_category?: string | null
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
          restore_requested_at?: string | null
          restored_at?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_assignments: {
        Row: {
          asset_id: string
          assigned_at: string
          assigned_by: string | null
          assigned_to_customer_account_id: string | null
          assigned_to_device_id: string | null
          assigned_to_partner_id: string | null
          assigned_to_user_id: string | null
          assignment_type: string
          condition_on_assign: string | null
          condition_on_return: string | null
          created_at: string
          id: string
          metadata: Json
          notes: string | null
          returned_at: string | null
          returned_by: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          assigned_at?: string
          assigned_by?: string | null
          assigned_to_customer_account_id?: string | null
          assigned_to_device_id?: string | null
          assigned_to_partner_id?: string | null
          assigned_to_user_id?: string | null
          assignment_type?: string
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          returned_at?: string | null
          returned_by?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          assigned_at?: string
          assigned_by?: string | null
          assigned_to_customer_account_id?: string | null
          assigned_to_device_id?: string | null
          assigned_to_partner_id?: string | null
          assigned_to_user_id?: string | null
          assignment_type?: string
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          returned_at?: string | null
          returned_by?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_categories: {
        Row: {
          category_key: string
          category_type: string
          created_at: string
          default_depreciation_months: number | null
          description: string | null
          id: string
          name: string
          parent_category_id: string | null
          requires_assignment: boolean
          requires_serial_number: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          category_key: string
          category_type?: string
          created_at?: string
          default_depreciation_months?: number | null
          description?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          requires_assignment?: boolean
          requires_serial_number?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          category_key?: string
          category_type?: string
          created_at?: string
          default_depreciation_months?: number | null
          description?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          requires_assignment?: boolean
          requires_serial_number?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_contracts: {
        Row: {
          auto_renew: boolean
          contract_number: string | null
          contract_type: string
          contract_value_cents: number | null
          created_at: string
          created_by: string | null
          currency: string
          end_date: string | null
          external_url: string | null
          id: string
          metadata: Json
          notice_period_days: number | null
          owner_user_id: string | null
          renewal_date: string | null
          sensitivity_level: string
          start_date: string | null
          status: string
          storage_path: string | null
          team_id: string
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          auto_renew?: boolean
          contract_number?: string | null
          contract_type?: string
          contract_value_cents?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json
          notice_period_days?: number | null
          owner_user_id?: string | null
          renewal_date?: string | null
          sensitivity_level?: string
          start_date?: string | null
          status?: string
          storage_path?: string | null
          team_id: string
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          auto_renew?: boolean
          contract_number?: string | null
          contract_type?: string
          contract_value_cents?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json
          notice_period_days?: number | null
          owner_user_id?: string | null
          renewal_date?: string | null
          sensitivity_level?: string
          start_date?: string | null
          status?: string
          storage_path?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      asset_inventory_items: {
        Row: {
          asset_name: string
          asset_tag: string | null
          asset_type: string
          assigned_to_customer_account_id: string | null
          assigned_to_team_id: string | null
          assigned_to_user_id: string | null
          category_id: string | null
          cost_center: string | null
          created_at: string
          created_by: string | null
          currency: string
          department: string | null
          expected_retirement_date: string | null
          id: string
          lifecycle_stage: string
          linked_client_installation_id: string | null
          linked_device_id: string | null
          linked_mobile_installation_id: string | null
          location_label: string | null
          manufacturer: string | null
          metadata: Json
          model: string | null
          notes: string | null
          purchase_cost_cents: number | null
          purchase_date: string | null
          purchase_order_id: string | null
          serial_number: string | null
          status: string
          team_id: string
          updated_at: string
          updated_by: string | null
          vendor_id: string | null
          warranty_end: string | null
          warranty_start: string | null
        }
        Insert: {
          asset_name: string
          asset_tag?: string | null
          asset_type?: string
          assigned_to_customer_account_id?: string | null
          assigned_to_team_id?: string | null
          assigned_to_user_id?: string | null
          category_id?: string | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          department?: string | null
          expected_retirement_date?: string | null
          id?: string
          lifecycle_stage?: string
          linked_client_installation_id?: string | null
          linked_device_id?: string | null
          linked_mobile_installation_id?: string | null
          location_label?: string | null
          manufacturer?: string | null
          metadata?: Json
          model?: string | null
          notes?: string | null
          purchase_cost_cents?: number | null
          purchase_date?: string | null
          purchase_order_id?: string | null
          serial_number?: string | null
          status?: string
          team_id: string
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
          warranty_end?: string | null
          warranty_start?: string | null
        }
        Update: {
          asset_name?: string
          asset_tag?: string | null
          asset_type?: string
          assigned_to_customer_account_id?: string | null
          assigned_to_team_id?: string | null
          assigned_to_user_id?: string | null
          category_id?: string | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          department?: string | null
          expected_retirement_date?: string | null
          id?: string
          lifecycle_stage?: string
          linked_client_installation_id?: string | null
          linked_device_id?: string | null
          linked_mobile_installation_id?: string | null
          location_label?: string | null
          manufacturer?: string | null
          metadata?: Json
          model?: string | null
          notes?: string | null
          purchase_cost_cents?: number | null
          purchase_date?: string | null
          purchase_order_id?: string | null
          serial_number?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
          warranty_end?: string | null
          warranty_start?: string | null
        }
        Relationships: []
      }
      asset_lifecycle_events: {
        Row: {
          actor_id: string | null
          asset_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          new_status: string | null
          old_status: string | null
          resource_id: string | null
          resource_type: string | null
          software_license_id: string | null
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          asset_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          new_status?: string | null
          old_status?: string | null
          resource_id?: string | null
          resource_type?: string | null
          software_license_id?: string | null
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          asset_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          new_status?: string | null
          old_status?: string | null
          resource_id?: string | null
          resource_type?: string | null
          software_license_id?: string | null
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      asset_maintenance_events: {
        Row: {
          asset_id: string
          completed_at: string | null
          cost_cents: number | null
          created_at: string
          currency: string
          description: string | null
          event_type: string
          field_job_id: string | null
          id: string
          metadata: Json
          notes: string | null
          performed_by: string | null
          scheduled_at: string | null
          status: string
          support_ticket_id: string | null
          team_id: string
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          asset_id: string
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          event_type?: string
          field_job_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          performed_by?: string | null
          scheduled_at?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id: string
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          asset_id?: string
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          event_type?: string
          field_job_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          performed_by?: string | null
          scheduled_at?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      asset_receipts: {
        Row: {
          condition: string
          created_asset_ids: string[]
          created_at: string
          id: string
          metadata: Json
          purchase_order_id: string | null
          purchase_order_item_id: string | null
          quantity_received: number
          received_at: string
          received_by: string | null
          receiving_notes: string | null
          team_id: string
        }
        Insert: {
          condition?: string
          created_asset_ids?: string[]
          created_at?: string
          id?: string
          metadata?: Json
          purchase_order_id?: string | null
          purchase_order_item_id?: string | null
          quantity_received?: number
          received_at?: string
          received_by?: string | null
          receiving_notes?: string | null
          team_id: string
        }
        Update: {
          condition?: string
          created_asset_ids?: string[]
          created_at?: string
          id?: string
          metadata?: Json
          purchase_order_id?: string | null
          purchase_order_item_id?: string | null
          quantity_received?: number
          received_at?: string
          received_by?: string | null
          receiving_notes?: string | null
          team_id?: string
        }
        Relationships: []
      }
      asset_vendors: {
        Row: {
          account_manager_email: string | null
          account_manager_name: string | null
          created_at: string
          created_by: string | null
          id: string
          metadata: Json
          name: string
          risk_level: string
          security_review_status: string
          status: string
          support_email: string | null
          support_url: string | null
          team_id: string
          updated_at: string
          vendor_key: string
          vendor_type: string
          website_url: string | null
        }
        Insert: {
          account_manager_email?: string | null
          account_manager_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          name: string
          risk_level?: string
          security_review_status?: string
          status?: string
          support_email?: string | null
          support_url?: string | null
          team_id: string
          updated_at?: string
          vendor_key: string
          vendor_type?: string
          website_url?: string | null
        }
        Update: {
          account_manager_email?: string | null
          account_manager_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          name?: string
          risk_level?: string
          security_review_status?: string
          status?: string
          support_email?: string | null
          support_url?: string | null
          team_id?: string
          updated_at?: string
          vendor_key?: string
          vendor_type?: string
          website_url?: string | null
        }
        Relationships: []
      }
      audit_export_jobs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checksum_sha256: string | null
          created_at: string
          description: string | null
          error_message: string | null
          expires_at: string | null
          export_type: string
          filters: Json
          finished_at: string | null
          format: string
          id: string
          output: Json
          requested_by: string | null
          size_bytes: number | null
          started_at: string | null
          status: string
          storage_path: string | null
          team_id: string
          title: string
          updated_at: string
          vault_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checksum_sha256?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          filters?: Json
          finished_at?: string | null
          format?: string
          id?: string
          output?: Json
          requested_by?: string | null
          size_bytes?: number | null
          started_at?: string | null
          status?: string
          storage_path?: string | null
          team_id: string
          title: string
          updated_at?: string
          vault_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checksum_sha256?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          filters?: Json
          finished_at?: string | null
          format?: string
          id?: string
          output?: Json
          requested_by?: string | null
          size_bytes?: number | null
          started_at?: string | null
          status?: string
          storage_path?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_export_jobs_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "audit_export_vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_export_vaults: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          encryption_status: string
          external_archive_reference: string | null
          id: string
          name: string
          retention_days: number | null
          status: string
          storage_bucket: string | null
          storage_prefix: string | null
          team_id: string
          updated_at: string
          vault_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          encryption_status?: string
          external_archive_reference?: string | null
          id?: string
          name: string
          retention_days?: number | null
          status?: string
          storage_bucket?: string | null
          storage_prefix?: string | null
          team_id: string
          updated_at?: string
          vault_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          encryption_status?: string
          external_archive_reference?: string | null
          id?: string
          name?: string
          retention_days?: number | null
          status?: string
          storage_bucket?: string | null
          storage_prefix?: string | null
          team_id?: string
          updated_at?: string
          vault_type?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_label: string | null
          created_at: string
          id: string
          ip: unknown
          metadata: Json
          severity: Database["public"]["Enums"]["audit_severity"]
          target: string | null
          team_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_label?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          metadata?: Json
          severity?: Database["public"]["Enums"]["audit_severity"]
          target?: string | null
          team_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_label?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          metadata?: Json
          severity?: Database["public"]["Enums"]["audit_severity"]
          target?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_accounts: {
        Row: {
          cooldown_until: string | null
          created_at: string
          created_by: string | null
          daily_task_count: number
          health_score: number
          id: string
          label: string
          last_used_at: string | null
          masked_label: string | null
          notes: string | null
          provider: string
          secret_ref: string | null
          status: string
          success_rate: number
          team_id: string | null
          updated_at: string
        }
        Insert: {
          cooldown_until?: string | null
          created_at?: string
          created_by?: string | null
          daily_task_count?: number
          health_score?: number
          id?: string
          label: string
          last_used_at?: string | null
          masked_label?: string | null
          notes?: string | null
          provider: string
          secret_ref?: string | null
          status?: string
          success_rate?: number
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          cooldown_until?: string | null
          created_at?: string
          created_by?: string | null
          daily_task_count?: number
          health_score?: number
          id?: string
          label?: string
          last_used_at?: string | null
          masked_label?: string | null
          notes?: string | null
          provider?: string
          secret_ref?: string | null
          status?: string
          success_rate?: number
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_accounts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_alert_routes: {
        Row: {
          channel: string
          config: Json
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          name: string
          team_id: string | null
        }
        Insert: {
          channel: string
          config?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          name: string
          team_id?: string | null
        }
        Update: {
          channel?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          name?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_alert_routes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_artifacts: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          pipeline_id: string | null
          pipeline_run_id: string | null
          preview: string | null
          size_bytes: number | null
          storage_path: string | null
          task_id: string | null
          team_id: string | null
          type: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          pipeline_id?: string | null
          pipeline_run_id?: string | null
          preview?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          task_id?: string | null
          team_id?: string | null
          type?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          pipeline_id?: string | null
          pipeline_run_id?: string | null
          preview?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          task_id?: string | null
          team_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_artifacts_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "automation_pipeline_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_artifacts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "automation_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_artifacts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          category: string | null
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json
          pipeline_id: string | null
          run_id: string | null
          system_id: string | null
          task_id: string | null
          team_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          level?: string
          message: string
          metadata?: Json
          pipeline_id?: string | null
          run_id?: string | null
          system_id?: string | null
          task_id?: string | null
          team_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json
          pipeline_id?: string | null
          run_id?: string | null
          system_id?: string | null
          task_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "automation_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "automation_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_pipeline_runs: {
        Row: {
          checkpoint: Json | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          metadata: Json
          output: Json
          pipeline_id: string | null
          stage_results: Json
          started_at: string | null
          status: string
          task_id: string | null
          team_id: string | null
          trigger_source: string
          triggered_by: string | null
        }
        Insert: {
          checkpoint?: Json | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          metadata?: Json
          output?: Json
          pipeline_id?: string | null
          stage_results?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
          team_id?: string | null
          trigger_source?: string
          triggered_by?: string | null
        }
        Update: {
          checkpoint?: Json | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          metadata?: Json
          output?: Json
          pipeline_id?: string | null
          stage_results?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
          team_id?: string | null
          trigger_source?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_pipeline_runs_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "automation_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_pipeline_runs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "automation_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_pipeline_runs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_pipelines: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_schema: Json | null
          last_run_at: string | null
          mode: string
          name: string
          next_run_at: string | null
          output_schema: Json | null
          stages: Json
          status: string
          steps: Json | null
          system_id: string | null
          team_id: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          last_run_at?: string | null
          mode?: string
          name: string
          next_run_at?: string | null
          output_schema?: Json | null
          stages?: Json
          status?: string
          steps?: Json | null
          system_id?: string | null
          team_id?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          last_run_at?: string | null
          mode?: string
          name?: string
          next_run_at?: string | null
          output_schema?: Json | null
          stages?: Json
          status?: string
          steps?: Json | null
          system_id?: string | null
          team_id?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_pipelines_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "automation_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_pipelines_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rate_limit_events: {
        Row: {
          account_id: string | null
          allowed: boolean | null
          cooldown_seconds: number | null
          created_at: string
          detected_at: string
          id: string
          limit_key: string | null
          message: string | null
          metadata: Json
          pipeline_id: string | null
          provider: string | null
          reason: string | null
          resolved_at: string | null
          run_id: string | null
          scope: string | null
          severity: string
          signal: string | null
          team_id: string | null
        }
        Insert: {
          account_id?: string | null
          allowed?: boolean | null
          cooldown_seconds?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          limit_key?: string | null
          message?: string | null
          metadata?: Json
          pipeline_id?: string | null
          provider?: string | null
          reason?: string | null
          resolved_at?: string | null
          run_id?: string | null
          scope?: string | null
          severity?: string
          signal?: string | null
          team_id?: string | null
        }
        Update: {
          account_id?: string | null
          allowed?: boolean | null
          cooldown_seconds?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          limit_key?: string | null
          message?: string | null
          metadata?: Json
          pipeline_id?: string | null
          provider?: string | null
          reason?: string | null
          resolved_at?: string | null
          run_id?: string | null
          scope?: string | null
          severity?: string
          signal?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rate_limit_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "automation_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rate_limit_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_scheduler_rules: {
        Row: {
          created_at: string
          created_by: string | null
          cron_expression: string | null
          enabled: boolean
          heavy_task_window: Json | null
          id: string
          interval_minutes: number | null
          last_run_at: string | null
          light_task_window: Json | null
          name: string
          next_run_at: string | null
          pipeline_id: string | null
          schedule_type: string
          team_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          enabled?: boolean
          heavy_task_window?: Json | null
          id?: string
          interval_minutes?: number | null
          last_run_at?: string | null
          light_task_window?: Json | null
          name: string
          next_run_at?: string | null
          pipeline_id?: string | null
          schedule_type?: string
          team_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          enabled?: boolean
          heavy_task_window?: Json | null
          id?: string
          interval_minutes?: number | null
          last_run_at?: string | null
          light_task_window?: Json | null
          name?: string
          next_run_at?: string | null
          pipeline_id?: string | null
          schedule_type?: string
          team_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_scheduler_rules_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "automation_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_scheduler_rules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_systems: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          health_score: number
          id: string
          last_heartbeat_at: string | null
          name: string
          slug: string
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          health_score?: number
          id?: string
          last_heartbeat_at?: string | null
          name: string
          slug: string
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          health_score?: number
          id?: string
          last_heartbeat_at?: string | null
          name?: string
          slug?: string
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_systems_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_tasks: {
        Row: {
          assigned_account_id: string | null
          attempts: number
          created_at: string
          created_by: string | null
          current_stage: number
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          max_attempts: number
          name: string | null
          output_payload: Json | null
          pipeline_id: string | null
          priority: string
          progress: number
          prompt: string
          run_id: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string
          team_id: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          assigned_account_id?: string | null
          attempts?: number
          created_at?: string
          created_by?: string | null
          current_stage?: number
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          max_attempts?: number
          name?: string | null
          output_payload?: Json | null
          pipeline_id?: string | null
          priority?: string
          progress?: number
          prompt: string
          run_id?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          team_id?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_account_id?: string | null
          attempts?: number
          created_at?: string
          created_by?: string | null
          current_stage?: number
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          max_attempts?: number
          name?: string | null
          output_payload?: Json | null
          pipeline_id?: string | null
          priority?: string
          progress?: number
          prompt?: string
          run_id?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          team_id?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_tasks_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "automation_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_access_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      bi_business_glossary_terms: {
        Row: {
          created_at: string
          created_by: string | null
          definition: string
          domain: string
          id: string
          owner_user_id: string | null
          related_dataset_ids: string[]
          related_metric_ids: string[]
          status: string
          team_id: string
          term: string
          term_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          definition: string
          domain?: string
          id?: string
          owner_user_id?: string | null
          related_dataset_ids?: string[]
          related_metric_ids?: string[]
          status?: string
          team_id: string
          term: string
          term_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          definition?: string
          domain?: string
          id?: string
          owner_user_id?: string | null
          related_dataset_ids?: string[]
          related_metric_ids?: string[]
          status?: string
          team_id?: string
          term?: string
          term_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      bi_dashboard_widgets: {
        Row: {
          config: Json
          created_at: string
          dashboard_id: string
          dataset_id: string | null
          description: string | null
          id: string
          metric_id: string | null
          sort_order: number
          status: string
          team_id: string
          title: string
          updated_at: string
          widget_key: string
          widget_type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          dashboard_id: string
          dataset_id?: string | null
          description?: string | null
          id?: string
          metric_id?: string | null
          sort_order?: number
          status?: string
          team_id: string
          title: string
          updated_at?: string
          widget_key: string
          widget_type?: string
        }
        Update: {
          config?: Json
          created_at?: string
          dashboard_id?: string
          dataset_id?: string | null
          description?: string | null
          id?: string
          metric_id?: string | null
          sort_order?: number
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          widget_key?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bi_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboard_widgets_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "bi_dataset_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_dashboard_widgets_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "bi_metric_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboards: {
        Row: {
          created_at: string
          created_by: string | null
          dashboard_key: string
          dashboard_type: string
          description: string | null
          filters: Json
          id: string
          layout: Json
          name: string
          owner_user_id: string | null
          status: string
          team_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dashboard_key: string
          dashboard_type?: string
          description?: string | null
          filters?: Json
          id?: string
          layout?: Json
          name: string
          owner_user_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dashboard_key?: string
          dashboard_type?: string
          description?: string | null
          filters?: Json
          id?: string
          layout?: Json
          name?: string
          owner_user_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      bi_data_quality_results: {
        Row: {
          actual_result: string | null
          checked_at: string
          created_at: string
          dataset_id: string | null
          details: Json
          error_message: string | null
          id: string
          metric_id: string | null
          rule_id: string
          score: number | null
          status: string
          team_id: string
        }
        Insert: {
          actual_result?: string | null
          checked_at?: string
          created_at?: string
          dataset_id?: string | null
          details?: Json
          error_message?: string | null
          id?: string
          metric_id?: string | null
          rule_id: string
          score?: number | null
          status: string
          team_id: string
        }
        Update: {
          actual_result?: string | null
          checked_at?: string
          created_at?: string
          dataset_id?: string | null
          details?: Json
          error_message?: string | null
          id?: string
          metric_id?: string | null
          rule_id?: string
          score?: number | null
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_data_quality_results_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "bi_data_quality_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_data_quality_rules: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          dataset_id: string | null
          description: string | null
          expected_result: string | null
          id: string
          metric_id: string | null
          name: string
          owner_user_id: string | null
          rule_key: string
          rule_type: string
          severity: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          dataset_id?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          metric_id?: string | null
          name: string
          owner_user_id?: string | null
          rule_key: string
          rule_type: string
          severity?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          dataset_id?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          metric_id?: string | null
          name?: string
          owner_user_id?: string | null
          rule_key?: string
          rule_type?: string
          severity?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_data_quality_rules_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "bi_dataset_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_data_quality_rules_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "bi_metric_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_data_sources: {
        Row: {
          config: Json
          connection_status: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json
          name: string
          owner_user_id: string | null
          sensitivity_level: string
          source_key: string
          source_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          connection_status?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          owner_user_id?: string | null
          sensitivity_level?: string
          source_key: string
          source_type?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          connection_status?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          owner_user_id?: string | null
          sensitivity_level?: string
          source_key?: string
          source_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bi_dataset_definitions: {
        Row: {
          created_at: string
          created_by: string | null
          data_source_id: string | null
          dataset_key: string
          dataset_type: string
          description: string | null
          domain: string
          fields: Json
          filters: Json
          id: string
          name: string
          owner_user_id: string | null
          refresh_mode: string
          sensitivity_level: string
          source_tables: string[]
          status: string
          team_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_source_id?: string | null
          dataset_key: string
          dataset_type?: string
          description?: string | null
          domain?: string
          fields?: Json
          filters?: Json
          id?: string
          name: string
          owner_user_id?: string | null
          refresh_mode?: string
          sensitivity_level?: string
          source_tables?: string[]
          status?: string
          team_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_source_id?: string | null
          dataset_key?: string
          dataset_type?: string
          description?: string | null
          domain?: string
          fields?: Json
          filters?: Json
          id?: string
          name?: string
          owner_user_id?: string | null
          refresh_mode?: string
          sensitivity_level?: string
          source_tables?: string[]
          status?: string
          team_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_dataset_definitions_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "bi_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_metric_definitions: {
        Row: {
          aggregation_config: Json
          created_at: string
          created_by: string | null
          currency: string | null
          dataset_id: string | null
          description: string | null
          desired_direction: string
          domain: string
          filters: Json
          formula: string | null
          id: string
          metric_key: string
          metric_type: string
          name: string
          owner_user_id: string | null
          sensitivity_level: string
          status: string
          team_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          aggregation_config?: Json
          created_at?: string
          created_by?: string | null
          currency?: string | null
          dataset_id?: string | null
          description?: string | null
          desired_direction?: string
          domain?: string
          filters?: Json
          formula?: string | null
          id?: string
          metric_key: string
          metric_type?: string
          name: string
          owner_user_id?: string | null
          sensitivity_level?: string
          status?: string
          team_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          aggregation_config?: Json
          created_at?: string
          created_by?: string | null
          currency?: string | null
          dataset_id?: string | null
          description?: string | null
          desired_direction?: string
          domain?: string
          filters?: Json
          formula?: string | null
          id?: string
          metric_key?: string
          metric_type?: string
          name?: string
          owner_user_id?: string | null
          sensitivity_level?: string
          status?: string
          team_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_metric_definitions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "bi_dataset_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_metric_snapshots: {
        Row: {
          calculation_source: string
          confidence: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json
          metric_id: string
          period_end: string | null
          period_start: string | null
          snapshot_at: string
          status: string
          team_id: string
          value_json: Json
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          calculation_source?: string
          confidence?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          metric_id: string
          period_end?: string | null
          period_start?: string | null
          snapshot_at?: string
          status?: string
          team_id: string
          value_json?: Json
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          calculation_source?: string
          confidence?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          metric_id?: string
          period_end?: string | null
          period_start?: string | null
          snapshot_at?: string
          status?: string
          team_id?: string
          value_json?: Json
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_metric_snapshots_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "bi_metric_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bi_sync_jobs: {
        Row: {
          connection_id: string | null
          created_at: string
          created_by: string | null
          dataset_id: string | null
          destination_table: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          job_type: string
          output: Json
          period_end: string | null
          period_start: string | null
          records_exported: number
          records_failed: number
          records_processed: number
          started_at: string | null
          status: string
          sync_mode: string
          team_id: string
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          dataset_id?: string | null
          destination_table?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          output?: Json
          period_end?: string | null
          period_start?: string | null
          records_exported?: number
          records_failed?: number
          records_processed?: number
          started_at?: string | null
          status?: string
          sync_mode?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          dataset_id?: string | null
          destination_table?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          output?: Json
          period_end?: string | null
          period_start?: string | null
          records_exported?: number
          records_failed?: number
          records_processed?: number
          started_at?: string | null
          status?: string
          sync_mode?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_sync_jobs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "bi_warehouse_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_sync_jobs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "bi_dataset_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_sync_schedules: {
        Row: {
          connection_id: string | null
          created_at: string
          created_by: string | null
          cron_expression: string | null
          dashboard_id: string | null
          dataset_id: string | null
          frequency: string
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          schedule_key: string
          schedule_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          dashboard_id?: string | null
          dataset_id?: string | null
          frequency?: string
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          schedule_key: string
          schedule_type?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          dashboard_id?: string | null
          dataset_id?: string | null
          frequency?: string
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          schedule_key?: string
          schedule_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_sync_schedules_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "bi_warehouse_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_sync_schedules_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "bi_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_sync_schedules_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "bi_dataset_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_warehouse_connections: {
        Row: {
          config: Json
          connection_key: string
          created_at: string
          created_by: string | null
          credential_reference: string | null
          credential_status: string
          destination_schema: string | null
          id: string
          last_error_message: string | null
          last_tested_at: string | null
          name: string
          region: string | null
          status: string
          team_id: string
          updated_at: string
          warehouse_type: string
        }
        Insert: {
          config?: Json
          connection_key: string
          created_at?: string
          created_by?: string | null
          credential_reference?: string | null
          credential_status?: string
          destination_schema?: string | null
          id?: string
          last_error_message?: string | null
          last_tested_at?: string | null
          name: string
          region?: string | null
          status?: string
          team_id: string
          updated_at?: string
          warehouse_type: string
        }
        Update: {
          config?: Json
          connection_key?: string
          created_at?: string
          created_by?: string | null
          credential_reference?: string | null
          credential_status?: string
          destination_schema?: string | null
          id?: string
          last_error_message?: string | null
          last_tested_at?: string | null
          name?: string
          region?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          warehouse_type?: string
        }
        Relationships: []
      }
      billing_alert_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_rule_id: string | null
          created_at: string
          current_usage: number | null
          entitlement_key: string | null
          id: string
          limit_value: number | null
          message: string | null
          meter_key: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          team_id: string
          title: string
          updated_at: string
          usage_percent: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          created_at?: string
          current_usage?: number | null
          entitlement_key?: string | null
          id?: string
          limit_value?: number | null
          message?: string | null
          meter_key?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
          usage_percent?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          created_at?: string
          current_usage?: number | null
          entitlement_key?: string | null
          id?: string
          limit_value?: number | null
          message?: string | null
          meter_key?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          usage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_alert_events_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "billing_alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_alert_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_alert_rules: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          entitlement_key: string | null
          id: string
          meter_key: string | null
          name: string
          notify_admins: boolean
          notify_billing_admins: boolean
          severity: string
          team_id: string
          threshold_percent: number
          threshold_quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          entitlement_key?: string | null
          id?: string
          meter_key?: string | null
          name: string
          notify_admins?: boolean
          notify_billing_admins?: boolean
          severity?: string
          team_id: string
          threshold_percent?: number
          threshold_quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          entitlement_key?: string | null
          id?: string
          meter_key?: string | null
          name?: string
          notify_admins?: boolean
          notify_billing_admins?: boolean
          severity?: string
          team_id?: string
          threshold_percent?: number
          threshold_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_alert_rules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_change_requests: {
        Row: {
          billing_interval: string
          created_at: string
          from_plan: string | null
          from_seats: number | null
          id: string
          note: string | null
          processed_at: string | null
          processed_by: string | null
          requested_by: string
          status: string
          team_id: string
          to_plan: string
          to_seats: number
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          from_plan?: string | null
          from_seats?: number | null
          id?: string
          note?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_by: string
          status?: string
          team_id: string
          to_plan: string
          to_seats: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          from_plan?: string | null
          from_seats?: number | null
          id?: string
          note?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_by?: string
          status?: string
          team_id?: string
          to_plan?: string
          to_seats?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_change_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_credit_grants: {
        Row: {
          amount_cents: number | null
          created_at: string
          credit_type: string
          currency: string
          expires_at: string | null
          granted_by: string | null
          id: string
          meter_key: string | null
          quantity_credit: number | null
          reason: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          credit_type?: string
          currency?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          meter_key?: string | null
          quantity_credit?: number | null
          reason?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          credit_type?: string
          currency?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          meter_key?: string | null
          quantity_credit?: number | null
          reason?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_credit_grants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_enforcement_events: {
        Row: {
          action_type: string
          created_at: string
          current_usage: number | null
          decision: string
          entitlement_key: string
          id: string
          limit_value: number | null
          metadata: Json
          meter_key: string | null
          reason: string | null
          requested_by: string | null
          resource_id: string | null
          resource_type: string | null
          team_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          current_usage?: number | null
          decision: string
          entitlement_key: string
          id?: string
          limit_value?: number | null
          metadata?: Json
          meter_key?: string | null
          reason?: string | null
          requested_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          team_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          current_usage?: number | null
          decision?: string
          entitlement_key?: string
          id?: string
          limit_value?: number | null
          metadata?: Json
          meter_key?: string | null
          reason?: string | null
          requested_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_enforcement_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_entitlements: {
        Row: {
          active: boolean
          created_at: string
          enforcement_mode: string
          entitlement_key: string
          entitlement_name: string
          entitlement_type: string
          id: string
          overage_allowed: boolean
          overage_price_cents: number | null
          plan_id: string
          reset_interval: string
          stripe_meter_id: string | null
          updated_at: string
          value_boolean: boolean | null
          value_integer: number | null
          value_json: Json
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          enforcement_mode?: string
          entitlement_key: string
          entitlement_name: string
          entitlement_type?: string
          id?: string
          overage_allowed?: boolean
          overage_price_cents?: number | null
          plan_id: string
          reset_interval?: string
          stripe_meter_id?: string | null
          updated_at?: string
          value_boolean?: boolean | null
          value_integer?: number | null
          value_json?: Json
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          enforcement_mode?: string
          entitlement_key?: string
          entitlement_name?: string
          entitlement_type?: string
          id?: string
          overage_allowed?: boolean
          overage_price_cents?: number | null
          plan_id?: string
          reset_interval?: string
          stripe_meter_id?: string | null
          updated_at?: string
          value_boolean?: boolean | null
          value_integer?: number | null
          value_json?: Json
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plan_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_meter_definitions: {
        Row: {
          active: boolean
          aggregation_method: string
          billable: boolean
          created_at: string
          description: string | null
          id: string
          metadata: Json
          meter_key: string
          name: string
          source_event: string | null
          source_table: string | null
          stripe_meter_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          aggregation_method?: string
          billable?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          meter_key: string
          name: string
          source_event?: string | null
          source_table?: string | null
          stripe_meter_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          aggregation_method?: string
          billable?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          meter_key?: string
          name?: string
          source_event?: string | null
          source_table?: string | null
          stripe_meter_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_overage_events: {
        Row: {
          created_at: string
          currency: string
          estimated_amount_cents: number | null
          id: string
          included_quantity: number | null
          invoice_id: string | null
          meter_key: string
          overage_quantity: number
          period_end: string
          period_start: string
          quantity: number
          status: string
          team_id: string
          unit_price_cents: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          estimated_amount_cents?: number | null
          id?: string
          included_quantity?: number | null
          invoice_id?: string | null
          meter_key: string
          overage_quantity?: number
          period_end: string
          period_start: string
          quantity: number
          status?: string
          team_id: string
          unit_price_cents?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          estimated_amount_cents?: number | null
          id?: string
          included_quantity?: number | null
          invoice_id?: string | null
          meter_key?: string
          overage_quantity?: number
          period_end?: string
          period_start?: string
          quantity?: number
          status?: string
          team_id?: string
          unit_price_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_overage_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_plan_catalog: {
        Row: {
          base_price_cents: number
          billing_interval: string
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json
          name: string
          plan_key: string
          public_visible: boolean
          sort_order: number
          status: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          tier: string
          trial_days: number
          updated_at: string
        }
        Insert: {
          base_price_cents?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          plan_key: string
          public_visible?: boolean
          sort_order?: number
          status?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tier?: string
          trial_days?: number
          updated_at?: string
        }
        Update: {
          base_price_cents?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          plan_key?: string
          public_visible?: boolean
          sort_order?: number
          status?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tier?: string
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      billing_plan_overrides: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          entitlement_key: string
          expires_at: string | null
          id: string
          override_type: string
          reason: string | null
          team_id: string
          updated_at: string
          value_boolean: boolean | null
          value_integer: number | null
          value_json: Json
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          entitlement_key: string
          expires_at?: string | null
          id?: string
          override_type?: string
          reason?: string | null
          team_id: string
          updated_at?: string
          value_boolean?: boolean | null
          value_integer?: number | null
          value_json?: Json
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          entitlement_key?: string
          expires_at?: string | null
          id?: string
          override_type?: string
          reason?: string | null
          team_id?: string
          updated_at?: string
          value_boolean?: boolean | null
          value_integer?: number | null
          value_json?: Json
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_plan_overrides_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_provider_sync_jobs: {
        Row: {
          attempt_count: number
          created_at: string
          created_by: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          max_attempts: number
          output: Json
          period_end: string | null
          period_start: string | null
          provider: string
          started_at: string | null
          status: string
          sync_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          max_attempts?: number
          output?: Json
          period_end?: string | null
          period_start?: string | null
          provider?: string
          started_at?: string | null
          status?: string
          sync_type: string
          team_id: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          max_attempts?: number
          output?: Json
          period_end?: string | null
          period_start?: string | null
          provider?: string
          started_at?: string | null
          status?: string
          sync_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_provider_sync_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_quota_status: {
        Row: {
          created_at: string
          current_usage: number
          enforcement_mode: string
          entitlement_key: string
          id: string
          last_checked_at: string
          limit_value: number | null
          metadata: Json
          meter_key: string | null
          period_end: string | null
          period_start: string | null
          status: string
          team_id: string
          updated_at: string
          usage_percent: number | null
        }
        Insert: {
          created_at?: string
          current_usage?: number
          enforcement_mode?: string
          entitlement_key: string
          id?: string
          last_checked_at?: string
          limit_value?: number | null
          metadata?: Json
          meter_key?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          team_id: string
          updated_at?: string
          usage_percent?: number | null
        }
        Update: {
          created_at?: string
          current_usage?: number
          enforcement_mode?: string
          entitlement_key?: string
          id?: string
          last_checked_at?: string
          limit_value?: number | null
          metadata?: Json
          meter_key?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          usage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_quota_status_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_usage_aggregates: {
        Row: {
          aggregation_status: string
          billable_quantity: number | null
          created_at: string
          currency: string
          estimated_cost_cents: number | null
          finalized_at: string | null
          id: string
          included_quantity: number | null
          last_event_at: string | null
          metadata: Json
          meter_key: string
          overage_quantity: number | null
          period_end: string
          period_start: string
          quantity: number
          synced_at: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          aggregation_status?: string
          billable_quantity?: number | null
          created_at?: string
          currency?: string
          estimated_cost_cents?: number | null
          finalized_at?: string | null
          id?: string
          included_quantity?: number | null
          last_event_at?: string | null
          metadata?: Json
          meter_key: string
          overage_quantity?: number | null
          period_end: string
          period_start: string
          quantity?: number
          synced_at?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          aggregation_status?: string
          billable_quantity?: number | null
          created_at?: string
          currency?: string
          estimated_cost_cents?: number | null
          finalized_at?: string | null
          id?: string
          included_quantity?: number | null
          last_event_at?: string | null
          metadata?: Json
          meter_key?: string
          overage_quantity?: number | null
          period_end?: string
          period_start?: string
          quantity?: number
          synced_at?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_aggregates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_usage_events: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          metadata: Json
          meter_key: string
          occurred_at: string
          quantity: number
          source: string
          source_resource_id: string | null
          source_resource_type: string | null
          team_id: string
          unit: string | null
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          meter_key: string
          occurred_at?: string
          quantity?: number
          source?: string
          source_resource_id?: string | null
          source_resource_type?: string | null
          team_id: string
          unit?: string | null
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          meter_key?: string
          occurred_at?: string
          quantity?: number
          source?: string
          source_resource_id?: string | null
          source_resource_type?: string | null
          team_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_usage_exports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          export_type: string
          id: string
          output: Json
          period_end: string
          period_start: string
          requested_by: string | null
          status: string
          storage_path: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          export_type: string
          id?: string
          output?: Json
          period_end: string
          period_start: string
          requested_by?: string | null
          status?: string
          storage_path?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          export_type?: string
          id?: string
          output?: Json
          period_end?: string
          period_start?: string
          requested_by?: string | null
          status?: string
          storage_path?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_exports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      board_report_packets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          artifact_id: string | null
          audience: string
          created_at: string
          created_by: string | null
          delivered_at: string | null
          description: string | null
          id: string
          included_dashboard_ids: string[]
          included_report_ids: string[]
          packet_key: string
          period_end: string | null
          period_start: string | null
          sections: Json
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          artifact_id?: string | null
          audience?: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          description?: string | null
          id?: string
          included_dashboard_ids?: string[]
          included_report_ids?: string[]
          packet_key: string
          period_end?: string | null
          period_start?: string | null
          sections?: Json
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          artifact_id?: string | null
          audience?: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          description?: string | null
          id?: string
          included_dashboard_ids?: string[]
          included_report_ids?: string[]
          packet_key?: string
          period_end?: string | null
          period_start?: string | null
          sections?: Json
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chain_of_custody_events: {
        Row: {
          actor_id: string | null
          bundle_id: string | null
          checksum_sha256: string | null
          created_at: string
          description: string | null
          event_type: string
          export_job_id: string | null
          id: string
          ip_address: unknown
          legal_hold_id: string | null
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          team_id: string
          title: string
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          bundle_id?: string | null
          checksum_sha256?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          export_job_id?: string | null
          id?: string
          ip_address?: unknown
          legal_hold_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          team_id: string
          title: string
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          bundle_id?: string | null
          checksum_sha256?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          export_job_id?: string | null
          id?: string
          ip_address?: unknown
          legal_hold_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          team_id?: string
          title?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chain_of_custody_events_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "evidence_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_of_custody_events_export_job_id_fkey"
            columns: ["export_job_id"]
            isOneToOne: false
            referencedRelation: "audit_export_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_of_custody_events_legal_hold_id_fkey"
            columns: ["legal_hold_id"]
            isOneToOne: false
            referencedRelation: "legal_holds"
            referencedColumns: ["id"]
          },
        ]
      }
      churn_risk_signals: {
        Row: {
          created_at: string
          customer_account_id: string | null
          description: string | null
          detected_at: string
          evidence: Json
          id: string
          partner_client_team_id: string | null
          recommended_action: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          signal_type: string
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_account_id?: string | null
          description?: string | null
          detected_at?: string
          evidence?: Json
          id?: string
          partner_client_team_id?: string | null
          recommended_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_account_id?: string | null
          description?: string | null
          detected_at?: string
          evidence?: Json
          id?: string
          partner_client_team_id?: string | null
          recommended_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clipboard_policies: {
        Row: {
          allow_images: boolean
          direction: string
          enabled: boolean
          max_chars: number
          redact_secrets: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          allow_images?: boolean
          direction?: string
          enabled?: boolean
          max_chars?: number
          redact_secrets?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          allow_images?: boolean
          direction?: string
          enabled?: boolean
          max_chars?: number
          redact_secrets?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clipboard_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      command_approval_requests: {
        Row: {
          created_at: string
          decision_note: string | null
          description: string | null
          expires_at: string | null
          id: string
          job_id: string | null
          metadata: Json
          request_type: string
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          script_id: string | null
          status: string
          target_summary: Json
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_note?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json
          request_type: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          script_id?: string | null
          status?: string
          target_summary?: Json
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_note?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json
          request_type?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          script_id?: string | null
          status?: string
          target_summary?: Json
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      command_policy_evaluations: {
        Row: {
          created_at: string
          decision: string
          evaluated_at: string
          evaluated_by: string
          id: string
          job_id: string | null
          matched_pattern: string | null
          metadata: Json
          reason: string | null
          risk_score: number | null
          rule_id: string | null
          script_id: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          decision: string
          evaluated_at?: string
          evaluated_by?: string
          id?: string
          job_id?: string | null
          matched_pattern?: string | null
          metadata?: Json
          reason?: string | null
          risk_score?: number | null
          rule_id?: string | null
          script_id?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          decision?: string
          evaluated_at?: string
          evaluated_by?: string
          id?: string
          job_id?: string | null
          matched_pattern?: string | null
          metadata?: Json
          reason?: string | null
          risk_score?: number | null
          rule_id?: string | null
          script_id?: string | null
          team_id?: string
        }
        Relationships: []
      }
      command_policy_rules: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          enforcement_mode: string
          id: string
          name: string
          pattern: string | null
          rule_type: string
          severity: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforcement_mode?: string
          id?: string
          name: string
          pattern?: string | null
          rule_type: string
          severity?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforcement_mode?: string
          id?: string
          name?: string
          pattern?: string | null
          rule_type?: string
          severity?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      command_rollback_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          job_id: string | null
          rollback_script_id: string | null
          rollback_steps: Json
          rollback_type: string
          script_id: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          rollback_script_id?: string | null
          rollback_steps?: Json
          rollback_type?: string
          script_id?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          rollback_script_id?: string | null
          rollback_steps?: Json
          rollback_type?: string
          script_id?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      command_script_library: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          command_template: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          max_parallel_devices: number | null
          name: string
          platform: string
          requires_approval: boolean | null
          requires_customer_consent: boolean | null
          risk_level: string
          rollback_script_id: string | null
          script_body: string | null
          script_hash: string | null
          script_key: string
          shell_type: string
          status: string
          supports_dry_run: boolean | null
          supports_rollback: boolean | null
          team_id: string
          timeout_seconds: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          command_template?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_parallel_devices?: number | null
          name: string
          platform?: string
          requires_approval?: boolean | null
          requires_customer_consent?: boolean | null
          risk_level?: string
          rollback_script_id?: string | null
          script_body?: string | null
          script_hash?: string | null
          script_key: string
          shell_type?: string
          status?: string
          supports_dry_run?: boolean | null
          supports_rollback?: boolean | null
          team_id: string
          timeout_seconds?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          command_template?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_parallel_devices?: number | null
          name?: string
          platform?: string
          requires_approval?: boolean | null
          requires_customer_consent?: boolean | null
          risk_level?: string
          rollback_script_id?: string | null
          script_body?: string | null
          script_hash?: string | null
          script_key?: string
          shell_type?: string
          status?: string
          supports_dry_run?: boolean | null
          supports_rollback?: boolean | null
          team_id?: string
          timeout_seconds?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      command_script_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_summary: string | null
          command_template: Json
          created_at: string
          created_by: string | null
          id: string
          script_body: string | null
          script_hash: string | null
          script_id: string
          status: string
          team_id: string
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: string | null
          command_template?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          script_body?: string | null
          script_hash?: string | null
          script_id: string
          status?: string
          team_id: string
          version_number: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: string | null
          command_template?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          script_body?: string | null
          script_hash?: string | null
          script_id?: string
          status?: string
          team_id?: string
          version_number?: number
        }
        Relationships: []
      }
      compliance_controls: {
        Row: {
          control_domain: string | null
          control_key: string
          created_at: string
          created_by: string | null
          description: string | null
          evidence_summary: string | null
          framework_id: string | null
          id: string
          last_reviewed_at: string | null
          metadata: Json
          next_review_due_at: string | null
          owner_user_id: string | null
          public_visible: boolean
          status: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          control_domain?: string | null
          control_key: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_summary?: string | null
          framework_id?: string | null
          id?: string
          last_reviewed_at?: string | null
          metadata?: Json
          next_review_due_at?: string | null
          owner_user_id?: string | null
          public_visible?: boolean
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          control_domain?: string | null
          control_key?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_summary?: string | null
          framework_id?: string | null
          id?: string
          last_reviewed_at?: string | null
          metadata?: Json
          next_review_due_at?: string | null
          owner_user_id?: string | null
          public_visible?: boolean
          status?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_controls_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_controls_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidence_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_frameworks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          framework_key: string
          id: string
          metadata: Json
          name: string
          official_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          framework_key: string
          id?: string
          metadata?: Json
          name: string
          official_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          framework_key?: string
          id?: string
          metadata?: Json
          name?: string
          official_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_report_runs: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          finished_at: string | null
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          started_at: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          finished_at?: string | null
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          finished_at?: string | null
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_report_runs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_milestones: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          contract_id: string
          created_at: string
          due_date: string
          id: string
          milestone_type: string
          notes: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          contract_id: string
          created_at?: string
          due_date: string
          id?: string
          milestone_type?: string
          notes?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          contract_id?: string
          created_at?: string
          due_date?: string
          id?: string
          milestone_type?: string
          notes?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_accounts: {
        Row: {
          account_type: string
          created_at: string
          created_by: string | null
          id: string
          metadata: Json
          name: string
          notes: string | null
          phone: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          phone?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          phone?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_device_links: {
        Row: {
          access_status: string
          added_at: string
          added_by: string | null
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          device_id: string
          display_name: string | null
          id: string
          metadata: Json
          relationship: string
          revoked_at: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          access_status?: string
          added_at?: string
          added_by?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          device_id: string
          display_name?: string | null
          id?: string
          metadata?: Json
          relationship?: string
          revoked_at?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          access_status?: string
          added_at?: string
          added_by?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          device_id?: string
          display_name?: string | null
          id?: string
          metadata?: Json
          relationship?: string
          revoked_at?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_device_links_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_device_links_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "customer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_health_models: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          model_key: string
          name: string
          scoring_rules: Json
          status: string
          team_id: string
          updated_at: string
          weight_billing: number
          weight_engagement: number
          weight_security: number
          weight_support: number
          weight_usage: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          model_key: string
          name: string
          scoring_rules?: Json
          status?: string
          team_id: string
          updated_at?: string
          weight_billing?: number
          weight_engagement?: number
          weight_security?: number
          weight_support?: number
          weight_usage?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          model_key?: string
          name?: string
          scoring_rules?: Json
          status?: string
          team_id?: string
          updated_at?: string
          weight_billing?: number
          weight_engagement?: number
          weight_security?: number
          weight_support?: number
          weight_usage?: number
        }
        Relationships: []
      }
      customer_health_scores: {
        Row: {
          billing_score: number
          calculated_at: string
          calculated_from: string
          created_at: string
          customer_account_id: string | null
          engagement_score: number
          health_status: string
          id: string
          model_id: string | null
          partner_client_team_id: string | null
          reasons: Json
          recommendations: Json
          score: number
          security_score: number
          support_score: number
          team_id: string
          usage_score: number
        }
        Insert: {
          billing_score?: number
          calculated_at?: string
          calculated_from?: string
          created_at?: string
          customer_account_id?: string | null
          engagement_score?: number
          health_status?: string
          id?: string
          model_id?: string | null
          partner_client_team_id?: string | null
          reasons?: Json
          recommendations?: Json
          score?: number
          security_score?: number
          support_score?: number
          team_id: string
          usage_score?: number
        }
        Update: {
          billing_score?: number
          calculated_at?: string
          calculated_from?: string
          created_at?: string
          customer_account_id?: string | null
          engagement_score?: number
          health_status?: string
          id?: string
          model_id?: string | null
          partner_client_team_id?: string | null
          reasons?: Json
          recommendations?: Json
          score?: number
          security_score?: number
          support_score?: number
          team_id?: string
          usage_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_health_scores_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "customer_health_models"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_lifecycle_records: {
        Row: {
          created_at: string
          current_stage_id: string | null
          customer_account_id: string | null
          entered_stage_at: string | null
          id: string
          lifecycle_notes: string | null
          metadata: Json
          owner_user_id: string | null
          previous_stage_id: string | null
          status: string
          team_customer_id: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stage_id?: string | null
          customer_account_id?: string | null
          entered_stage_at?: string | null
          id?: string
          lifecycle_notes?: string | null
          metadata?: Json
          owner_user_id?: string | null
          previous_stage_id?: string | null
          status?: string
          team_customer_id?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stage_id?: string | null
          customer_account_id?: string | null
          entered_stage_at?: string | null
          id?: string
          lifecycle_notes?: string | null
          metadata?: Json
          owner_user_id?: string | null
          previous_stage_id?: string | null
          status?: string
          team_customer_id?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_lifecycle_records_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "customer_lifecycle_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_lifecycle_stages: {
        Row: {
          created_at: string
          description: string | null
          entry_criteria: Json
          exit_criteria: Json
          id: string
          name: string
          stage_key: string
          stage_order: number
          stage_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_criteria?: Json
          exit_criteria?: Json
          id?: string
          name: string
          stage_key: string
          stage_order?: number
          stage_type?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_criteria?: Json
          exit_criteria?: Json
          id?: string
          name?: string
          stage_key?: string
          stage_order?: number
          stage_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_portal_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          description: string | null
          device_id: string | null
          event_type: string
          id: string
          metadata: Json
          session_id: string | null
          severity: string
          support_ticket_id: string | null
          team_id: string
          title: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          description?: string | null
          device_id?: string | null
          event_type: string
          id?: string
          metadata?: Json
          session_id?: string | null
          severity?: string
          support_ticket_id?: string | null
          team_id: string
          title: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          description?: string | null
          device_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          session_id?: string | null
          severity?: string
          support_ticket_id?: string | null
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_events_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_events_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "customer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          customer_account_id: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invited_by: string | null
          metadata: Json
          role: string
          status: string
          team_id: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          customer_account_id?: string | null
          email: string
          expires_at: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          metadata?: Json
          role?: string
          status?: string
          team_id: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          customer_account_id?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          metadata?: Json
          role?: string
          status?: string
          team_id?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_invitations_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_settings: {
        Row: {
          allow_customer_device_onboarding: boolean
          allow_customer_session_requests: boolean
          allow_customer_ticket_creation: boolean
          brand_name: string | null
          created_at: string
          id: string
          portal_enabled: boolean
          portal_slug: string | null
          privacy_notice: string | null
          require_consent_for_each_session: boolean
          require_customer_mfa: boolean
          support_email: string | null
          support_phone: string | null
          team_id: string
          terms_url: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          allow_customer_device_onboarding?: boolean
          allow_customer_session_requests?: boolean
          allow_customer_ticket_creation?: boolean
          brand_name?: string | null
          created_at?: string
          id?: string
          portal_enabled?: boolean
          portal_slug?: string | null
          privacy_notice?: string | null
          require_consent_for_each_session?: boolean
          require_customer_mfa?: boolean
          support_email?: string | null
          support_phone?: string | null
          team_id: string
          terms_url?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          allow_customer_device_onboarding?: boolean
          allow_customer_session_requests?: boolean
          allow_customer_ticket_creation?: boolean
          brand_name?: string | null
          created_at?: string
          id?: string
          portal_enabled?: boolean
          portal_slug?: string | null
          privacy_notice?: string | null
          require_consent_for_each_session?: boolean
          require_customer_mfa?: boolean
          support_email?: string | null
          support_phone?: string | null
          team_id?: string
          terms_url?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      customer_success_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          customer_account_id: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          customer_account_id?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          customer_account_id?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      customer_success_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_survey_responses: {
        Row: {
          answers: Json
          comment: string | null
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          id: string
          metadata: Json
          partner_member_id: string | null
          rating_label: string | null
          score: number | null
          sentiment: string
          source: string
          submitted_at: string
          survey_id: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          comment?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          id?: string
          metadata?: Json
          partner_member_id?: string | null
          rating_label?: string | null
          score?: number | null
          sentiment?: string
          source?: string
          submitted_at?: string
          survey_id: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          comment?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          id?: string
          metadata?: Json
          partner_member_id?: string | null
          rating_label?: string | null
          score?: number | null
          sentiment?: string
          source?: string
          submitted_at?: string
          survey_id?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "customer_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          questions: Json
          status: string
          survey_key: string
          survey_type: string
          target_audience: string
          team_id: string
          trigger_event_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          questions?: Json
          status?: string
          survey_key: string
          survey_type?: string
          target_audience?: string
          team_id: string
          trigger_event_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          questions?: Json
          status?: string
          survey_key?: string
          survey_type?: string
          target_audience?: string
          team_id?: string
          trigger_event_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_touchpoints: {
        Row: {
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          customer_user_id: string | null
          id: string
          metadata: Json
          next_steps: string | null
          occurred_at: string
          outcome: string | null
          owner_user_id: string | null
          partner_client_team_id: string | null
          sentiment: string
          summary: string | null
          team_id: string
          title: string
          touchpoint_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          customer_user_id?: string | null
          id?: string
          metadata?: Json
          next_steps?: string | null
          occurred_at?: string
          outcome?: string | null
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          sentiment?: string
          summary?: string | null
          team_id: string
          title: string
          touchpoint_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          customer_user_id?: string | null
          id?: string
          metadata?: Json
          next_steps?: string | null
          occurred_at?: string
          outcome?: string | null
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          sentiment?: string
          summary?: string | null
          team_id?: string
          title?: string
          touchpoint_type?: string
        }
        Relationships: []
      }
      customer_users: {
        Row: {
          activated_at: string | null
          created_at: string
          customer_account_id: string
          email: string
          full_name: string | null
          id: string
          invited_by: string | null
          last_login_at: string | null
          role: string
          status: string
          team_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          customer_account_id: string
          email: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          last_login_at?: string | null
          role?: string
          status?: string
          team_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          customer_account_id?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          last_login_at?: string | null
          role?: string
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_users_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          action: string
          approved_by: string | null
          created_at: string
          data_category: string | null
          dry_run_result: Json
          execution_result: Json
          id: string
          legal_hold_id: string | null
          rejection_reason: string | null
          request_type: string
          requested_by: string | null
          resource_id: string | null
          resource_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          action?: string
          approved_by?: string | null
          created_at?: string
          data_category?: string | null
          dry_run_result?: Json
          execution_result?: Json
          id?: string
          legal_hold_id?: string | null
          rejection_reason?: string | null
          request_type: string
          requested_by?: string | null
          resource_id?: string | null
          resource_type: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          action?: string
          approved_by?: string | null
          created_at?: string
          data_category?: string | null
          dry_run_result?: Json
          execution_result?: Json
          id?: string
          legal_hold_id?: string | null
          rejection_reason?: string | null
          request_type?: string
          requested_by?: string | null
          resource_id?: string | null
          resource_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_legal_hold_id_fkey"
            columns: ["legal_hold_id"]
            isOneToOne: false
            referencedRelation: "legal_holds"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_evaluations: {
        Row: {
          created_at: string
          data_category: string
          decision: string
          eligible_at: string | null
          evaluated_at: string
          id: string
          legal_hold_id: string | null
          metadata: Json
          policy_id: string | null
          reason: string | null
          resource_created_at: string | null
          resource_id: string | null
          resource_type: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          data_category: string
          decision: string
          eligible_at?: string | null
          evaluated_at?: string
          id?: string
          legal_hold_id?: string | null
          metadata?: Json
          policy_id?: string | null
          reason?: string | null
          resource_created_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          data_category?: string
          decision?: string
          eligible_at?: string | null
          evaluated_at?: string
          id?: string
          legal_hold_id?: string | null
          metadata?: Json
          policy_id?: string | null
          reason?: string | null
          resource_created_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_retention_evaluations_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "data_retention_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          action_after_retention: string
          created_at: string
          created_by: string | null
          data_category: string
          description: string | null
          enabled: boolean
          enforcement_mode: string
          id: string
          legal_hold_exempt: boolean
          name: string
          priority: number
          resource_type: string | null
          retention_days: number
          team_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_after_retention?: string
          created_at?: string
          created_by?: string | null
          data_category: string
          description?: string | null
          enabled?: boolean
          enforcement_mode?: string
          id?: string
          legal_hold_exempt?: boolean
          name: string
          priority?: number
          resource_type?: string | null
          retention_days: number
          team_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_after_retention?: string
          created_at?: string
          created_by?: string | null
          data_category?: string
          description?: string | null
          enabled?: boolean
          enforcement_mode?: string
          id?: string
          legal_hold_exempt?: boolean
          name?: string
          priority?: number
          resource_type?: string | null
          retention_days?: number
          team_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      data_subject_request_items: {
        Row: {
          action: string
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json
          reason: string | null
          request_id: string
          resource_id: string | null
          resource_type: string
          reviewed_by: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          action: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
          request_id: string
          resource_id?: string | null
          resource_type: string
          reviewed_by?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          action?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
          request_id?: string
          resource_id?: string | null
          resource_type?: string
          reviewed_by?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_subject_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "data_subject_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      data_subject_requests: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          due_at: string | null
          id: string
          metadata: Json
          notes: string | null
          request_number: string | null
          request_type: string
          requested_by: string | null
          status: string
          subject_email: string | null
          subject_type: string
          subject_user_id: string | null
          team_id: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          request_number?: string | null
          request_type: string
          requested_by?: string | null
          status?: string
          subject_email?: string | null
          subject_type?: string
          subject_user_id?: string | null
          team_id: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          request_number?: string | null
          request_type?: string
          requested_by?: string | null
          status?: string
          subject_email?: string | null
          subject_type?: string
          subject_user_id?: string | null
          team_id?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      developer_docs_feedback: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          page: string
          rating: number | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          page: string
          rating?: number | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          page?: string
          rating?: number | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_agent_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          device_id: string | null
          event_type: string
          id: string
          job_id: string | null
          metadata: Json
          playbook_id: string | null
          resource_id: string | null
          resource_type: string | null
          script_id: string | null
          severity: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          device_id?: string | null
          event_type: string
          id?: string
          job_id?: string | null
          metadata?: Json
          playbook_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          script_id?: string | null
          severity?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          device_id?: string | null
          event_type?: string
          id?: string
          job_id?: string | null
          metadata?: Json
          playbook_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          script_id?: string | null
          severity?: string
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      device_agent_profiles: {
        Row: {
          agent_status: string
          agent_version: string | null
          architecture: string | null
          capabilities: string[]
          created_at: string
          device_id: string
          execution_mode: string
          id: string
          last_capability_report_at: string | null
          last_heartbeat_at: string | null
          metadata: Json
          platform: string | null
          policy_status: string
          supported_shells: string[]
          team_id: string
          trust_level: string
          updated_at: string
        }
        Insert: {
          agent_status?: string
          agent_version?: string | null
          architecture?: string | null
          capabilities?: string[]
          created_at?: string
          device_id: string
          execution_mode?: string
          id?: string
          last_capability_report_at?: string | null
          last_heartbeat_at?: string | null
          metadata?: Json
          platform?: string | null
          policy_status?: string
          supported_shells?: string[]
          team_id: string
          trust_level?: string
          updated_at?: string
        }
        Update: {
          agent_status?: string
          agent_version?: string | null
          architecture?: string | null
          capabilities?: string[]
          created_at?: string
          device_id?: string
          execution_mode?: string
          id?: string
          last_capability_report_at?: string | null
          last_heartbeat_at?: string | null
          metadata?: Json
          platform?: string | null
          policy_status?: string
          supported_shells?: string[]
          team_id?: string
          trust_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_agent_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          device_id: string
          event_type: string
          from_value: string | null
          id: string
          metadata: Json
          team_id: string
          to_value: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          device_id: string
          event_type: string
          from_value?: string | null
          id?: string
          metadata?: Json
          team_id: string
          to_value?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          device_id?: string
          event_type?: string
          from_value?: string | null
          id?: string
          metadata?: Json
          team_id?: string
          to_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_audit_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_audit_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      device_command_job_targets: {
        Row: {
          agent_profile_id: string | null
          completed_at: string | null
          created_at: string
          customer_account_id: string | null
          device_id: string
          dispatch_attempts: number | null
          dispatch_token_hash: string | null
          error_code: string | null
          error_message: string | null
          id: string
          job_id: string
          last_dispatched_at: string | null
          metadata: Json
          result_summary: string | null
          started_at: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          agent_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          device_id: string
          dispatch_attempts?: number | null
          dispatch_token_hash?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          last_dispatched_at?: string | null
          metadata?: Json
          result_summary?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          agent_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          device_id?: string
          dispatch_attempts?: number | null
          dispatch_token_hash?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          last_dispatched_at?: string | null
          metadata?: Json
          result_summary?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_command_jobs: {
        Row: {
          approval_request_id: string | null
          approved_by: string | null
          canceled_at: string | null
          canceled_by: string | null
          command_source: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          description: string | null
          execution_mode: string
          id: string
          incident_id: string | null
          job_number: string | null
          job_type: string
          max_parallel_devices: number | null
          metadata: Json
          requires_approval: boolean | null
          risk_level: string
          rollback_job_id: string | null
          scheduled_for: string | null
          script_id: string | null
          script_version_id: string | null
          started_at: string | null
          status: string
          support_ticket_id: string | null
          target_config: Json
          target_type: string
          team_id: string
          timeout_seconds: number | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_request_id?: string | null
          approved_by?: string | null
          canceled_at?: string | null
          canceled_by?: string | null
          command_source?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          description?: string | null
          execution_mode?: string
          id?: string
          incident_id?: string | null
          job_number?: string | null
          job_type?: string
          max_parallel_devices?: number | null
          metadata?: Json
          requires_approval?: boolean | null
          risk_level?: string
          rollback_job_id?: string | null
          scheduled_for?: string | null
          script_id?: string | null
          script_version_id?: string | null
          started_at?: string | null
          status?: string
          support_ticket_id?: string | null
          target_config?: Json
          target_type?: string
          team_id: string
          timeout_seconds?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_request_id?: string | null
          approved_by?: string | null
          canceled_at?: string | null
          canceled_by?: string | null
          command_source?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          description?: string | null
          execution_mode?: string
          id?: string
          incident_id?: string | null
          job_number?: string | null
          job_type?: string
          max_parallel_devices?: number | null
          metadata?: Json
          requires_approval?: boolean | null
          risk_level?: string
          rollback_job_id?: string | null
          scheduled_for?: string | null
          script_id?: string | null
          script_version_id?: string | null
          started_at?: string | null
          status?: string
          support_ticket_id?: string | null
          target_config?: Json
          target_type?: string
          team_id?: string
          timeout_seconds?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_command_logs: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          job_id: string
          log_level: string
          message: string
          metadata: Json
          source: string
          target_id: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          job_id: string
          log_level?: string
          message: string
          metadata?: Json
          source?: string
          target_id?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          job_id?: string
          log_level?: string
          message?: string
          metadata?: Json
          source?: string
          target_id?: string | null
          team_id?: string
        }
        Relationships: []
      }
      device_command_results: {
        Row: {
          artifact_id: string | null
          checksum_sha256: string | null
          created_at: string
          device_id: string
          exit_code: number | null
          id: string
          job_id: string
          metadata: Json
          output_json: Json
          reported_at: string
          reported_by: string
          status: string
          stderr_preview: string | null
          stdout_preview: string | null
          storage_path: string | null
          target_id: string
          team_id: string
        }
        Insert: {
          artifact_id?: string | null
          checksum_sha256?: string | null
          created_at?: string
          device_id: string
          exit_code?: number | null
          id?: string
          job_id: string
          metadata?: Json
          output_json?: Json
          reported_at?: string
          reported_by?: string
          status: string
          stderr_preview?: string | null
          stdout_preview?: string | null
          storage_path?: string | null
          target_id: string
          team_id: string
        }
        Update: {
          artifact_id?: string | null
          checksum_sha256?: string | null
          created_at?: string
          device_id?: string
          exit_code?: number | null
          id?: string
          job_id?: string
          metadata?: Json
          output_json?: Json
          reported_at?: string
          reported_by?: string
          status?: string
          stderr_preview?: string | null
          stdout_preview?: string | null
          storage_path?: string | null
          target_id?: string
          team_id?: string
        }
        Relationships: []
      }
      device_contacts: {
        Row: {
          created_at: string
          device_id: string | null
          display_name: string
          email: string | null
          id: string
          is_favorite: boolean
          notes: string | null
          owner_id: string
          phone: string | null
          remote_desk_id: string | null
          tags: string[]
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          display_name: string
          email?: string | null
          id?: string
          is_favorite?: boolean
          notes?: string | null
          owner_id: string
          phone?: string | null
          remote_desk_id?: string | null
          tags?: string[]
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          display_name?: string
          email?: string | null
          id?: string
          is_favorite?: boolean
          notes?: string | null
          owner_id?: string
          phone?: string | null
          remote_desk_id?: string | null
          tags?: string[]
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_contacts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_contacts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      device_diagnostic_snapshots: {
        Row: {
          collected_at: string
          collected_by_job_id: string | null
          created_at: string
          data: Json
          device_id: string
          id: string
          sensitivity_level: string
          snapshot_type: string
          status: string
          summary: string | null
          team_id: string
        }
        Insert: {
          collected_at?: string
          collected_by_job_id?: string | null
          created_at?: string
          data?: Json
          device_id: string
          id?: string
          sensitivity_level?: string
          snapshot_type: string
          status?: string
          summary?: string | null
          team_id: string
        }
        Update: {
          collected_at?: string
          collected_by_job_id?: string | null
          created_at?: string
          data?: Json
          device_id?: string
          id?: string
          sensitivity_level?: string
          snapshot_type?: string
          status?: string
          summary?: string | null
          team_id?: string
        }
        Relationships: []
      }
      device_group_members: {
        Row: {
          added_at: string
          added_by: string | null
          device_id: string
          group_id: string
          id: string
          membership_type: string
          team_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          device_id: string
          group_id: string
          id?: string
          membership_type?: string
          team_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          device_id?: string
          group_id?: string
          id?: string
          membership_type?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_group_members_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "device_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_group_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      device_groups: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dynamic_query: Json
          group_type: string
          id: string
          name: string
          team_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dynamic_query?: Json
          group_type?: string
          id?: string
          name: string
          team_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dynamic_query?: Json
          group_type?: string
          id?: string
          name?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_groups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      device_onboarding_invites: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          customer_user_id: string | null
          device_id: string | null
          device_name_hint: string | null
          display_code: string | null
          expires_at: string
          id: string
          invite_code_hash: string
          metadata: Json
          platform_hint: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          customer_user_id?: string | null
          device_id?: string | null
          device_name_hint?: string | null
          display_code?: string | null
          expires_at: string
          id?: string
          invite_code_hash: string
          metadata?: Json
          platform_hint?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          customer_user_id?: string | null
          device_id?: string | null
          device_name_hint?: string | null
          display_code?: string | null
          expires_at?: string
          id?: string
          invite_code_hash?: string
          metadata?: Json
          platform_hint?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_onboarding_invites_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_onboarding_invites_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "customer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_policy_snapshots: {
        Row: {
          created_at: string
          device_id: string
          effective_policy: Json
          generated_at: string
          generated_by: string | null
          id: string
          policy_hash: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          effective_policy?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          policy_hash?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          effective_policy?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          policy_hash?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_policy_snapshots_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_policy_snapshots_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      device_presence: {
        Row: {
          active_session_id: string | null
          active_user_id: string | null
          battery_percent: number | null
          client_version: string | null
          connection_quality: string
          cpu_load: number | null
          created_at: string
          device_id: string
          heartbeat_at: string | null
          id: string
          ip_address: unknown
          last_seen_at: string | null
          latency_ms: number | null
          memory_load: number | null
          metadata: Json
          network_type: string | null
          os_version: string | null
          packet_loss: number | null
          platform: string | null
          region: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          active_session_id?: string | null
          active_user_id?: string | null
          battery_percent?: number | null
          client_version?: string | null
          connection_quality?: string
          cpu_load?: number | null
          created_at?: string
          device_id: string
          heartbeat_at?: string | null
          id?: string
          ip_address?: unknown
          last_seen_at?: string | null
          latency_ms?: number | null
          memory_load?: number | null
          metadata?: Json
          network_type?: string | null
          os_version?: string | null
          packet_loss?: number | null
          platform?: string | null
          region?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          active_session_id?: string | null
          active_user_id?: string | null
          battery_percent?: number | null
          client_version?: string | null
          connection_quality?: string
          cpu_load?: number | null
          created_at?: string
          device_id?: string
          heartbeat_at?: string | null
          id?: string
          ip_address?: unknown
          last_seen_at?: string | null
          latency_ms?: number | null
          memory_load?: number | null
          metadata?: Json
          network_type?: string | null
          os_version?: string | null
          packet_loss?: number | null
          platform?: string | null
          region?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_presence_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: true
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_presence_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      device_presence_events: {
        Row: {
          created_at: string
          device_id: string
          event_type: string
          id: string
          metadata: Json
          new_status: string
          previous_status: string | null
          reason: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          event_type: string
          id?: string
          metadata?: Json
          new_status: string
          previous_status?: string | null
          reason?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          event_type?: string
          id?: string
          metadata?: Json
          new_status?: string
          previous_status?: string | null
          reason?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_presence_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_presence_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          client_version: string | null
          cpu: string | null
          created_at: string
          device_password_hash: string | null
          group_label: string | null
          id: string
          ip: unknown
          is_trusted: boolean
          last_seen: string | null
          name: string
          notes: string | null
          os: Database["public"]["Enums"]["device_os"]
          os_version: string | null
          owner_id: string
          password_updated_at: string | null
          ram: string | null
          remote_desk_id: string
          status: Database["public"]["Enums"]["device_status"]
          tags: string[]
          team_id: string
          unattended_access: boolean
        }
        Insert: {
          client_version?: string | null
          cpu?: string | null
          created_at?: string
          device_password_hash?: string | null
          group_label?: string | null
          id?: string
          ip?: unknown
          is_trusted?: boolean
          last_seen?: string | null
          name: string
          notes?: string | null
          os: Database["public"]["Enums"]["device_os"]
          os_version?: string | null
          owner_id: string
          password_updated_at?: string | null
          ram?: string | null
          remote_desk_id: string
          status?: Database["public"]["Enums"]["device_status"]
          tags?: string[]
          team_id: string
          unattended_access?: boolean
        }
        Update: {
          client_version?: string | null
          cpu?: string | null
          created_at?: string
          device_password_hash?: string | null
          group_label?: string | null
          id?: string
          ip?: unknown
          is_trusted?: boolean
          last_seen?: string | null
          name?: string
          notes?: string | null
          os?: Database["public"]["Enums"]["device_os"]
          os_version?: string | null
          owner_id?: string
          password_updated_at?: string | null
          ram?: string | null
          remote_desk_id?: string
          status?: Database["public"]["Enums"]["device_status"]
          tags?: string[]
          team_id?: string
          unattended_access?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "devices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_bundle_items: {
        Row: {
          added_by: string | null
          bundle_id: string
          checksum_sha256: string | null
          created_at: string
          id: string
          included: boolean
          item_category: string | null
          item_description: string | null
          item_title: string
          resource_id: string | null
          resource_type: string
          source_reference: Json
          source_table: string | null
          storage_path: string | null
          team_id: string
        }
        Insert: {
          added_by?: string | null
          bundle_id: string
          checksum_sha256?: string | null
          created_at?: string
          id?: string
          included?: boolean
          item_category?: string | null
          item_description?: string | null
          item_title: string
          resource_id?: string | null
          resource_type: string
          source_reference?: Json
          source_table?: string | null
          storage_path?: string | null
          team_id: string
        }
        Update: {
          added_by?: string | null
          bundle_id?: string
          checksum_sha256?: string | null
          created_at?: string
          id?: string
          included?: boolean
          item_category?: string | null
          item_description?: string | null
          item_title?: string
          resource_id?: string | null
          resource_type?: string
          source_reference?: Json
          source_table?: string | null
          storage_path?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "evidence_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_bundles: {
        Row: {
          bundle_type: string
          created_at: string
          created_by: string | null
          description: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          incident_id: string | null
          legal_hold_id: string | null
          manifest: Json
          sensitivity_level: string
          session_id: string | null
          status: string
          support_ticket_id: string | null
          team_id: string
          title: string
          updated_at: string
          vault_id: string | null
        }
        Insert: {
          bundle_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          incident_id?: string | null
          legal_hold_id?: string | null
          manifest?: Json
          sensitivity_level?: string
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id: string
          title: string
          updated_at?: string
          vault_id?: string | null
        }
        Update: {
          bundle_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          incident_id?: string | null
          legal_hold_id?: string | null
          manifest?: Json
          sensitivity_level?: string
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_bundles_legal_hold_id_fkey"
            columns: ["legal_hold_id"]
            isOneToOne: false
            referencedRelation: "legal_holds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_bundles_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "audit_export_vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_scorecard_items: {
        Row: {
          actual_value: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json
          metric_id: string | null
          narrative: string | null
          scorecard_id: string
          sort_order: number
          status: string
          target_value: number | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_value?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          metric_id?: string | null
          narrative?: string | null
          scorecard_id: string
          sort_order?: number
          status?: string
          target_value?: number | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_value?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          metric_id?: string | null
          narrative?: string | null
          scorecard_id?: string
          sort_order?: number
          status?: string
          target_value?: number | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_scorecard_items_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "bi_metric_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_scorecard_items_scorecard_id_fkey"
            columns: ["scorecard_id"]
            isOneToOne: false
            referencedRelation: "executive_scorecards"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_scorecards: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metric_summary: Json
          name: string
          owner_user_id: string | null
          period_end: string | null
          period_start: string | null
          recommendation_summary: Json
          risk_summary: Json
          scorecard_key: string
          scorecard_type: string
          status: string
          summary: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metric_summary?: Json
          name: string
          owner_user_id?: string | null
          period_end?: string | null
          period_start?: string | null
          recommendation_summary?: Json
          risk_summary?: Json
          scorecard_key: string
          scorecard_type?: string
          status?: string
          summary?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metric_summary?: Json
          name?: string
          owner_user_id?: string | null
          period_end?: string | null
          period_start?: string | null
          recommendation_summary?: Json
          risk_summary?: Json
          scorecard_key?: string
          scorecard_type?: string
          status?: string
          summary?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      expansion_opportunities: {
        Row: {
          closed_at: string | null
          confidence: string
          created_at: string
          created_by: string | null
          currency: string
          customer_account_id: string | null
          description: string | null
          estimated_value_cents: number | null
          id: string
          opportunity_type: string
          owner_user_id: string | null
          partner_client_team_id: string | null
          reason: Json
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          confidence?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_account_id?: string | null
          description?: string | null
          estimated_value_cents?: number | null
          id?: string
          opportunity_type?: string
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          reason?: Json
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          confidence?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_account_id?: string | null
          description?: string | null
          estimated_value_cents?: number | null
          id?: string
          opportunity_type?: string
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          reason?: Json
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_resource_links: {
        Row: {
          created_at: string
          created_by: string | null
          external_id: string | null
          external_type: string | null
          external_url: string | null
          id: string
          provider: string
          resource_id: string
          resource_type: string
          status: string | null
          team_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          external_type?: string | null
          external_url?: string | null
          id?: string
          provider: string
          resource_id: string
          resource_type: string
          status?: string | null
          team_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          external_type?: string | null
          external_url?: string | null
          id?: string
          provider?: string
          resource_id?: string
          resource_type?: string
          status?: string | null
          team_id?: string
          title?: string | null
        }
        Relationships: []
      }
      feature_readiness_map: {
        Row: {
          api_endpoints: string[]
          created_at: string
          data_tables: string[]
          docs_status: string
          feature_key: string
          feature_name: string
          id: string
          launch_project_id: string | null
          module_name: string
          notes: string | null
          owner_user_id: string | null
          qa_status: string
          route_path: string | null
          rpc_functions: string[]
          security_status: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          api_endpoints?: string[]
          created_at?: string
          data_tables?: string[]
          docs_status?: string
          feature_key: string
          feature_name: string
          id?: string
          launch_project_id?: string | null
          module_name: string
          notes?: string | null
          owner_user_id?: string | null
          qa_status?: string
          route_path?: string | null
          rpc_functions?: string[]
          security_status?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          api_endpoints?: string[]
          created_at?: string
          data_tables?: string[]
          docs_status?: string
          feature_key?: string
          feature_name?: string
          id?: string
          launch_project_id?: string | null
          module_name?: string
          notes?: string | null
          owner_user_id?: string | null
          qa_status?: string
          route_path?: string | null
          rpc_functions?: string[]
          security_status?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_job_attachments: {
        Row: {
          attachment_type: string
          created_at: string
          file_name: string
          id: string
          job_id: string
          mime_type: string | null
          size_bytes: number | null
          status: string
          storage_bucket: string | null
          storage_path: string | null
          team_id: string
          updated_at: string
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          attachment_type?: string
          created_at?: string
          file_name: string
          id?: string
          job_id: string
          mime_type?: string | null
          size_bytes?: number | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          team_id: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Update: {
          attachment_type?: string
          created_at?: string
          file_name?: string
          id?: string
          job_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          team_id?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: []
      }
      field_job_checklists: {
        Row: {
          checklist_type: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          id: string
          items: Json
          job_id: string | null
          status: string
          team_id: string
          template_key: string | null
          title: string
          updated_at: string
        }
        Insert: {
          checklist_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json
          job_id?: string | null
          status?: string
          team_id: string
          template_key?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          checklist_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json
          job_id?: string | null
          status?: string
          team_id?: string
          template_key?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_job_updates: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          job_id: string
          message: string | null
          metadata: Json
          mobile_installation_id: string | null
          new_status: string | null
          old_status: string | null
          source: string
          team_id: string
          title: string | null
          update_type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          job_id: string
          message?: string | null
          metadata?: Json
          mobile_installation_id?: string | null
          new_status?: string | null
          old_status?: string | null
          source?: string
          team_id: string
          title?: string | null
          update_type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          job_id?: string
          message?: string | null
          metadata?: Json
          mobile_installation_id?: string | null
          new_status?: string | null
          old_status?: string | null
          source?: string
          team_id?: string
          title?: string | null
          update_type?: string
        }
        Relationships: []
      }
      field_service_jobs: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assigned_to: string | null
          client_team_id: string | null
          completion_summary: string | null
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          customer_user_id: string | null
          description: string | null
          device_id: string | null
          id: string
          instructions: string | null
          job_number: string | null
          job_type: string
          location_label: string | null
          location_metadata: Json
          partner_id: string | null
          priority: string
          scheduled_end: string | null
          scheduled_start: string | null
          session_id: string | null
          status: string
          support_ticket_id: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_to?: string | null
          client_team_id?: string | null
          completion_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          customer_user_id?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          instructions?: string | null
          job_number?: string | null
          job_type?: string
          location_label?: string | null
          location_metadata?: Json
          partner_id?: string | null
          priority?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_to?: string | null
          client_team_id?: string | null
          completion_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          customer_user_id?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          instructions?: string | null
          job_number?: string | null
          job_type?: string
          location_label?: string | null
          location_metadata?: Json
          partner_id?: string | null
          priority?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_visit_logs: {
        Row: {
          checkin_at: string
          checkout_at: string | null
          created_at: string
          customer_account_id: string | null
          device_id: string | null
          id: string
          job_id: string | null
          latitude_rounded: number | null
          location_accuracy_meters: number | null
          location_label: string | null
          location_source: string
          longitude_rounded: number | null
          metadata: Json
          notes: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string | null
          visit_type: string
        }
        Insert: {
          checkin_at?: string
          checkout_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          device_id?: string | null
          id?: string
          job_id?: string | null
          latitude_rounded?: number | null
          location_accuracy_meters?: number | null
          location_label?: string | null
          location_source?: string
          longitude_rounded?: number | null
          metadata?: Json
          notes?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id?: string | null
          visit_type?: string
        }
        Update: {
          checkin_at?: string
          checkout_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          device_id?: string | null
          id?: string
          job_id?: string | null
          latitude_rounded?: number | null
          location_accuracy_meters?: number | null
          location_label?: string | null
          location_source?: string
          longitude_rounded?: number | null
          metadata?: Json
          notes?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
          visit_type?: string
        }
        Relationships: []
      }
      file_transfer_policies: {
        Row: {
          blocked_extensions: string[]
          direction: string
          enabled: boolean
          max_size_mb: number
          require_approval: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          blocked_extensions?: string[]
          direction?: string
          enabled?: boolean
          max_size_mb?: number
          require_approval?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          blocked_extensions?: string[]
          direction?: string
          enabled?: boolean
          max_size_mb?: number
          require_approval?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_transfer_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_approval_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          decided_at: string | null
          decision_note: string | null
          description: string | null
          expires_at: string | null
          id: string
          payload: Json
          rejected_by: string | null
          request_type: string
          requested_by: string | null
          resource_id: string | null
          resource_type: string | null
          status: string
          target_member_id: string | null
          target_user_id: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          payload?: Json
          rejected_by?: string | null
          request_type: string
          requested_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          target_member_id?: string | null
          target_user_id?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          payload?: Json
          rejected_by?: string | null
          request_type?: string
          requested_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          target_member_id?: string | null
          target_user_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_approval_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_experiment_assignments: {
        Row: {
          assigned_at: string
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          experiment_id: string
          id: string
          metadata: Json
          team_id: string
          user_id: string | null
          variant_key: string
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          experiment_id: string
          id?: string
          metadata?: Json
          team_id: string
          user_id?: string | null
          variant_key: string
        }
        Update: {
          assigned_at?: string
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          experiment_id?: string
          id?: string
          metadata?: Json
          team_id?: string
          user_id?: string | null
          variant_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_experiment_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "growth_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_experiments: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string | null
          experiment_key: string
          experiment_type: string
          hypothesis: string | null
          id: string
          name: string
          owner_user_id: string | null
          result_summary: Json
          start_at: string | null
          status: string
          target_metric: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          experiment_key: string
          experiment_type?: string
          hypothesis?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          result_summary?: Json
          start_at?: string | null
          status?: string
          target_metric?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          experiment_key?: string
          experiment_type?: string
          hypothesis?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          result_summary?: Json
          start_at?: string | null
          status?: string
          target_metric?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      growth_funnel_runs: {
        Row: {
          calculated_at: string
          conversion_rate: number | null
          created_at: string
          dropoff_summary: Json
          funnel_id: string
          id: string
          output: Json
          period_end: string
          period_start: string
          status: string
          step_counts: Json
          team_id: string
          total_converted: number
          total_entered: number
        }
        Insert: {
          calculated_at?: string
          conversion_rate?: number | null
          created_at?: string
          dropoff_summary?: Json
          funnel_id: string
          id?: string
          output?: Json
          period_end: string
          period_start: string
          status?: string
          step_counts?: Json
          team_id: string
          total_converted?: number
          total_entered?: number
        }
        Update: {
          calculated_at?: string
          conversion_rate?: number | null
          created_at?: string
          dropoff_summary?: Json
          funnel_id?: string
          id?: string
          output?: Json
          period_end?: string
          period_start?: string
          status?: string
          step_counts?: Json
          team_id?: string
          total_converted?: number
          total_entered?: number
        }
        Relationships: [
          {
            foreignKeyName: "growth_funnel_runs_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "growth_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_funnel_steps: {
        Row: {
          created_at: string
          event_name: string
          funnel_id: string
          id: string
          metadata: Json
          name: string
          required: boolean
          step_key: string
          step_order: number
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_name: string
          funnel_id: string
          id?: string
          metadata?: Json
          name: string
          required?: boolean
          step_key: string
          step_order: number
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_name?: string
          funnel_id?: string
          id?: string
          metadata?: Json
          name?: string
          required?: boolean
          step_key?: string
          step_order?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_funnel_steps_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "growth_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_funnels: {
        Row: {
          conversion_window_days: number
          created_at: string
          created_by: string | null
          description: string | null
          funnel_key: string
          funnel_type: string
          id: string
          name: string
          owner_user_id: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          conversion_window_days?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          funnel_key: string
          funnel_type?: string
          id?: string
          name: string
          owner_user_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          conversion_window_days?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          funnel_key?: string
          funnel_type?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_check_results: {
        Row: {
          check_id: string
          checked_at: string
          created_at: string
          details: Json
          id: string
          measured_value: number | null
          message: string | null
          service_id: string | null
          severity: string
          status: string
          team_id: string
          threshold_value: number | null
        }
        Insert: {
          check_id: string
          checked_at?: string
          created_at?: string
          details?: Json
          id?: string
          measured_value?: number | null
          message?: string | null
          service_id?: string | null
          severity?: string
          status: string
          team_id: string
          threshold_value?: number | null
        }
        Update: {
          check_id?: string
          checked_at?: string
          created_at?: string
          details?: Json
          id?: string
          measured_value?: number | null
          message?: string | null
          service_id?: string | null
          severity?: string
          status?: string
          team_id?: string
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_check_results_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "health_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      health_checks: {
        Row: {
          check_type: string
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          last_checked_at: string | null
          last_status: string
          name: string
          next_check_at: string | null
          schedule_config: Json
          service_id: string
          severity: string
          team_id: string
          threshold_config: Json
          updated_at: string
        }
        Insert: {
          check_type: string
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          last_checked_at?: string | null
          last_status?: string
          name: string
          next_check_at?: string | null
          schedule_config?: Json
          service_id: string
          severity?: string
          team_id: string
          threshold_config?: Json
          updated_at?: string
        }
        Update: {
          check_type?: string
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          last_checked_at?: string | null
          last_status?: string
          name?: string
          next_check_at?: string | null
          schedule_config?: Json
          service_id?: string
          severity?: string
          team_id?: string
          threshold_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_checks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "observability_services"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_access_policies: {
        Row: {
          created_at: string
          created_by: string | null
          enforcement_mode: string
          id: string
          name: string
          policy_type: string
          priority: number
          rules: Json
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enforcement_mode?: string
          id?: string
          name: string
          policy_type: string
          priority?: number
          rules?: Json
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enforcement_mode?: string
          id?: string
          name?: string
          policy_type?: string
          priority?: number
          rules?: Json
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_access_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_admin_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_admin_reports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_claim_mappings: {
        Row: {
          active: boolean
          claim_name: string
          claim_path: string | null
          created_at: string
          created_by: string | null
          id: string
          identity_provider_id: string
          required: boolean
          target_field: string
          team_id: string
          transform_config: Json
          transform_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          claim_name: string
          claim_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          identity_provider_id: string
          required?: boolean
          target_field: string
          team_id: string
          transform_config?: Json
          transform_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          claim_name?: string
          claim_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          identity_provider_id?: string
          required?: boolean
          target_field?: string
          team_id?: string
          transform_config?: Json
          transform_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_claim_mappings_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_claim_mappings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_conflicts: {
        Row: {
          conflict_type: string
          created_at: string
          description: string | null
          id: string
          identity_provider_id: string | null
          payload: Json
          recommended_action: string | null
          resolved_at: string | null
          resolved_by: string | null
          scim_user_id: string | null
          status: string
          team_id: string
          team_member_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conflict_type: string
          created_at?: string
          description?: string | null
          id?: string
          identity_provider_id?: string | null
          payload?: Json
          recommended_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scim_user_id?: string | null
          status?: string
          team_id: string
          team_member_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conflict_type?: string
          created_at?: string
          description?: string | null
          id?: string
          identity_provider_id?: string | null
          payload?: Json
          recommended_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scim_user_id?: string | null
          status?: string
          team_id?: string
          team_member_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_conflicts_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_conflicts_scim_user_id_fkey"
            columns: ["scim_user_id"]
            isOneToOne: false
            referencedRelation: "scim_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_conflicts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_group_mappings: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          device_group_id: string | null
          external_group_id: string | null
          external_group_name: string
          id: string
          identity_provider_id: string | null
          mapping_type: string
          priority: number
          remote_permissions: string[]
          remote_role_key: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          device_group_id?: string | null
          external_group_id?: string | null
          external_group_name: string
          id?: string
          identity_provider_id?: string | null
          mapping_type?: string
          priority?: number
          remote_permissions?: string[]
          remote_role_key?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          device_group_id?: string | null
          external_group_id?: string | null
          external_group_name?: string
          id?: string
          identity_provider_id?: string | null
          mapping_type?: string
          priority?: number
          remote_permissions?: string[]
          remote_role_key?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_group_mappings_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_group_mappings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_lifecycle_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          identity_provider_id: string | null
          payload: Json
          scim_user_id: string | null
          severity: string
          source: string
          team_id: string
          team_member_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          identity_provider_id?: string | null
          payload?: Json
          scim_user_id?: string | null
          severity?: string
          source?: string
          team_id: string
          team_member_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          identity_provider_id?: string | null
          payload?: Json
          scim_user_id?: string | null
          severity?: string
          source?: string
          team_id?: string
          team_member_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_lifecycle_events_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_lifecycle_events_scim_user_id_fkey"
            columns: ["scim_user_id"]
            isOneToOne: false
            referencedRelation: "scim_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_lifecycle_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_provider_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          identity_provider_id: string | null
          status: string
          team_id: string
          updated_at: string
          verification_method: string
          verification_token_hash: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          identity_provider_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
          verification_method?: string
          verification_token_hash?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          identity_provider_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          verification_method?: string
          verification_token_hash?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_provider_domains_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_provider_domains_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_providers: {
        Row: {
          activated_at: string | null
          certificate_fingerprint: string | null
          certificate_reference: string | null
          client_id: string | null
          client_secret_reference: string | null
          config: Json
          created_at: string
          created_by: string | null
          domain_hint: string | null
          entity_id: string | null
          id: string
          issuer: string | null
          last_error_message: string | null
          last_tested_at: string | null
          login_mode: string
          metadata_url: string | null
          name: string
          provider_key: string
          provider_type: string
          redirect_uri: string | null
          sso_url: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          certificate_fingerprint?: string | null
          certificate_reference?: string | null
          client_id?: string | null
          client_secret_reference?: string | null
          config?: Json
          created_at?: string
          created_by?: string | null
          domain_hint?: string | null
          entity_id?: string | null
          id?: string
          issuer?: string | null
          last_error_message?: string | null
          last_tested_at?: string | null
          login_mode?: string
          metadata_url?: string | null
          name: string
          provider_key: string
          provider_type: string
          redirect_uri?: string | null
          sso_url?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          certificate_fingerprint?: string | null
          certificate_reference?: string | null
          client_id?: string | null
          client_secret_reference?: string | null
          config?: Json
          created_at?: string
          created_by?: string | null
          domain_hint?: string | null
          entity_id?: string | null
          id?: string
          issuer?: string | null
          last_error_message?: string | null
          last_tested_at?: string | null
          login_mode?: string
          metadata_url?: string | null
          name?: string
          provider_key?: string
          provider_type?: string
          redirect_uri?: string | null
          sso_url?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_providers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_sync_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          identity_provider_id: string | null
          input: Json
          job_type: string
          output: Json
          records_created: number
          records_failed: number
          records_processed: number
          records_updated: number
          started_at: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          identity_provider_id?: string | null
          input?: Json
          job_type: string
          output?: Json
          records_created?: number
          records_failed?: number
          records_processed?: number
          records_updated?: number
          started_at?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          identity_provider_id?: string | null
          input?: Json
          job_type?: string
          output?: Json
          records_created?: number
          records_failed?: number
          records_processed?: number
          records_updated?: number
          started_at?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_sync_jobs_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_sync_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_action_items: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          incident_id: string
          priority: string
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          incident_id: string
          priority?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          incident_id?: string
          priority?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_action_items_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_postmortems: {
        Row: {
          created_at: string
          created_by: string | null
          detection_summary: string | null
          id: string
          impact_summary: string | null
          incident_id: string
          prevention_actions: Json
          published_at: string | null
          resolution_summary: string | null
          root_cause: string | null
          status: string
          summary: string | null
          team_id: string
          updated_at: string
          updated_by: string | null
          what_went_well: string | null
          what_went_wrong: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          detection_summary?: string | null
          id?: string
          impact_summary?: string | null
          incident_id: string
          prevention_actions?: Json
          published_at?: string | null
          resolution_summary?: string | null
          root_cause?: string | null
          status?: string
          summary?: string | null
          team_id: string
          updated_at?: string
          updated_by?: string | null
          what_went_well?: string | null
          what_went_wrong?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          detection_summary?: string | null
          id?: string
          impact_summary?: string | null
          incident_id?: string
          prevention_actions?: Json
          published_at?: string | null
          resolution_summary?: string | null
          root_cause?: string | null
          status?: string
          summary?: string | null
          team_id?: string
          updated_at?: string
          updated_by?: string | null
          what_went_well?: string | null
          what_went_wrong?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_postmortems_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: true
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_service_impacts: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          impact_status: string
          incident_id: string
          notes: string | null
          service_id: string
          started_at: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          impact_status?: string
          incident_id: string
          notes?: string | null
          service_id: string
          started_at?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          impact_status?: string
          incident_id?: string
          notes?: string | null
          service_id?: string
          started_at?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_service_impacts_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_service_impacts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "observability_services"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_timeline_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          incident_id: string
          metadata: Json
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          incident_id: string
          metadata?: Json
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          incident_id?: string
          metadata?: Json
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          affected_services: string[]
          closed_at: string | null
          commander_id: string | null
          created_at: string
          created_by: string | null
          customer_visible: boolean
          description: string | null
          detected_at: string | null
          id: string
          impact: string
          incident_number: string | null
          metadata: Json
          resolution_summary: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          started_at: string
          status: string
          status_page_message: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          affected_services?: string[]
          closed_at?: string | null
          commander_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_visible?: boolean
          description?: string | null
          detected_at?: string | null
          id?: string
          impact?: string
          incident_number?: string | null
          metadata?: Json
          resolution_summary?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          started_at?: string
          status?: string
          status_page_message?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          affected_services?: string[]
          closed_at?: string | null
          commander_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_visible?: boolean
          description?: string | null
          detected_at?: string | null
          id?: string
          impact?: string
          incident_number?: string | null
          metadata?: Json
          resolution_summary?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          started_at?: string
          status?: string
          status_page_message?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_action_runs: {
        Row: {
          action_key: string
          attempt_count: number
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          mapping_id: string | null
          max_attempts: number
          output: Json
          scheduled_for: string | null
          started_at: string | null
          status: string
          team_id: string
          team_integration_id: string
          updated_at: string
        }
        Insert: {
          action_key: string
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          mapping_id?: string | null
          max_attempts?: number
          output?: Json
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          team_integration_id: string
          updated_at?: string
        }
        Update: {
          action_key?: string
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          mapping_id?: string | null
          max_attempts?: number
          output?: Json
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          team_integration_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_action_runs_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "integration_event_mappings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_action_runs_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          severity: string
          team_id: string
          team_integration_id: string | null
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          severity?: string
          team_id: string
          team_integration_id?: string | null
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          severity?: string
          team_id?: string
          team_integration_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_audit_events_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_catalog: {
        Row: {
          auth_type: string
          category: string
          config_schema: Json
          created_at: string
          description: string | null
          docs_url: string | null
          id: string
          integration_type: string
          is_featured: boolean
          key: string
          logo_url: string | null
          name: string
          provider: string
          required_scopes: string[]
          status: string
          supported_actions: string[]
          supported_events: string[]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          auth_type?: string
          category?: string
          config_schema?: Json
          created_at?: string
          description?: string | null
          docs_url?: string | null
          id?: string
          integration_type?: string
          is_featured?: boolean
          key: string
          logo_url?: string | null
          name: string
          provider: string
          required_scopes?: string[]
          status?: string
          supported_actions?: string[]
          supported_events?: string[]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          auth_type?: string
          category?: string
          config_schema?: Json
          created_at?: string
          description?: string | null
          docs_url?: string | null
          id?: string
          integration_type?: string
          is_featured?: boolean
          key?: string
          logo_url?: string | null
          name?: string
          provider?: string
          required_scopes?: string[]
          status?: string
          supported_actions?: string[]
          supported_events?: string[]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          auth_type: string
          connection_name: string
          created_at: string
          created_by: string | null
          credential_reference: string | null
          external_account_id: string | null
          external_account_name: string | null
          external_workspace_id: string | null
          external_workspace_name: string | null
          id: string
          last_validated_at: string | null
          scopes: string[]
          status: string
          team_id: string
          team_integration_id: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          auth_type: string
          connection_name: string
          created_at?: string
          created_by?: string | null
          credential_reference?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          external_workspace_id?: string | null
          external_workspace_name?: string | null
          id?: string
          last_validated_at?: string | null
          scopes?: string[]
          status?: string
          team_id: string
          team_integration_id: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          auth_type?: string
          connection_name?: string
          created_at?: string
          created_by?: string | null
          credential_reference?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          external_workspace_id?: string | null
          external_workspace_name?: string | null
          id?: string
          last_validated_at?: string | null
          scopes?: string[]
          status?: string
          team_id?: string
          team_integration_id?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_event_mappings: {
        Row: {
          created_at: string
          created_by: string | null
          destination_config: Json
          enabled: boolean
          filters: Json
          id: string
          name: string
          source_event: string
          target_action: string
          team_id: string
          team_integration_id: string
          transform_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_config?: Json
          enabled?: boolean
          filters?: Json
          id?: string
          name: string
          source_event: string
          target_action: string
          team_id: string
          team_integration_id: string
          transform_config?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_config?: Json
          enabled?: boolean
          filters?: Json
          id?: string
          name?: string
          source_event?: string
          target_action?: string
          team_id?: string
          team_integration_id?: string
          transform_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_event_mappings_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_field_mappings: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          external_field: string
          id: string
          remote_field: string
          resource_type: string
          team_id: string
          team_integration_id: string
          transform_config: Json
          transform_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          external_field: string
          id?: string
          remote_field: string
          resource_type: string
          team_id: string
          team_integration_id: string
          transform_config?: Json
          transform_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          external_field?: string
          id?: string
          remote_field?: string
          resource_type?: string
          team_id?: string
          team_integration_id?: string
          transform_config?: Json
          transform_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_field_mappings_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_oauth_states: {
        Row: {
          catalog_id: string
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          metadata: Json
          redirect_uri: string | null
          requested_by: string | null
          state_hash: string
          status: string
          team_id: string
        }
        Insert: {
          catalog_id: string
          completed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          metadata?: Json
          redirect_uri?: string | null
          requested_by?: string | null
          state_hash: string
          status?: string
          team_id: string
        }
        Update: {
          catalog_id?: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          metadata?: Json
          redirect_uri?: string | null
          requested_by?: string | null
          state_hash?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_oauth_states_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "integration_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          cursor: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          records_created: number
          records_failed: number
          records_processed: number
          records_updated: number
          resource_type: string | null
          started_at: string | null
          status: string
          sync_type: string
          team_id: string
          team_integration_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cursor?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          records_created?: number
          records_failed?: number
          records_processed?: number
          records_updated?: number
          resource_type?: string | null
          started_at?: string | null
          status?: string
          sync_type: string
          team_id: string
          team_integration_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cursor?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          records_created?: number
          records_failed?: number
          records_processed?: number
          records_updated?: number
          resource_type?: string | null
          started_at?: string | null
          status?: string
          sync_type?: string
          team_id?: string
          team_integration_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_jobs_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_templates: {
        Row: {
          category: string
          config: Json
          created_at: string
          description: string | null
          id: string
          integration_keys: string[]
          is_featured: boolean
          key: string
          name: string
          source_event: string | null
          target_action: string | null
        }
        Insert: {
          category: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          integration_keys?: string[]
          is_featured?: boolean
          key: string
          name: string
          source_event?: string | null
          target_action?: string | null
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          integration_keys?: string[]
          is_featured?: boolean
          key?: string
          name?: string
          source_event?: string | null
          target_action?: string | null
        }
        Relationships: []
      }
      integration_webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          inbox_id: string | null
          payload: Json
          processed_at: string | null
          provider: string | null
          received_at: string
          signature_valid: boolean | null
          status: string
          team_id: string
          team_integration_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          inbox_id?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: string | null
          received_at?: string
          signature_valid?: boolean | null
          status?: string
          team_id: string
          team_integration_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          inbox_id?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: string | null
          received_at?: string
          signature_valid?: boolean | null
          status?: string
          team_id?: string
          team_integration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_webhook_events_inbox_id_fkey"
            columns: ["inbox_id"]
            isOneToOne: false
            referencedRelation: "integration_webhook_inboxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_webhook_events_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_webhook_inboxes: {
        Row: {
          allowed_events: string[]
          created_at: string
          created_by: string | null
          endpoint_key: string
          id: string
          last_received_at: string | null
          secret_hash: string | null
          status: string
          team_id: string
          team_integration_id: string
          updated_at: string
        }
        Insert: {
          allowed_events?: string[]
          created_at?: string
          created_by?: string | null
          endpoint_key: string
          id?: string
          last_received_at?: string | null
          secret_hash?: string | null
          status?: string
          team_id: string
          team_integration_id: string
          updated_at?: string
        }
        Update: {
          allowed_events?: string[]
          created_at?: string
          created_by?: string | null
          endpoint_key?: string
          id?: string
          last_received_at?: string | null
          secret_hash?: string | null
          status?: string
          team_id?: string
          team_integration_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_webhook_inboxes_team_integration_id_fkey"
            columns: ["team_integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          currency: string
          id: string
          issued_at: string
          number: string
          pdf_url: string | null
          status: string
          team_id: string
        }
        Insert: {
          amount_cents: number
          currency?: string
          id?: string
          issued_at?: string
          number: string
          pdf_url?: string | null
          status?: string
          team_id: string
        }
        Update: {
          amount_cents?: number
          currency?: string
          id?: string
          issued_at?: string
          number?: string
          pdf_url?: string | null
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_article_links: {
        Row: {
          article_id: string
          created_at: string
          created_by: string | null
          id: string
          relationship_type: string
          resource_id: string | null
          resource_type: string
          team_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          relationship_type?: string
          resource_id?: string | null
          resource_type: string
          team_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          relationship_type?: string
          resource_id?: string | null
          resource_type?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_links_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_article_reviews: {
        Row: {
          article_id: string
          checklist: Json
          comments: string | null
          created_at: string
          created_by: string | null
          id: string
          review_type: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          article_id: string
          checklist?: Json
          comments?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          review_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          checklist?: Json
          comments?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          review_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_reviews_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_article_tags: {
        Row: {
          article_id: string
          created_at: string
          id: string
          tag_id: string
          team_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          tag_id: string
          team_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          tag_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "knowledge_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_article_versions: {
        Row: {
          approved_by: string | null
          article_id: string
          change_summary: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          status: string
          summary: string | null
          team_id: string
          title: string
          version_number: number
        }
        Insert: {
          approved_by?: string | null
          article_id: string
          change_summary?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          summary?: string | null
          team_id: string
          title: string
          version_number: number
        }
        Update: {
          approved_by?: string | null
          article_id?: string
          change_summary?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          summary?: string | null
          team_id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          article_key: string
          article_type: string
          collection_id: string | null
          content: string | null
          content_format: string
          created_at: string
          created_by: string | null
          id: string
          language: string
          metadata: Json
          next_review_due_at: string | null
          owner_user_id: string | null
          published_at: string | null
          published_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sensitivity_level: string
          slug: string
          source_resource_id: string | null
          source_resource_type: string | null
          source_type: string
          space_id: string
          status: string
          summary: string | null
          team_id: string
          title: string
          updated_at: string
          updated_by: string | null
          version_number: number
          visibility: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          article_key: string
          article_type?: string
          collection_id?: string | null
          content?: string | null
          content_format?: string
          created_at?: string
          created_by?: string | null
          id?: string
          language?: string
          metadata?: Json
          next_review_due_at?: string | null
          owner_user_id?: string | null
          published_at?: string | null
          published_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_level?: string
          slug: string
          source_resource_id?: string | null
          source_resource_type?: string | null
          source_type?: string
          space_id: string
          status?: string
          summary?: string | null
          team_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version_number?: number
          visibility?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          article_key?: string
          article_type?: string
          collection_id?: string | null
          content?: string | null
          content_format?: string
          created_at?: string
          created_by?: string | null
          id?: string
          language?: string
          metadata?: Json
          next_review_due_at?: string | null
          owner_user_id?: string | null
          published_at?: string | null
          published_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_level?: string
          slug?: string
          source_resource_id?: string | null
          source_resource_type?: string | null
          source_type?: string
          space_id?: string
          status?: string
          summary?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version_number?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "knowledge_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_articles_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "knowledge_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_audit_events: {
        Row: {
          actor_id: string | null
          article_id: string | null
          course_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          article_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          article_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      knowledge_collections: {
        Row: {
          collection_key: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_collection_id: string | null
          sort_order: number
          space_id: string
          status: string
          team_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          collection_key: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_collection_id?: string | null
          sort_order?: number
          space_id: string
          status?: string
          team_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          collection_key?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_collection_id?: string | null
          sort_order?: number
          space_id?: string
          status?: string
          team_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_collections_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "knowledge_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_feedback: {
        Row: {
          article_id: string
          created_at: string
          customer_user_id: string | null
          feedback: string | null
          id: string
          partner_member_id: string | null
          rating: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string
          status: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          customer_user_id?: string | null
          feedback?: string | null
          id?: string
          partner_member_id?: string | null
          rating?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          customer_user_id?: string | null
          feedback?: string | null
          id?: string
          partner_member_id?: string | null
          rating?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_import_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          input: Json
          output: Json
          records_created: number
          records_updated: number
          source_type: string
          space_id: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          input?: Json
          output?: Json
          records_created?: number
          records_updated?: number
          source_type: string
          space_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          input?: Json
          output?: Json
          records_created?: number
          records_updated?: number
          source_type?: string
          space_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_import_jobs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "knowledge_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_index_jobs: {
        Row: {
          article_id: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          job_type: string
          output: Json
          space_id: string | null
          started_at: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          job_type: string
          output?: Json
          space_id?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          job_type?: string
          output?: Json
          space_id?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_search_queries: {
        Row: {
          clicked_article_id: string | null
          created_at: string
          created_ticket_id: string | null
          customer_user_id: string | null
          id: string
          metadata: Json
          query: string
          result_count: number
          source: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          clicked_article_id?: string | null
          created_at?: string
          created_ticket_id?: string | null
          customer_user_id?: string | null
          id?: string
          metadata?: Json
          query: string
          result_count?: number
          source?: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          clicked_article_id?: string | null
          created_at?: string
          created_ticket_id?: string | null
          customer_user_id?: string | null
          id?: string
          metadata?: Json
          query?: string
          result_count?: number
          source?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_spaces: {
        Row: {
          brand_profile_id: string | null
          created_at: string
          created_by: string | null
          default_language: string
          description: string | null
          id: string
          name: string
          owner_user_id: string | null
          partner_id: string | null
          space_key: string
          space_type: string
          status: string
          team_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          brand_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          default_language?: string
          description?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          partner_id?: string | null
          space_key: string
          space_type?: string
          status?: string
          team_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          brand_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          default_language?: string
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          partner_id?: string | null
          space_key?: string
          space_type?: string
          status?: string
          team_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      knowledge_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          tag_key: string
          team_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tag_key: string
          team_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tag_key?: string
          team_id?: string
        }
        Relationships: []
      }
      launch_activity_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          launch_project_id: string | null
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          launch_project_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          launch_project_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
        }
        Relationships: []
      }
      launch_approval_records: {
        Row: {
          approval_type: string
          approved_at: string | null
          approver_user_id: string | null
          created_at: string
          created_by: string | null
          decision_note: string | null
          id: string
          launch_project_id: string
          risk_acceptance: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          approval_type: string
          approved_at?: string | null
          approver_user_id?: string | null
          created_at?: string
          created_by?: string | null
          decision_note?: string | null
          id?: string
          launch_project_id: string
          risk_acceptance?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          approval_type?: string
          approved_at?: string | null
          approver_user_id?: string | null
          created_at?: string
          created_by?: string | null
          decision_note?: string | null
          id?: string
          launch_project_id?: string
          risk_acceptance?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      launch_blockers: {
        Row: {
          accepted_risk_at: string | null
          accepted_risk_by: string | null
          blocker_type: string
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          launch_project_id: string
          metadata: Json
          owner_user_id: string | null
          readiness_check_id: string | null
          resolution_summary: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          accepted_risk_at?: string | null
          accepted_risk_by?: string | null
          blocker_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          launch_project_id: string
          metadata?: Json
          owner_user_id?: string | null
          readiness_check_id?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          accepted_risk_at?: string | null
          accepted_risk_by?: string | null
          blocker_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          launch_project_id?: string
          metadata?: Json
          owner_user_id?: string | null
          readiness_check_id?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      launch_projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          go_live_approved_at: string | null
          go_live_approved_by: string | null
          id: string
          launch_key: string
          launch_type: string
          launched_at: string | null
          name: string
          owner_user_id: string | null
          readiness_score: number
          risk_level: string
          status: string
          target_launch_at: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          go_live_approved_at?: string | null
          go_live_approved_by?: string | null
          id?: string
          launch_key: string
          launch_type?: string
          launched_at?: string | null
          name: string
          owner_user_id?: string | null
          readiness_score?: number
          risk_level?: string
          status?: string
          target_launch_at?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          go_live_approved_at?: string | null
          go_live_approved_by?: string | null
          id?: string
          launch_key?: string
          launch_type?: string
          launched_at?: string | null
          name?: string
          owner_user_id?: string | null
          readiness_score?: number
          risk_level?: string
          status?: string
          target_launch_at?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      launch_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          launch_project_id: string | null
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          launch_project_id?: string | null
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          launch_project_id?: string | null
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_hold_resources: {
        Row: {
          added_at: string
          added_by: string | null
          created_at: string
          hold_status: string
          id: string
          legal_hold_id: string
          matched_by: string
          metadata: Json
          released_at: string | null
          released_by: string | null
          resource_id: string
          resource_title: string | null
          resource_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          created_at?: string
          hold_status?: string
          id?: string
          legal_hold_id: string
          matched_by?: string
          metadata?: Json
          released_at?: string | null
          released_by?: string | null
          resource_id: string
          resource_title?: string | null
          resource_type: string
          team_id: string
          updated_at?: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          created_at?: string
          hold_status?: string
          id?: string
          legal_hold_id?: string
          matched_by?: string
          metadata?: Json
          released_at?: string | null
          released_by?: string | null
          resource_id?: string
          resource_title?: string | null
          resource_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_hold_resources_legal_hold_id_fkey"
            columns: ["legal_hold_id"]
            isOneToOne: false
            referencedRelation: "legal_holds"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_holds: {
        Row: {
          case_number: string | null
          created_at: string
          created_by: string | null
          custodian_user_ids: string[]
          customer_account_ids: string[]
          description: string | null
          device_ids: string[]
          hold_type: string
          id: string
          incident_ids: string[]
          reason: string | null
          release_at: string | null
          release_reason: string | null
          released_by: string | null
          scope: Json
          session_ids: string[]
          start_at: string
          status: string
          support_ticket_ids: string[]
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          case_number?: string | null
          created_at?: string
          created_by?: string | null
          custodian_user_ids?: string[]
          customer_account_ids?: string[]
          description?: string | null
          device_ids?: string[]
          hold_type?: string
          id?: string
          incident_ids?: string[]
          reason?: string | null
          release_at?: string | null
          release_reason?: string | null
          released_by?: string | null
          scope?: Json
          session_ids?: string[]
          start_at?: string
          status?: string
          support_ticket_ids?: string[]
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          case_number?: string | null
          created_at?: string
          created_by?: string | null
          custodian_user_ids?: string[]
          customer_account_ids?: string[]
          description?: string | null
          device_ids?: string[]
          hold_type?: string
          id?: string
          incident_ids?: string[]
          reason?: string | null
          release_at?: string | null
          release_reason?: string | null
          released_by?: string | null
          scope?: Json
          session_ids?: string[]
          start_at?: string
          status?: string
          support_ticket_ids?: string[]
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      license_usage_snapshots: {
        Row: {
          active_users: number | null
          assigned_seats: number | null
          captured_at: string
          compliance_status: string
          created_at: string
          id: string
          inactive_users: number | null
          license_id: string
          metadata: Json
          overage_count: number
          software_product_id: string
          source: string
          team_id: string
          total_seats: number | null
          underused_count: number
        }
        Insert: {
          active_users?: number | null
          assigned_seats?: number | null
          captured_at?: string
          compliance_status?: string
          created_at?: string
          id?: string
          inactive_users?: number | null
          license_id: string
          metadata?: Json
          overage_count?: number
          software_product_id: string
          source?: string
          team_id: string
          total_seats?: number | null
          underused_count?: number
        }
        Update: {
          active_users?: number | null
          assigned_seats?: number | null
          captured_at?: string
          compliance_status?: string
          created_at?: string
          id?: string
          inactive_users?: number | null
          license_id?: string
          metadata?: Json
          overage_count?: number
          software_product_id?: string
          source?: string
          team_id?: string
          total_seats?: number | null
          underused_count?: number
        }
        Relationships: []
      }
      marketplace_analytics_snapshots: {
        Row: {
          active_installations: number
          average_rating: number | null
          calculated_at: string
          created_at: string
          estimated_revenue_cents: number
          id: string
          installs: number
          listing_id: string | null
          output: Json
          period_end: string
          period_start: string
          publisher_id: string | null
          purchases: number
          snapshot_type: string
          team_id: string | null
          uninstalls: number
          usage_count: number | null
          views: number
        }
        Insert: {
          active_installations?: number
          average_rating?: number | null
          calculated_at?: string
          created_at?: string
          estimated_revenue_cents?: number
          id?: string
          installs?: number
          listing_id?: string | null
          output?: Json
          period_end: string
          period_start: string
          publisher_id?: string | null
          purchases?: number
          snapshot_type?: string
          team_id?: string | null
          uninstalls?: number
          usage_count?: number | null
          views?: number
        }
        Update: {
          active_installations?: number
          average_rating?: number | null
          calculated_at?: string
          created_at?: string
          estimated_revenue_cents?: number
          id?: string
          installs?: number
          listing_id?: string | null
          output?: Json
          period_end?: string
          period_start?: string
          publisher_id?: string | null
          purchases?: number
          snapshot_type?: string
          team_id?: string | null
          uninstalls?: number
          usage_count?: number | null
          views?: number
        }
        Relationships: []
      }
      marketplace_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          listing_id: string | null
          metadata: Json
          publisher_id: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string | null
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          listing_id?: string | null
          metadata?: Json
          publisher_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string | null
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          listing_id?: string | null
          metadata?: Json
          publisher_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string | null
          title?: string
        }
        Relationships: []
      }
      marketplace_collection_items: {
        Row: {
          badge: string | null
          collection_id: string
          created_at: string
          id: string
          listing_id: string
          sort_order: number
        }
        Insert: {
          badge?: string | null
          collection_id: string
          created_at?: string
          id?: string
          listing_id: string
          sort_order?: number
        }
        Update: {
          badge?: string | null
          collection_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "marketplace_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_collection_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_collections: {
        Row: {
          collection_key: string
          collection_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          sort_order: number
          status: string
          team_id: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          collection_key: string
          collection_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          status?: string
          team_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          collection_key?: string
          collection_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: string
          team_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      marketplace_entitlement_grants: {
        Row: {
          created_at: string
          entitlement_key: string
          expires_at: string | null
          id: string
          installation_id: string | null
          listing_id: string
          metadata: Json
          quantity: number | null
          starts_at: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entitlement_key: string
          expires_at?: string | null
          id?: string
          installation_id?: string | null
          listing_id: string
          metadata?: Json
          quantity?: number | null
          starts_at?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entitlement_key?: string
          expires_at?: string | null
          id?: string
          installation_id?: string | null
          listing_id?: string
          metadata?: Json
          quantity?: number | null
          starts_at?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_entitlement_grants_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "marketplace_installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_entitlement_grants_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_installation_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          installation_id: string
          listing_id: string
          metadata: Json
          source: string
          team_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          installation_id: string
          listing_id: string
          metadata?: Json
          source?: string
          team_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          installation_id?: string
          listing_id?: string
          metadata?: Json
          source?: string
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_installation_events_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "marketplace_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_installations: {
        Row: {
          billing_status: string
          configuration: Json
          created_at: string
          external_install_reference: string | null
          id: string
          install_mode: string
          installed_at: string
          installed_by: string | null
          last_used_at: string | null
          listing_id: string
          listing_version_id: string | null
          metadata: Json
          publisher_id: string | null
          status: string
          subscription_id: string | null
          team_id: string
          trial_ends_at: string | null
          uninstalled_at: string | null
          updated_at: string
        }
        Insert: {
          billing_status?: string
          configuration?: Json
          created_at?: string
          external_install_reference?: string | null
          id?: string
          install_mode?: string
          installed_at?: string
          installed_by?: string | null
          last_used_at?: string | null
          listing_id: string
          listing_version_id?: string | null
          metadata?: Json
          publisher_id?: string | null
          status?: string
          subscription_id?: string | null
          team_id: string
          trial_ends_at?: string | null
          uninstalled_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_status?: string
          configuration?: Json
          created_at?: string
          external_install_reference?: string | null
          id?: string
          install_mode?: string
          installed_at?: string
          installed_by?: string | null
          last_used_at?: string | null
          listing_id?: string
          listing_version_id?: string | null
          metadata?: Json
          publisher_id?: string | null
          status?: string
          subscription_id?: string | null
          team_id?: string
          trial_ends_at?: string | null
          uninstalled_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_installations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listing_assets: {
        Row: {
          asset_type: string
          created_at: string
          created_by: string | null
          external_url: string | null
          id: string
          listing_id: string
          status: string
          storage_bucket: string | null
          storage_path: string | null
          title: string | null
          visibility: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          listing_id: string
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          title?: string | null
          visibility?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          listing_id?: string
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          title?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listing_assets_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listing_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          artifact_reference: Json
          changelog: Json
          compatibility: Json
          created_at: string
          created_by: string | null
          id: string
          listing_id: string
          release_notes: string | null
          status: string
          team_id: string | null
          version: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          artifact_reference?: Json
          changelog?: Json
          compatibility?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          listing_id: string
          release_notes?: string | null
          status?: string
          team_id?: string | null
          version: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          artifact_reference?: Json
          changelog?: Json
          compatibility?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          listing_id?: string
          release_notes?: string | null
          status?: string
          team_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listing_versions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          base_price_cents: number
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          documentation_url: string | null
          icon_url: string | null
          id: string
          install_mode: string
          listing_key: string
          listing_type: string
          metadata: Json
          name: string
          pricing_model: string
          privacy_policy_url: string | null
          published_at: string | null
          publisher_id: string
          requires_admin_approval: boolean
          requires_billing_provider: boolean
          requires_security_review: boolean
          screenshots: Json
          short_description: string | null
          status: string
          support_policy: string | null
          tags: string[]
          team_id: string | null
          terms_url: string | null
          trial_days: number | null
          updated_at: string
          updated_by: string | null
          version: string
          visibility: string
        }
        Insert: {
          base_price_cents?: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          install_mode?: string
          listing_key: string
          listing_type?: string
          metadata?: Json
          name: string
          pricing_model?: string
          privacy_policy_url?: string | null
          published_at?: string | null
          publisher_id: string
          requires_admin_approval?: boolean
          requires_billing_provider?: boolean
          requires_security_review?: boolean
          screenshots?: Json
          short_description?: string | null
          status?: string
          support_policy?: string | null
          tags?: string[]
          team_id?: string | null
          terms_url?: string | null
          trial_days?: number | null
          updated_at?: string
          updated_by?: string | null
          version?: string
          visibility?: string
        }
        Update: {
          base_price_cents?: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          install_mode?: string
          listing_key?: string
          listing_type?: string
          metadata?: Json
          name?: string
          pricing_model?: string
          privacy_policy_url?: string | null
          published_at?: string | null
          publisher_id?: string
          requires_admin_approval?: boolean
          requires_billing_provider?: boolean
          requires_security_review?: boolean
          screenshots?: Json
          short_description?: string | null
          status?: string
          support_policy?: string | null
          tags?: string[]
          team_id?: string | null
          terms_url?: string | null
          trial_days?: number | null
          updated_at?: string
          updated_by?: string | null
          version?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "marketplace_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_payout_batches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_number: string | null
          created_at: string
          currency: string
          gross_amount_cents: number
          id: string
          metadata: Json
          notes: string | null
          paid_at: string | null
          payout_amount_cents: number
          payout_provider_reference: string | null
          period_end: string
          period_start: string
          platform_fee_cents: number
          publisher_id: string
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string | null
          created_at?: string
          currency?: string
          gross_amount_cents?: number
          id?: string
          metadata?: Json
          notes?: string | null
          paid_at?: string | null
          payout_amount_cents?: number
          payout_provider_reference?: string | null
          period_end: string
          period_start: string
          platform_fee_cents?: number
          publisher_id: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string | null
          created_at?: string
          currency?: string
          gross_amount_cents?: number
          id?: string
          metadata?: Json
          notes?: string | null
          paid_at?: string | null
          payout_amount_cents?: number
          payout_provider_reference?: string | null
          period_end?: string
          period_start?: string
          platform_fee_cents?: number
          publisher_id?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_payout_batches_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "marketplace_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_payout_items: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          ledger_id: string
          listing_id: string | null
          notes: string | null
          payout_batch_id: string
          status: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          ledger_id: string
          listing_id?: string | null
          notes?: string | null
          payout_batch_id: string
          status?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          ledger_id?: string
          listing_id?: string | null
          notes?: string | null
          payout_batch_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_payout_items_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "marketplace_revenue_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payout_items_payout_batch_id_fkey"
            columns: ["payout_batch_id"]
            isOneToOne: false
            referencedRelation: "marketplace_payout_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_pricing_plans: {
        Row: {
          billing_interval: string
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          included_units: number | null
          listing_id: string
          metadata: Json
          name: string
          overage_price_cents: number | null
          plan_key: string
          price_cents: number
          pricing_model: string
          status: string
          unit_name: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          included_units?: number | null
          listing_id: string
          metadata?: Json
          name: string
          overage_price_cents?: number | null
          plan_key: string
          price_cents?: number
          pricing_model?: string
          status?: string
          unit_name?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          included_units?: number | null
          listing_id?: string
          metadata?: Json
          name?: string
          overage_price_cents?: number | null
          plan_key?: string
          price_cents?: number
          pricing_model?: string
          status?: string
          unit_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_pricing_plans_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_publishers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billing_contact_email: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          partner_organization_id: string | null
          payout_status: string
          publisher_key: string
          publisher_type: string
          reviewed_by: string | null
          risk_level: string
          security_contact_email: string | null
          status: string
          support_email: string | null
          support_url: string | null
          team_id: string | null
          updated_at: string
          verification_status: string
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billing_contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          partner_organization_id?: string | null
          payout_status?: string
          publisher_key: string
          publisher_type?: string
          reviewed_by?: string | null
          risk_level?: string
          security_contact_email?: string | null
          status?: string
          support_email?: string | null
          support_url?: string | null
          team_id?: string | null
          updated_at?: string
          verification_status?: string
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billing_contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          partner_organization_id?: string | null
          payout_status?: string
          publisher_key?: string
          publisher_type?: string
          reviewed_by?: string | null
          risk_level?: string
          security_contact_email?: string | null
          status?: string
          support_email?: string | null
          support_url?: string | null
          team_id?: string | null
          updated_at?: string
          verification_status?: string
          website_url?: string | null
        }
        Relationships: []
      }
      marketplace_purchases: {
        Row: {
          amount_cents: number
          approved_at: string | null
          approved_by: string | null
          billing_provider: string
          created_at: string
          currency: string
          error_message: string | null
          id: string
          installation_id: string | null
          listing_id: string
          metadata: Json
          pricing_plan_id: string | null
          provider_checkout_reference: string | null
          purchase_number: string | null
          quantity: number
          requested_by: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          approved_at?: string | null
          approved_by?: string | null
          billing_provider?: string
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          installation_id?: string | null
          listing_id: string
          metadata?: Json
          pricing_plan_id?: string | null
          provider_checkout_reference?: string | null
          purchase_number?: string | null
          quantity?: number
          requested_by?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          approved_at?: string | null
          approved_by?: string | null
          billing_provider?: string
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          installation_id?: string | null
          listing_id?: string
          metadata?: Json
          pricing_plan_id?: string | null
          provider_checkout_reference?: string | null
          purchase_number?: string | null
          quantity?: number
          requested_by?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          publisher_id: string | null
          report_type: string
          requested_by: string | null
          status: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          publisher_id?: string | null
          report_type: string
          requested_by?: string | null
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          publisher_id?: string | null
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_revenue_ledger: {
        Row: {
          created_at: string
          currency: string
          gross_amount_cents: number
          id: string
          ledger_type: string
          listing_id: string | null
          metadata: Json
          platform_fee_cents: number
          provider_reference: string | null
          publisher_id: string | null
          publisher_share_cents: number
          purchase_id: string | null
          revenue_period_end: string | null
          revenue_period_start: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          gross_amount_cents?: number
          id?: string
          ledger_type?: string
          listing_id?: string | null
          metadata?: Json
          platform_fee_cents?: number
          provider_reference?: string | null
          publisher_id?: string | null
          publisher_share_cents?: number
          purchase_id?: string | null
          revenue_period_end?: string | null
          revenue_period_start?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          gross_amount_cents?: number
          id?: string
          ledger_type?: string
          listing_id?: string | null
          metadata?: Json
          platform_fee_cents?: number
          provider_reference?: string | null
          publisher_id?: string | null
          publisher_share_cents?: number
          purchase_id?: string | null
          revenue_period_end?: string | null
          revenue_period_start?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_revenue_ledger_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_revenue_ledger_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "marketplace_publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_revenue_ledger_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "marketplace_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_review_requests: {
        Row: {
          checklist: Json
          comments: string | null
          created_at: string
          created_by: string | null
          id: string
          listing_id: string | null
          publisher_id: string | null
          review_type: string
          reviewed_at: string | null
          reviewer_id: string | null
          risk_findings: Json
          status: string
          updated_at: string
        }
        Insert: {
          checklist?: Json
          comments?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          listing_id?: string | null
          publisher_id?: string | null
          review_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_findings?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          checklist?: Json
          comments?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          listing_id?: string | null
          publisher_id?: string | null
          review_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_findings?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_review_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_review_requests_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "marketplace_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          installation_id: string | null
          listing_id: string
          publisher_response: string | null
          rating: number
          responded_at: string | null
          status: string
          team_id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          listing_id: string
          publisher_response?: string | null
          rating: number
          responded_at?: string | null
          status?: string
          team_id: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          listing_id?: string
          publisher_response?: string | null
          rating?: number
          responded_at?: string | null
          status?: string
          team_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_security_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          data_access_summary: Json
          expires_at: string | null
          findings: Json
          id: string
          listing_id: string | null
          permissions_requested: string[]
          publisher_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          assessment_type?: string
          created_at?: string
          data_access_summary?: Json
          expires_at?: string | null
          findings?: Json
          id?: string
          listing_id?: string | null
          permissions_requested?: string[]
          publisher_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          created_at?: string
          data_access_summary?: Json
          expires_at?: string | null
          findings?: Json
          id?: string
          listing_id?: string | null
          permissions_requested?: string[]
          publisher_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_security_assessments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_security_assessments_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "marketplace_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_usage_records: {
        Row: {
          created_at: string
          id: string
          installation_id: string
          listing_id: string
          metadata: Json
          occurred_at: string
          quantity: number
          source: string
          team_id: string
          unit: string | null
          usage_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          installation_id: string
          listing_id: string
          metadata?: Json
          occurred_at?: string
          quantity?: number
          source?: string
          team_id: string
          unit?: string | null
          usage_key: string
        }
        Update: {
          created_at?: string
          id?: string
          installation_id?: string
          listing_id?: string
          metadata?: Json
          occurred_at?: string
          quantity?: number
          source?: string
          team_id?: string
          unit?: string | null
          usage_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_usage_records_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "marketplace_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      member_permission_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          denied_permissions: string[]
          granted_permissions: string[]
          id: string
          member_id: string
          reason: string | null
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          denied_permissions?: string[]
          granted_permissions?: string[]
          id?: string
          member_id: string
          reason?: string | null
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          denied_permissions?: string[]
          granted_permissions?: string[]
          id?: string
          member_id?: string
          reason?: string | null
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_permission_overrides_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      member_risk_scores: {
        Row: {
          broad_api_key_count: number
          created_at: string
          failed_security_events_30d: number
          id: string
          last_calculated_at: string
          last_login_at: string | null
          member_id: string
          mfa_enabled: boolean
          reasons: string[]
          risk_level: string
          risk_score: number
          stale_session_count: number
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broad_api_key_count?: number
          created_at?: string
          failed_security_events_30d?: number
          id?: string
          last_calculated_at?: string
          last_login_at?: string | null
          member_id: string
          mfa_enabled?: boolean
          reasons?: string[]
          risk_level?: string
          risk_score?: number
          stale_session_count?: number
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broad_api_key_count?: number
          created_at?: string
          failed_security_events_30d?: number
          id?: string
          last_calculated_at?: string
          last_login_at?: string | null
          member_id?: string
          mfa_enabled?: boolean
          reasons?: string[]
          risk_level?: string
          risk_score?: number
          stale_session_count?: number
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_risk_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_verification_records: {
        Row: {
          checked_at: string
          checked_by: string | null
          created_at: string
          details: Json
          error_message: string | null
          id: string
          launch_project_id: string | null
          migration_name: string | null
          rpc_name: string | null
          status: string
          table_name: string | null
          team_id: string
          verification_type: string
        }
        Insert: {
          checked_at?: string
          checked_by?: string | null
          created_at?: string
          details?: Json
          error_message?: string | null
          id?: string
          launch_project_id?: string | null
          migration_name?: string | null
          rpc_name?: string | null
          status?: string
          table_name?: string | null
          team_id: string
          verification_type?: string
        }
        Update: {
          checked_at?: string
          checked_by?: string | null
          created_at?: string
          details?: Json
          error_message?: string | null
          id?: string
          launch_project_id?: string | null
          migration_name?: string | null
          rpc_name?: string | null
          status?: string
          table_name?: string | null
          team_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      mobile_access_assignments: {
        Row: {
          access_profile_id: string
          assigned_by: string | null
          assignment_type: string
          created_at: string
          expires_at: string | null
          id: string
          partner_member_id: string | null
          status: string
          team_id: string
          team_member_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_profile_id: string
          assigned_by?: string | null
          assignment_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          partner_member_id?: string | null
          status?: string
          team_id: string
          team_member_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_profile_id?: string
          assigned_by?: string | null
          assignment_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          partner_member_id?: string | null
          status?: string
          team_id?: string
          team_member_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_access_profiles: {
        Row: {
          allow_customer_contact_access: boolean | null
          allow_file_attachment_upload: boolean | null
          allow_location_checkins: boolean | null
          allow_mobile_session_approval: boolean | null
          allow_offline_mode: boolean | null
          allow_push_notifications: boolean | null
          allowed_actions: string[]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          max_offline_items: number | null
          name: string
          profile_type: string
          require_mfa: boolean | null
          require_trusted_device: boolean | null
          restricted_actions: string[]
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          allow_customer_contact_access?: boolean | null
          allow_file_attachment_upload?: boolean | null
          allow_location_checkins?: boolean | null
          allow_mobile_session_approval?: boolean | null
          allow_offline_mode?: boolean | null
          allow_push_notifications?: boolean | null
          allowed_actions?: string[]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_offline_items?: number | null
          name: string
          profile_type?: string
          require_mfa?: boolean | null
          require_trusted_device?: boolean | null
          restricted_actions?: string[]
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          allow_customer_contact_access?: boolean | null
          allow_file_attachment_upload?: boolean | null
          allow_location_checkins?: boolean | null
          allow_mobile_session_approval?: boolean | null
          allow_offline_mode?: boolean | null
          allow_push_notifications?: boolean | null
          allowed_actions?: string[]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_offline_items?: number | null
          name?: string
          profile_type?: string
          require_mfa?: boolean | null
          require_trusted_device?: boolean | null
          restricted_actions?: string[]
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mobile_app_installations: {
        Row: {
          app_version: string | null
          build_number: string | null
          created_at: string
          device_model: string | null
          enrolled_by: string | null
          id: string
          installation_key: string | null
          last_seen_at: string | null
          last_sync_at: string | null
          metadata: Json
          mobile_device_id: string | null
          os_version: string | null
          platform: string
          push_enabled: boolean | null
          push_provider: string | null
          push_token_reference: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          build_number?: string | null
          created_at?: string
          device_model?: string | null
          enrolled_by?: string | null
          id?: string
          installation_key?: string | null
          last_seen_at?: string | null
          last_sync_at?: string | null
          metadata?: Json
          mobile_device_id?: string | null
          os_version?: string | null
          platform?: string
          push_enabled?: boolean | null
          push_provider?: string | null
          push_token_reference?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          build_number?: string | null
          created_at?: string
          device_model?: string | null
          enrolled_by?: string | null
          id?: string
          installation_key?: string | null
          last_seen_at?: string | null
          last_sync_at?: string | null
          metadata?: Json
          mobile_device_id?: string | null
          os_version?: string | null
          platform?: string
          push_enabled?: boolean | null
          push_provider?: string | null
          push_token_reference?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_audit_events: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          installation_id: string | null
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          installation_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          installation_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_deep_links: {
        Row: {
          created_at: string
          created_by: string | null
          deep_link_url: string | null
          expires_at: string | null
          id: string
          link_type: string
          resource_id: string | null
          resource_type: string | null
          status: string
          team_id: string
          web_fallback_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deep_link_url?: string | null
          expires_at?: string | null
          id?: string
          link_type: string
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          team_id: string
          web_fallback_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deep_link_url?: string | null
          expires_at?: string | null
          id?: string
          link_type?: string
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          team_id?: string
          web_fallback_url?: string | null
        }
        Relationships: []
      }
      mobile_devices: {
        Row: {
          app_version: string | null
          created_at: string
          device_label: string
          id: string
          last_ip: string | null
          last_seen_at: string | null
          pairing_code: string | null
          pairing_expires_at: string | null
          platform: string
          push_token: string | null
          revoked_at: string | null
          team_id: string | null
          trusted: boolean
          trusted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_label: string
          id?: string
          last_ip?: string | null
          last_seen_at?: string | null
          pairing_code?: string | null
          pairing_expires_at?: string | null
          platform: string
          push_token?: string | null
          revoked_at?: string | null
          team_id?: string | null
          trusted?: boolean
          trusted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_label?: string
          id?: string
          last_ip?: string | null
          last_seen_at?: string | null
          pairing_code?: string | null
          pairing_expires_at?: string | null
          platform?: string
          push_token?: string | null
          revoked_at?: string | null
          team_id?: string | null
          trusted?: boolean
          trusted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_devices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_enrollment_tokens: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          created_by: string | null
          display_code: string | null
          email: string | null
          expires_at: string
          id: string
          metadata: Json
          purpose: string
          status: string
          team_id: string
          token_hash: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          created_by?: string | null
          display_code?: string | null
          email?: string | null
          expires_at: string
          id?: string
          metadata?: Json
          purpose?: string
          status?: string
          team_id: string
          token_hash: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          created_by?: string | null
          display_code?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          metadata?: Json
          purpose?: string
          status?: string
          team_id?: string
          token_hash?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_offline_queue_items: {
        Row: {
          conflict_reason: string | null
          created_at: string
          id: string
          installation_id: string | null
          item_type: string
          local_created_at: string | null
          payload: Json
          queue_key: string
          resolution: Json
          server_synced_at: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conflict_reason?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          item_type: string
          local_created_at?: string | null
          payload?: Json
          queue_key: string
          resolution?: Json
          server_synced_at?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conflict_reason?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          item_type?: string
          local_created_at?: string | null
          payload?: Json
          queue_key?: string
          resolution?: Json
          server_synced_at?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_push_channels: {
        Row: {
          channel_type: string
          created_at: string
          id: string
          installation_id: string
          last_error_message: string | null
          last_test_at: string | null
          preferences: Json
          provider: string
          status: string
          team_id: string
          token_reference: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel_type?: string
          created_at?: string
          id?: string
          installation_id: string
          last_error_message?: string | null
          last_test_at?: string | null
          preferences?: Json
          provider?: string
          status?: string
          team_id: string
          token_reference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel_type?: string
          created_at?: string
          id?: string
          installation_id?: string
          last_error_message?: string | null
          last_test_at?: string | null
          preferences?: Json
          provider?: string
          status?: string
          team_id?: string
          token_reference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_push_messages: {
        Row: {
          body: string
          channel_id: string | null
          created_at: string
          created_by: string | null
          deep_link: string | null
          error_message: string | null
          id: string
          installation_id: string | null
          message_type: string
          notification_id: string | null
          payload: Json
          provider_message_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body: string
          channel_id?: string | null
          created_at?: string
          created_by?: string | null
          deep_link?: string | null
          error_message?: string | null
          id?: string
          installation_id?: string | null
          message_type: string
          notification_id?: string | null
          payload?: Json
          provider_message_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          channel_id?: string | null
          created_at?: string
          created_by?: string | null
          deep_link?: string | null
          error_message?: string | null
          id?: string
          installation_id?: string | null
          message_type?: string
          notification_id?: string | null
          payload?: Json
          provider_message_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_rules: {
        Row: {
          channels: Json
          conditions: Json
          created_at: string
          created_by: string | null
          enabled: boolean
          event_type: string
          id: string
          name: string
          severity: string
          team_id: string
          updated_at: string
        }
        Insert: {
          channels?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          event_type: string
          id?: string
          name: string
          severity?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          channels?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          event_type?: string
          id?: string
          name?: string
          severity?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_rules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          archived_at: string | null
          created_at: string
          device_id: string | null
          id: string
          message: string
          metadata: Json
          read_at: string | null
          rule_id: string | null
          session_id: string | null
          severity: string
          team_id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          archived_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          message: string
          metadata?: Json
          read_at?: string | null
          rule_id?: string | null
          session_id?: string | null
          severity?: string
          team_id: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          archived_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          message?: string
          metadata?: Json
          read_at?: string | null
          rule_id?: string | null
          session_id?: string | null
          severity?: string
          team_id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      observability_dashboards: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filters: Json
          id: string
          layout: Json
          name: string
          team_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json
          id?: string
          layout?: Json
          name: string
          team_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json
          id?: string
          layout?: Json
          name?: string
          team_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      observability_metrics: {
        Row: {
          captured_at: string
          created_at: string
          dimensions: Json
          id: string
          metric_key: string
          metric_name: string
          metric_type: string
          service_id: string | null
          source: string
          team_id: string
          unit: string | null
          value: number
        }
        Insert: {
          captured_at?: string
          created_at?: string
          dimensions?: Json
          id?: string
          metric_key: string
          metric_name: string
          metric_type?: string
          service_id?: string | null
          source?: string
          team_id: string
          unit?: string | null
          value?: number
        }
        Update: {
          captured_at?: string
          created_at?: string
          dimensions?: Json
          id?: string
          metric_key?: string
          metric_name?: string
          metric_type?: string
          service_id?: string | null
          source?: string
          team_id?: string
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      observability_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          finished_at: string | null
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          started_at: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          finished_at?: string | null
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          finished_at?: string | null
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      observability_services: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          docs_url: string | null
          id: string
          metadata: Json
          name: string
          owner_team: string | null
          owner_user_id: string | null
          runbook_id: string | null
          service_key: string
          service_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          docs_url?: string | null
          id?: string
          metadata?: Json
          name: string
          owner_team?: string | null
          owner_user_id?: string | null
          runbook_id?: string | null
          service_key: string
          service_type?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          docs_url?: string | null
          id?: string
          metadata?: Json
          name?: string
          owner_team?: string | null
          owner_user_id?: string | null
          runbook_id?: string | null
          service_key?: string
          service_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_audit_events: {
        Row: {
          actor_id: string | null
          client_team_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          partner_id: string
          resource_id: string | null
          resource_type: string | null
          severity: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          client_team_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          partner_id: string
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          title: string
        }
        Update: {
          actor_id?: string | null
          client_team_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          partner_id?: string
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_audit_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_brand_profiles: {
        Row: {
          accent_color: string | null
          activated_at: string | null
          app_title: string | null
          brand_name: string
          created_at: string
          created_by: string | null
          custom_css: Json
          dashboard_footer_text: string | null
          favicon_url: string | null
          hide_remotedesk_branding: boolean
          id: string
          logo_url: string | null
          name: string
          partner_id: string
          portal_welcome_message: string | null
          primary_color: string | null
          privacy_url: string | null
          status: string
          support_email: string | null
          support_phone: string | null
          terms_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          activated_at?: string | null
          app_title?: string | null
          brand_name: string
          created_at?: string
          created_by?: string | null
          custom_css?: Json
          dashboard_footer_text?: string | null
          favicon_url?: string | null
          hide_remotedesk_branding?: boolean
          id?: string
          logo_url?: string | null
          name: string
          partner_id: string
          portal_welcome_message?: string | null
          primary_color?: string | null
          privacy_url?: string | null
          status?: string
          support_email?: string | null
          support_phone?: string | null
          terms_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          activated_at?: string | null
          app_title?: string | null
          brand_name?: string
          created_at?: string
          created_by?: string | null
          custom_css?: Json
          dashboard_footer_text?: string | null
          favicon_url?: string | null
          hide_remotedesk_branding?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          partner_id?: string
          portal_welcome_message?: string | null
          primary_color?: string | null
          privacy_url?: string | null
          status?: string
          support_email?: string | null
          support_phone?: string | null
          terms_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_brand_profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_client_brand_assignments: {
        Row: {
          apply_to_customer_portal: boolean
          apply_to_dashboard: boolean
          apply_to_download_page: boolean
          apply_to_email_templates_placeholder: boolean
          assigned_by: string | null
          brand_profile_id: string
          client_team_id: string
          created_at: string
          domain_id: string | null
          id: string
          partner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          apply_to_customer_portal?: boolean
          apply_to_dashboard?: boolean
          apply_to_download_page?: boolean
          apply_to_email_templates_placeholder?: boolean
          assigned_by?: string | null
          brand_profile_id: string
          client_team_id: string
          created_at?: string
          domain_id?: string | null
          id?: string
          partner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          apply_to_customer_portal?: boolean
          apply_to_dashboard?: boolean
          apply_to_download_page?: boolean
          apply_to_email_templates_placeholder?: boolean
          assigned_by?: string | null
          brand_profile_id?: string
          client_team_id?: string
          created_at?: string
          domain_id?: string | null
          id?: string
          partner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_client_brand_assignments_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "partner_brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_client_brand_assignments_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "partner_custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_client_brand_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_client_tenants: {
        Row: {
          approved_by: string | null
          billing_managed_by_partner: boolean
          client_display_name: string | null
          client_team_id: string
          contract_reference: string | null
          created_at: string
          created_by: string | null
          delegated_access_enabled: boolean
          end_date: string | null
          external_customer_id: string | null
          id: string
          partner_id: string
          relationship_type: string
          start_date: string | null
          status: string
          support_managed_by_partner: boolean
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          billing_managed_by_partner?: boolean
          client_display_name?: string | null
          client_team_id: string
          contract_reference?: string | null
          created_at?: string
          created_by?: string | null
          delegated_access_enabled?: boolean
          end_date?: string | null
          external_customer_id?: string | null
          id?: string
          partner_id: string
          relationship_type?: string
          start_date?: string | null
          status?: string
          support_managed_by_partner?: boolean
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          billing_managed_by_partner?: boolean
          client_display_name?: string | null
          client_team_id?: string
          contract_reference?: string | null
          created_at?: string
          created_by?: string | null
          delegated_access_enabled?: boolean
          end_date?: string | null
          external_customer_id?: string | null
          id?: string
          partner_id?: string
          relationship_type?: string
          start_date?: string | null
          status?: string
          support_managed_by_partner?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_client_tenants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_commission_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          calculated_at: string
          client_team_id: string | null
          commission_cents: number
          commission_rule_id: string | null
          created_at: string
          currency: string
          id: string
          invoice_reference: string | null
          metadata: Json
          partner_id: string
          payout_reference: string | null
          period_end: string
          period_start: string
          revenue_cents: number
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string
          client_team_id?: string | null
          commission_cents?: number
          commission_rule_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_reference?: string | null
          metadata?: Json
          partner_id: string
          payout_reference?: string | null
          period_end: string
          period_start: string
          revenue_cents?: number
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string
          client_team_id?: string | null
          commission_cents?: number
          commission_rule_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_reference?: string | null
          metadata?: Json
          partner_id?: string
          payout_reference?: string | null
          period_end?: string
          period_start?: string
          revenue_cents?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_commission_records_commission_rule_id_fkey"
            columns: ["commission_rule_id"]
            isOneToOne: false
            referencedRelation: "partner_commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commission_records_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_commission_rules: {
        Row: {
          applies_to_package_keys: string[]
          applies_to_plan_keys: string[]
          created_at: string
          created_by: string | null
          currency: string
          effective_at: string
          expires_at: string | null
          fixed_amount_cents: number | null
          id: string
          max_revenue_cents: number | null
          min_revenue_cents: number | null
          name: string
          partner_id: string
          percentage: number | null
          rule_type: string
          status: string
          updated_at: string
        }
        Insert: {
          applies_to_package_keys?: string[]
          applies_to_plan_keys?: string[]
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_at?: string
          expires_at?: string | null
          fixed_amount_cents?: number | null
          id?: string
          max_revenue_cents?: number | null
          min_revenue_cents?: number | null
          name: string
          partner_id: string
          percentage?: number | null
          rule_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          applies_to_package_keys?: string[]
          applies_to_plan_keys?: string[]
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_at?: string
          expires_at?: string | null
          fixed_amount_cents?: number | null
          id?: string
          max_revenue_cents?: number | null
          min_revenue_cents?: number | null
          name?: string
          partner_id?: string
          percentage?: number | null
          rule_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_commission_rules_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_custom_domains: {
        Row: {
          activated_at: string | null
          brand_profile_id: string | null
          certificate_status: string
          cname_target: string | null
          created_at: string
          created_by: string | null
          domain: string
          domain_type: string
          error_message: string | null
          id: string
          last_checked_at: string | null
          partner_id: string
          ssl_provider_reference: string | null
          status: string
          updated_at: string
          verification_method: string
          verification_token_hash: string | null
        }
        Insert: {
          activated_at?: string | null
          brand_profile_id?: string | null
          certificate_status?: string
          cname_target?: string | null
          created_at?: string
          created_by?: string | null
          domain: string
          domain_type?: string
          error_message?: string | null
          id?: string
          last_checked_at?: string | null
          partner_id: string
          ssl_provider_reference?: string | null
          status?: string
          updated_at?: string
          verification_method?: string
          verification_token_hash?: string | null
        }
        Update: {
          activated_at?: string | null
          brand_profile_id?: string | null
          certificate_status?: string
          cname_target?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string
          domain_type?: string
          error_message?: string | null
          id?: string
          last_checked_at?: string | null
          partner_id?: string
          ssl_provider_reference?: string | null
          status?: string
          updated_at?: string
          verification_method?: string
          verification_token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_custom_domains_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "partner_brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_custom_domains_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_delegated_access_grants: {
        Row: {
          access_scope: string
          client_team_id: string
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          last_used_at: string | null
          metadata: Json
          partner_id: string
          partner_member_id: string | null
          permissions: string[]
          reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_scope: string
          client_team_id: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json
          partner_id: string
          partner_member_id?: string | null
          permissions?: string[]
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_scope?: string
          client_team_id?: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json
          partner_id?: string
          partner_member_id?: string | null
          permissions?: string[]
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_delegated_access_grants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_delegated_access_grants_partner_member_id_fkey"
            columns: ["partner_member_id"]
            isOneToOne: false
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          partner_id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          partner_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          partner_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_members_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_onboarding_checklists: {
        Row: {
          assigned_to: string | null
          checklist: Json
          client_team_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_at: string | null
          id: string
          partner_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          checklist?: Json
          client_team_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          partner_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          checklist?: Json
          client_team_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          partner_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_onboarding_checklists_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          country_code: string | null
          created_at: string
          created_by: string | null
          default_currency: string
          id: string
          legal_name: string | null
          metadata: Json
          name: string
          partner_key: string
          partner_type: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          status: string
          support_email: string | null
          support_phone: string | null
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          default_currency?: string
          id?: string
          legal_name?: string | null
          metadata?: Json
          name: string
          partner_key: string
          partner_type?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          status?: string
          support_email?: string | null
          support_phone?: string | null
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          default_currency?: string
          id?: string
          legal_name?: string | null
          metadata?: Json
          name?: string
          partner_key?: string
          partner_type?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          status?: string
          support_email?: string | null
          support_phone?: string | null
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      partner_packages: {
        Row: {
          base_plan_id: string | null
          billing_interval: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          included_entitlements: Json
          name: string
          package_key: string
          partner_id: string
          price_cents: number | null
          public_visible: boolean
          status: string
          support_level: string
          updated_at: string
        }
        Insert: {
          base_plan_id?: string | null
          billing_interval?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          included_entitlements?: Json
          name: string
          package_key: string
          partner_id: string
          price_cents?: number | null
          public_visible?: boolean
          status?: string
          support_level?: string
          updated_at?: string
        }
        Update: {
          base_plan_id?: string | null
          billing_interval?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          included_entitlements?: Json
          name?: string
          package_key?: string
          partner_id?: string
          price_cents?: number | null
          public_visible?: boolean
          status?: string
          support_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_packages_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_plan_assignments: {
        Row: {
          approved_by: string | null
          assigned_by: string | null
          billing_mode: string
          client_team_id: string
          created_at: string
          custom_entitlements: Json
          device_limit: number | null
          effective_at: string | null
          expires_at: string | null
          id: string
          partner_id: string
          partner_package_key: string | null
          plan_id: string | null
          seat_limit: number | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          assigned_by?: string | null
          billing_mode?: string
          client_team_id: string
          created_at?: string
          custom_entitlements?: Json
          device_limit?: number | null
          effective_at?: string | null
          expires_at?: string | null
          id?: string
          partner_id: string
          partner_package_key?: string | null
          plan_id?: string | null
          seat_limit?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          assigned_by?: string | null
          billing_mode?: string
          client_team_id?: string
          created_at?: string
          custom_entitlements?: Json
          device_limit?: number | null
          effective_at?: string | null
          expires_at?: string | null
          id?: string
          partner_id?: string
          partner_package_key?: string | null
          plan_id?: string | null
          seat_limit?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_plan_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          partner_id: string
          report_type: string
          requested_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          partner_id: string
          report_type: string
          requested_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          partner_id?: string
          report_type?: string
          requested_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_reports_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_support_assignments: {
        Row: {
          assigned_partner_member_id: string | null
          assignment_reason: string | null
          client_team_id: string
          created_at: string
          created_by: string | null
          id: string
          partner_id: string
          partner_queue_id: string | null
          status: string
          support_ticket_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_partner_member_id?: string | null
          assignment_reason?: string | null
          client_team_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          partner_id: string
          partner_queue_id?: string | null
          status?: string
          support_ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_partner_member_id?: string | null
          assignment_reason?: string | null
          client_team_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          partner_id?: string
          partner_queue_id?: string | null
          status?: string
          support_ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_support_assignments_assigned_partner_member_id_fkey"
            columns: ["assigned_partner_member_id"]
            isOneToOne: false
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_support_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_support_assignments_partner_queue_id_fkey"
            columns: ["partner_queue_id"]
            isOneToOne: false
            referencedRelation: "partner_support_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_support_queues: {
        Row: {
          created_at: string
          created_by: string | null
          default_priority: string
          description: string | null
          id: string
          name: string
          partner_id: string
          queue_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_priority?: string
          description?: string | null
          id?: string
          name: string
          partner_id: string
          queue_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_priority?: string
          description?: string | null
          id?: string
          name?: string
          partner_id?: string
          queue_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_support_queues_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_usage_rollups: {
        Row: {
          ai_jobs_count: number
          api_requests_count: number
          automation_runs_count: number
          client_team_id: string | null
          created_at: string
          currency: string
          devices_count: number
          estimated_cost_cents: number | null
          estimated_revenue_cents: number | null
          id: string
          integrations_count: number
          members_count: number
          metadata: Json
          partner_id: string
          period_end: string
          period_start: string
          rollup_status: string
          session_minutes: number
          sessions_count: number
          support_tickets_count: number
          updated_at: string
        }
        Insert: {
          ai_jobs_count?: number
          api_requests_count?: number
          automation_runs_count?: number
          client_team_id?: string | null
          created_at?: string
          currency?: string
          devices_count?: number
          estimated_cost_cents?: number | null
          estimated_revenue_cents?: number | null
          id?: string
          integrations_count?: number
          members_count?: number
          metadata?: Json
          partner_id: string
          period_end: string
          period_start: string
          rollup_status?: string
          session_minutes?: number
          sessions_count?: number
          support_tickets_count?: number
          updated_at?: string
        }
        Update: {
          ai_jobs_count?: number
          api_requests_count?: number
          automation_runs_count?: number
          client_team_id?: string | null
          created_at?: string
          currency?: string
          devices_count?: number
          estimated_cost_cents?: number | null
          estimated_revenue_cents?: number | null
          id?: string
          integrations_count?: number
          members_count?: number
          metadata?: Json
          partner_id?: string
          period_end?: string
          period_start?: string
          rollup_status?: string
          session_minutes?: number
          sessions_count?: number
          support_tickets_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_usage_rollups_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          can_use_admin_console: boolean
          can_use_clipboard_sync: boolean
          can_use_file_transfer: boolean
          can_use_priority_support: boolean
          can_use_team_management: boolean
          can_use_unattended_access: boolean
          created_at: string
          currency: string
          display_name: string
          id: string
          max_audit_retention_days: number | null
          max_devices: number | null
          max_file_transfer_mb: number | null
          max_monthly_session_minutes: number | null
          max_team_members: number | null
          monthly_price: number | null
          plan_key: string
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          can_use_admin_console?: boolean
          can_use_clipboard_sync?: boolean
          can_use_file_transfer?: boolean
          can_use_priority_support?: boolean
          can_use_team_management?: boolean
          can_use_unattended_access?: boolean
          created_at?: string
          currency?: string
          display_name: string
          id?: string
          max_audit_retention_days?: number | null
          max_devices?: number | null
          max_file_transfer_mb?: number | null
          max_monthly_session_minutes?: number | null
          max_team_members?: number | null
          monthly_price?: number | null
          plan_key: string
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          can_use_admin_console?: boolean
          can_use_clipboard_sync?: boolean
          can_use_file_transfer?: boolean
          can_use_priority_support?: boolean
          can_use_team_management?: boolean
          can_use_unattended_access?: boolean
          created_at?: string
          currency?: string
          display_name?: string
          id?: string
          max_audit_retention_days?: number | null
          max_devices?: number | null
          max_file_transfer_mb?: number | null
          max_monthly_session_minutes?: number | null
          max_team_members?: number | null
          monthly_price?: number | null
          plan_key?: string
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      policy_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          enabled: boolean
          id: string
          policy_id: string
          priority: number
          target_id: string | null
          target_key: string | null
          target_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          enabled?: boolean
          id?: string
          policy_id: string
          priority?: number
          target_id?: string | null
          target_key?: string | null
          target_type: string
          team_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          enabled?: boolean
          id?: string
          policy_id?: string
          priority?: number
          target_id?: string | null
          target_key?: string | null
          target_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_assignments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_change_requests: {
        Row: {
          after_snapshot: Json
          before_snapshot: Json
          created_at: string
          decided_at: string | null
          decision_note: string | null
          description: string | null
          id: string
          policy_id: string | null
          request_type: string
          requested_by: string | null
          reviewed_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          after_snapshot?: Json
          before_snapshot?: Json
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          description?: string | null
          id?: string
          policy_id?: string | null
          request_type: string
          requested_by?: string | null
          reviewed_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          after_snapshot?: Json
          before_snapshot?: Json
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          description?: string | null
          id?: string
          policy_id?: string | null
          request_type?: string
          requested_by?: string | null
          reviewed_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_change_requests_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_change_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_evaluation_results: {
        Row: {
          context: Json
          created_at: string
          decision: string
          device_id: string | null
          evaluation_type: string
          id: string
          matched_rules: Json
          policy_id: string | null
          reason: string | null
          session_id: string | null
          team_id: string
          user_id: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          decision: string
          device_id?: string | null
          evaluation_type: string
          id?: string
          matched_rules?: Json
          policy_id?: string | null
          reason?: string | null
          session_id?: string | null
          team_id: string
          user_id?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          decision?: string
          device_id?: string | null
          evaluation_type?: string
          id?: string
          matched_rules?: Json
          policy_id?: string | null
          reason?: string | null
          session_id?: string | null
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_evaluation_results_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_evaluation_results_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_evaluation_results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_profiles: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          enforcement_mode: string
          id: string
          name: string
          policy_type: string
          priority: number
          rules: Json
          status: string
          team_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforcement_mode?: string
          id?: string
          name: string
          policy_type?: string
          priority?: number
          rules?: Json
          status?: string
          team_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforcement_mode?: string
          id?: string
          name?: string
          policy_type?: string
          priority?: number
          rules?: Json
          status?: string
          team_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_enterprise: boolean
          key: string
          name: string
          recommended_enforcement_mode: string
          rules: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_enterprise?: boolean
          key: string
          name: string
          recommended_enforcement_mode?: string
          rules?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_enterprise?: boolean
          key?: string
          name?: string
          recommended_enforcement_mode?: string
          rules?: Json
        }
        Relationships: []
      }
      policy_violations: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          description: string | null
          detected_at: string
          device_id: string | null
          id: string
          metadata: Json
          policy_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          severity: string
          status: string
          team_id: string
          title: string
          updated_at: string
          user_id: string | null
          violation_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json
          policy_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          severity?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
          user_id?: string | null
          violation_type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json
          policy_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          severity?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_violations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_violations_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_violations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_consent_records: {
        Row: {
          consent_text: string | null
          consent_type: string
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          denied_at: string | null
          device_id: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          ip_address: unknown
          metadata: Json
          response_note: string | null
          session_id: string | null
          status: string
          support_ticket_id: string | null
          team_id: string
          user_agent: string | null
          withdrawn_at: string | null
        }
        Insert: {
          consent_text?: string | null
          consent_type: string
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          denied_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          response_note?: string | null
          session_id?: string | null
          status: string
          support_ticket_id?: string | null
          team_id: string
          user_agent?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          consent_text?: string | null
          consent_type?: string
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          denied_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          response_note?: string | null
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id?: string
          user_agent?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_consent_records_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_consent_records_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "customer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_download_links: {
        Row: {
          active: boolean
          checksum: string | null
          created_at: string
          created_by: string | null
          id: string
          label: string
          notes: string | null
          platform: string
          team_id: string
          updated_at: string
          url: string | null
          version: string | null
        }
        Insert: {
          active?: boolean
          checksum?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          notes?: string | null
          platform: string
          team_id: string
          updated_at?: string
          url?: string | null
          version?: string | null
        }
        Update: {
          active?: boolean
          checksum?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          notes?: string | null
          platform?: string
          team_id?: string
          updated_at?: string
          url?: string | null
          version?: string | null
        }
        Relationships: []
      }
      portal_session_requests: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          created_at: string
          customer_account_id: string | null
          customer_message: string | null
          customer_user_id: string | null
          denied_at: string | null
          device_id: string | null
          expires_at: string | null
          id: string
          metadata: Json
          reason: string | null
          request_type: string
          requested_by: string | null
          session_id: string | null
          status: string
          support_ticket_id: string | null
          team_id: string
          technician_id: string | null
          technician_message: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_message?: string | null
          customer_user_id?: string | null
          denied_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          request_type?: string
          requested_by?: string | null
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id: string
          technician_id?: string | null
          technician_message?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_message?: string | null
          customer_user_id?: string | null
          denied_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          request_type?: string
          requested_by?: string | null
          session_id?: string | null
          status?: string
          support_ticket_id?: string | null
          team_id?: string
          technician_id?: string | null
          technician_message?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_session_requests_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_session_requests_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "customer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_approval_requests: {
        Row: {
          amount_cents: number | null
          asset_id: string | null
          contract_id: string | null
          created_at: string
          currency: string
          decision_note: string | null
          description: string | null
          id: string
          metadata: Json
          purchase_order_id: string | null
          purchase_request_id: string | null
          request_type: string
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          software_license_id: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          asset_id?: string | null
          contract_id?: string | null
          created_at?: string
          currency?: string
          decision_note?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          purchase_order_id?: string | null
          purchase_request_id?: string | null
          request_type: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          software_license_id?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          asset_id?: string | null
          contract_id?: string | null
          created_at?: string
          currency?: string
          decision_note?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          purchase_order_id?: string | null
          purchase_request_id?: string | null
          request_type?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          software_license_id?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      procurement_import_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          import_type: string
          input: Json
          output: Json
          records_created: number
          records_failed: number
          records_updated: number
          source_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          import_type: string
          input?: Json
          output?: Json
          records_created?: number
          records_failed?: number
          records_updated?: number
          source_type: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          import_type?: string
          input?: Json
          output?: Json
          records_created?: number
          records_failed?: number
          records_updated?: number
          source_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      procurement_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_event_definitions: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          event_category: string
          event_name: string
          id: string
          is_conversion_event: boolean
          is_key_event: boolean
          is_revenue_event: boolean
          lifecycle_stage: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          event_category?: string
          event_name: string
          id?: string
          is_conversion_event?: boolean
          is_key_event?: boolean
          is_revenue_event?: boolean
          lifecycle_stage?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          event_category?: string
          event_name?: string
          id?: string
          is_conversion_event?: boolean
          is_key_event?: boolean
          is_revenue_event?: boolean
          lifecycle_stage?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          customer_account_id: string | null
          customer_user_id: string | null
          event_category: string
          event_name: string
          id: string
          occurred_at: string
          partner_id: string | null
          properties: Json
          resource_id: string | null
          resource_type: string | null
          route_path: string | null
          session_id: string | null
          source: string
          team_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          event_category?: string
          event_name: string
          id?: string
          occurred_at?: string
          partner_id?: string | null
          properties?: Json
          resource_id?: string | null
          resource_type?: string | null
          route_path?: string | null
          session_id?: string | null
          source?: string
          team_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          customer_account_id?: string | null
          customer_user_id?: string | null
          event_category?: string
          event_name?: string
          id?: string
          occurred_at?: string
          partner_id?: string | null
          properties?: Json
          resource_id?: string | null
          resource_type?: string | null
          route_path?: string | null
          session_id?: string | null
          source?: string
          team_id?: string
        }
        Relationships: []
      }
      production_config_checks: {
        Row: {
          category: string
          config_key: string
          created_at: string
          created_by: string | null
          id: string
          last_checked_at: string | null
          launch_project_id: string | null
          metadata: Json
          name: string
          public_safe_value: string | null
          remediation: string | null
          required: boolean
          secret_present: boolean
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          config_key: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_checked_at?: string | null
          launch_project_id?: string | null
          metadata?: Json
          name: string
          public_safe_value?: string | null
          remediation?: string | null
          required?: boolean
          secret_present?: boolean
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          config_key?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_checked_at?: string | null
          launch_project_id?: string | null
          metadata?: Json
          name?: string
          public_safe_value?: string | null
          remediation?: string | null
          required?: boolean
          secret_present?: boolean
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      public_incident_updates: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          message: string
          public_incident_id: string
          published_at: string | null
          team_id: string | null
          title: string | null
          update_status: string
          updated_at: string
          visibility: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          public_incident_id: string
          published_at?: string | null
          team_id?: string | null
          title?: string | null
          update_status: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          public_incident_id?: string
          published_at?: string | null
          team_id?: string | null
          title?: string | null
          update_status?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_incident_updates_public_incident_id_fkey"
            columns: ["public_incident_id"]
            isOneToOne: false
            referencedRelation: "public_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_incident_updates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      public_incidents: {
        Row: {
          affected_component_ids: string[]
          approved_by: string | null
          created_at: string
          created_by: string | null
          customer_visible: boolean
          id: string
          impact: string
          postmortem_url: string | null
          public_summary: string | null
          published_at: string | null
          resolved_at: string | null
          severity: string
          source_incident_id: string | null
          started_at: string
          status: string
          status_page_id: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          affected_component_ids?: string[]
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_visible?: boolean
          id?: string
          impact?: string
          postmortem_url?: string | null
          public_summary?: string | null
          published_at?: string | null
          resolved_at?: string | null
          severity?: string
          source_incident_id?: string | null
          started_at?: string
          status?: string
          status_page_id: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          affected_component_ids?: string[]
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_visible?: boolean
          id?: string
          impact?: string
          postmortem_url?: string | null
          public_summary?: string | null
          published_at?: string | null
          resolved_at?: string | null
          severity?: string
          source_incident_id?: string | null
          started_at?: string
          status?: string
          status_page_id?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_incidents_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_incidents_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          asset_type: string
          category_id: string | null
          created_asset_ids: string[]
          created_at: string
          id: string
          item_name: string
          metadata: Json
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number
          team_id: string
          total_cost_cents: number | null
          unit_cost_cents: number | null
          updated_at: string
        }
        Insert: {
          asset_type?: string
          category_id?: string | null
          created_asset_ids?: string[]
          created_at?: string
          id?: string
          item_name: string
          metadata?: Json
          purchase_order_id: string
          quantity_ordered?: number
          quantity_received?: number
          team_id: string
          total_cost_cents?: number | null
          unit_cost_cents?: number | null
          updated_at?: string
        }
        Update: {
          asset_type?: string
          category_id?: string | null
          created_asset_ids?: string[]
          created_at?: string
          id?: string
          item_name?: string
          metadata?: Json
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number
          team_id?: string
          total_cost_cents?: number | null
          unit_cost_cents?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          expected_delivery_date: string | null
          external_reference: string | null
          id: string
          metadata: Json
          notes: string | null
          order_date: string | null
          po_number: string | null
          procurement_system_reference: string | null
          purchase_request_id: string | null
          received_date: string | null
          shipping_cents: number
          status: string
          subtotal_cents: number
          tax_cents: number
          team_id: string
          total_cents: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expected_delivery_date?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          order_date?: string | null
          po_number?: string | null
          procurement_system_reference?: string | null
          purchase_request_id?: string | null
          received_date?: string | null
          shipping_cents?: number
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          team_id: string
          total_cents?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expected_delivery_date?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          order_date?: string | null
          po_number?: string | null
          procurement_system_reference?: string | null
          purchase_request_id?: string | null
          received_date?: string | null
          shipping_cents?: number
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          team_id?: string
          total_cents?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      purchase_request_items: {
        Row: {
          asset_type: string
          category_id: string | null
          created_at: string
          id: string
          item_description: string | null
          item_name: string
          metadata: Json
          purchase_request_id: string
          quantity: number
          requested_license_id: string | null
          team_id: string
          total_cost_cents: number | null
          unit_cost_cents: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          asset_type?: string
          category_id?: string | null
          created_at?: string
          id?: string
          item_description?: string | null
          item_name: string
          metadata?: Json
          purchase_request_id: string
          quantity?: number
          requested_license_id?: string | null
          team_id: string
          total_cost_cents?: number | null
          unit_cost_cents?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          asset_type?: string
          category_id?: string | null
          created_at?: string
          id?: string
          item_description?: string | null
          item_name?: string
          metadata?: Json
          purchase_request_id?: string
          quantity?: number
          requested_license_id?: string | null
          team_id?: string
          total_cost_cents?: number | null
          unit_cost_cents?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_justification: string | null
          cost_center: string | null
          created_at: string
          currency: string
          decision_note: string | null
          description: string | null
          estimated_cost_cents: number | null
          id: string
          metadata: Json
          priority: string
          rejected_at: string | null
          rejected_by: string | null
          request_number: string | null
          request_type: string
          requested_by: string | null
          requested_for_user_id: string | null
          required_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_justification?: string | null
          cost_center?: string | null
          created_at?: string
          currency?: string
          decision_note?: string | null
          description?: string | null
          estimated_cost_cents?: number | null
          id?: string
          metadata?: Json
          priority?: string
          rejected_at?: string | null
          rejected_by?: string | null
          request_number?: string | null
          request_type?: string
          requested_by?: string | null
          requested_for_user_id?: string | null
          required_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_justification?: string | null
          cost_center?: string | null
          created_at?: string
          currency?: string
          decision_note?: string | null
          description?: string | null
          estimated_cost_cents?: number | null
          id?: string
          metadata?: Json
          priority?: string
          rejected_at?: string | null
          rejected_by?: string | null
          request_number?: string | null
          request_type?: string
          requested_by?: string | null
          requested_for_user_id?: string | null
          required_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      qa_test_cases: {
        Row: {
          automation_status: string
          created_at: string
          created_by: string | null
          description: string | null
          expected_result: string | null
          id: string
          linked_feature: string | null
          linked_route: string | null
          preconditions: string | null
          priority: string
          status: string
          steps: Json
          suite_id: string
          team_id: string
          test_key: string
          title: string
          updated_at: string
        }
        Insert: {
          automation_status?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          linked_feature?: string | null
          linked_route?: string | null
          preconditions?: string | null
          priority?: string
          status?: string
          steps?: Json
          suite_id: string
          team_id: string
          test_key: string
          title: string
          updated_at?: string
        }
        Update: {
          automation_status?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          linked_feature?: string | null
          linked_route?: string | null
          preconditions?: string | null
          priority?: string
          status?: string
          steps?: Json
          suite_id?: string
          team_id?: string
          test_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      qa_test_results: {
        Row: {
          actual_result: string | null
          created_at: string
          evidence: Json
          executed_at: string
          executed_by: string | null
          failure_reason: string | null
          id: string
          status: string
          team_id: string
          test_case_id: string
          test_run_id: string
        }
        Insert: {
          actual_result?: string | null
          created_at?: string
          evidence?: Json
          executed_at?: string
          executed_by?: string | null
          failure_reason?: string | null
          id?: string
          status: string
          team_id: string
          test_case_id: string
          test_run_id: string
        }
        Update: {
          actual_result?: string | null
          created_at?: string
          evidence?: Json
          executed_at?: string
          executed_by?: string | null
          failure_reason?: string | null
          id?: string
          status?: string
          team_id?: string
          test_case_id?: string
          test_run_id?: string
        }
        Relationships: []
      }
      qa_test_runs: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          launch_project_id: string | null
          run_name: string
          run_type: string
          started_at: string | null
          started_by: string | null
          status: string
          suite_id: string | null
          summary: Json
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          launch_project_id?: string | null
          run_name: string
          run_type?: string
          started_at?: string | null
          started_by?: string | null
          status?: string
          suite_id?: string | null
          summary?: Json
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          launch_project_id?: string | null
          run_name?: string
          run_type?: string
          started_at?: string | null
          started_by?: string | null
          status?: string
          suite_id?: string | null
          summary?: Json
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qa_test_suites: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          launch_project_id: string | null
          name: string
          owner_user_id: string | null
          status: string
          suite_key: string
          suite_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          launch_project_id?: string | null
          name: string
          owner_user_id?: string | null
          status?: string
          suite_key: string
          suite_type?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          launch_project_id?: string | null
          name?: string
          owner_user_id?: string | null
          status?: string
          suite_key?: string
          suite_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qbr_records: {
        Row: {
          action_items: Json
          agenda: Json
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          id: string
          metrics_snapshot: Json
          notes: string | null
          opportunities: Json
          owner_user_id: string | null
          partner_client_team_id: string | null
          risks: Json
          scheduled_at: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          action_items?: Json
          agenda?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          id?: string
          metrics_snapshot?: Json
          notes?: string | null
          opportunities?: Json
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          risks?: Json
          scheduled_at?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          action_items?: Json
          agenda?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          id?: string
          metrics_snapshot?: Json
          notes?: string | null
          opportunities?: Json
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          risks?: Json
          scheduled_at?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      readiness_check_runs: {
        Row: {
          check_id: string
          created_at: string
          error_message: string | null
          evidence_summary: string | null
          executed_by: string | null
          finished_at: string | null
          id: string
          launch_project_id: string | null
          output: Json
          run_type: string
          started_at: string
          status: string
          team_id: string
        }
        Insert: {
          check_id: string
          created_at?: string
          error_message?: string | null
          evidence_summary?: string | null
          executed_by?: string | null
          finished_at?: string | null
          id?: string
          launch_project_id?: string | null
          output?: Json
          run_type?: string
          started_at?: string
          status: string
          team_id: string
        }
        Update: {
          check_id?: string
          created_at?: string
          error_message?: string | null
          evidence_summary?: string | null
          executed_by?: string | null
          finished_at?: string | null
          id?: string
          launch_project_id?: string | null
          output?: Json
          run_type?: string
          started_at?: string
          status?: string
          team_id?: string
        }
        Relationships: []
      }
      readiness_checks: {
        Row: {
          actual_result: string | null
          assigned_to: string | null
          check_key: string
          check_type: string
          created_at: string
          created_by: string | null
          description: string | null
          domain_id: string | null
          evidence: Json
          expected_result: string | null
          id: string
          instructions: string | null
          last_passed_at: string | null
          last_run_at: string | null
          launch_project_id: string | null
          required: boolean
          severity: string
          status: string
          team_id: string
          title: string
          updated_at: string
          updated_by: string | null
          weight: number
        }
        Insert: {
          actual_result?: string | null
          assigned_to?: string | null
          check_key: string
          check_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain_id?: string | null
          evidence?: Json
          expected_result?: string | null
          id?: string
          instructions?: string | null
          last_passed_at?: string | null
          last_run_at?: string | null
          launch_project_id?: string | null
          required?: boolean
          severity?: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Update: {
          actual_result?: string | null
          assigned_to?: string | null
          check_key?: string
          check_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain_id?: string | null
          evidence?: Json
          expected_result?: string | null
          id?: string
          instructions?: string | null
          last_passed_at?: string | null
          last_run_at?: string | null
          launch_project_id?: string | null
          required?: boolean
          severity?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Relationships: []
      }
      readiness_domains: {
        Row: {
          created_at: string
          description: string | null
          domain_key: string
          domain_type: string
          id: string
          launch_project_id: string | null
          name: string
          owner_user_id: string | null
          sort_order: number
          status: string
          team_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_key: string
          domain_type?: string
          id?: string
          launch_project_id?: string | null
          name: string
          owner_user_id?: string | null
          sort_order?: number
          status?: string
          team_id: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_key?: string
          domain_type?: string
          id?: string
          launch_project_id?: string | null
          name?: string
          owner_user_id?: string | null
          sort_order?: number
          status?: string
          team_id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      release_notes: {
        Row: {
          approved_by: string | null
          audience: string
          breaking_changes: Json
          created_at: string
          created_by: string | null
          highlights: Json
          id: string
          known_issues: Json
          launch_project_id: string | null
          migration_notes: Json
          published_at: string | null
          status: string
          summary: string | null
          team_id: string
          title: string
          updated_at: string
          upgrade_notes: string | null
          version: string | null
        }
        Insert: {
          approved_by?: string | null
          audience?: string
          breaking_changes?: Json
          created_at?: string
          created_by?: string | null
          highlights?: Json
          id?: string
          known_issues?: Json
          launch_project_id?: string | null
          migration_notes?: Json
          published_at?: string | null
          status?: string
          summary?: string | null
          team_id: string
          title: string
          updated_at?: string
          upgrade_notes?: string | null
          version?: string | null
        }
        Update: {
          approved_by?: string | null
          audience?: string
          breaking_changes?: Json
          created_at?: string
          created_by?: string | null
          highlights?: Json
          id?: string
          known_issues?: Json
          launch_project_id?: string | null
          migration_notes?: Json
          published_at?: string | null
          status?: string
          summary?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          upgrade_notes?: string | null
          version?: string | null
        }
        Relationships: []
      }
      remediation_playbook_run_steps: {
        Row: {
          command_job_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          output: Json
          playbook_run_id: string
          started_at: string | null
          status: string
          step_order: number
          step_type: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          command_job_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          output?: Json
          playbook_run_id: string
          started_at?: string | null
          status?: string
          step_order: number
          step_type: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          command_job_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          output?: Json
          playbook_run_id?: string
          started_at?: string | null
          status?: string
          step_order?: number
          step_type?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      remediation_playbook_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          incident_id: string | null
          metadata: Json
          playbook_id: string
          started_at: string | null
          status: string
          support_ticket_id: string | null
          target_config: Json
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id?: string | null
          metadata?: Json
          playbook_id: string
          started_at?: string | null
          status?: string
          support_ticket_id?: string | null
          target_config?: Json
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id?: string | null
          metadata?: Json
          playbook_id?: string
          started_at?: string | null
          status?: string
          support_ticket_id?: string | null
          target_config?: Json
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      remediation_playbooks: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          playbook_key: string
          required_permissions: string[]
          requires_approval: boolean | null
          risk_level: string
          status: string
          steps: Json
          team_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          playbook_key: string
          required_permissions?: string[]
          requires_approval?: boolean | null
          risk_level?: string
          status?: string
          steps?: Json
          team_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          playbook_key?: string
          required_permissions?: string[]
          requires_approval?: boolean | null
          risk_level?: string
          status?: string
          steps?: Json
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      remote_input_policies: {
        Row: {
          allow_keyboard: boolean
          allow_mouse: boolean
          block_elevation: boolean
          default_mode: string
          idle_lock_enabled: boolean
          idle_lock_minutes: number
          team_id: string
          updated_at: string
        }
        Insert: {
          allow_keyboard?: boolean
          allow_mouse?: boolean
          block_elevation?: boolean
          default_mode?: string
          idle_lock_enabled?: boolean
          idle_lock_minutes?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          allow_keyboard?: boolean
          allow_mouse?: boolean
          block_elevation?: boolean
          default_mode?: string
          idle_lock_enabled?: boolean
          idle_lock_minutes?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "remote_input_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      role_definitions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_assignable: boolean
          key: string
          name: string
          permissions: string[]
          role_type: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_assignable?: boolean
          key: string
          name: string
          permissions?: string[]
          role_type?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_assignable?: boolean
          key?: string
          name?: string
          permissions?: string[]
          role_type?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_definitions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_maintenance_windows: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          affected_component_ids: string[]
          approved_by: string | null
          created_at: string
          created_by: string | null
          customer_impact: string
          description: string | null
          id: string
          published_at: string | null
          scheduled_end: string
          scheduled_start: string
          status: string
          status_page_id: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          affected_component_ids?: string[]
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_impact?: string
          description?: string | null
          id?: string
          published_at?: string | null
          scheduled_end: string
          scheduled_start: string
          status?: string
          status_page_id: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          affected_component_ids?: string[]
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_impact?: string
          description?: string | null
          id?: string
          published_at?: string | null
          scheduled_end?: string
          scheduled_start?: string
          status?: string
          status_page_id?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_maintenance_windows_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_maintenance_windows_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scim_group_members: {
        Row: {
          active: boolean
          added_at: string
          created_at: string
          id: string
          removed_at: string | null
          scim_group_id: string
          scim_user_id: string
          team_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          added_at?: string
          created_at?: string
          id?: string
          removed_at?: string | null
          scim_group_id: string
          scim_user_id: string
          team_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          added_at?: string
          created_at?: string
          id?: string
          removed_at?: string | null
          scim_group_id?: string
          scim_user_id?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scim_group_members_scim_group_id_fkey"
            columns: ["scim_group_id"]
            isOneToOne: false
            referencedRelation: "scim_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scim_group_members_scim_user_id_fkey"
            columns: ["scim_user_id"]
            isOneToOne: false
            referencedRelation: "scim_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scim_group_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scim_groups: {
        Row: {
          created_at: string
          display_name: string
          external_id: string | null
          id: string
          last_synced_at: string | null
          raw_payload: Json
          scim_id: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          raw_payload?: Json
          scim_id: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          raw_payload?: Json
          scim_id?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scim_groups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scim_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[]
          status: string
          team_id: string
          token_hash: string
          token_prefix: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[]
          status?: string
          team_id: string
          token_hash: string
          token_prefix: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[]
          status?: string
          team_id?: string
          token_hash?: string
          token_prefix?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scim_tokens_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scim_users: {
        Row: {
          active: boolean
          created_at: string
          deprovisioned_at: string | null
          display_name: string | null
          email: string | null
          external_id: string | null
          family_name: string | null
          given_name: string | null
          id: string
          last_synced_at: string | null
          raw_payload: Json
          remote_role_key: string | null
          scim_id: string
          team_id: string
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deprovisioned_at?: string | null
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          family_name?: string | null
          given_name?: string | null
          id?: string
          last_synced_at?: string | null
          raw_payload?: Json
          remote_role_key?: string | null
          scim_id: string
          team_id: string
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deprovisioned_at?: string | null
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          family_name?: string | null
          given_name?: string | null
          id?: string
          last_synced_at?: string | null
          raw_payload?: Json
          remote_role_key?: string | null
          scim_id?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "scim_users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_change_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          current_seats: number | null
          decided_at: string | null
          id: string
          reason: string | null
          rejected_by: string | null
          requested_by: string | null
          requested_seats: number
          status: string
          team_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          current_seats?: number | null
          decided_at?: string | null
          id?: string
          reason?: string | null
          rejected_by?: string | null
          requested_by?: string | null
          requested_seats: number
          status?: string
          team_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          current_seats?: number | null
          decided_at?: string | null
          id?: string
          reason?: string | null
          rejected_by?: string | null
          requested_by?: string | null
          requested_seats?: number
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_change_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json
          severity: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          severity?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          severity?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          emergency_stop_shortcut: string
          require_2fa: boolean
          require_device_password: boolean
          require_host_approval: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          emergency_stop_shortcut?: string
          require_2fa?: boolean
          require_device_password?: boolean
          require_host_approval?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          emergency_stop_shortcut?: string
          require_2fa?: boolean
          require_device_password?: boolean
          require_host_approval?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      security_questionnaire_responses: {
        Row: {
          answer: string
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          last_reviewed_at: string | null
          question: string
          question_key: string
          status: string
          team_id: string | null
          trust_center_id: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          answer: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_reviewed_at?: string | null
          question: string
          question_key: string
          status?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          answer?: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_reviewed_at?: string | null
          question?: string
          question_key?: string
          status?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_questionnaire_responses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_questionnaire_responses_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      security_questionnaire_templates: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          questions: Json
          team_id: string | null
          template_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          questions?: Json
          team_id?: string | null
          template_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          questions?: Json
          team_id?: string | null
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_questionnaire_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_clipboard_events: {
        Row: {
          content_length: number | null
          content_type: string
          created_at: string
          device_id: string | null
          direction: string
          id: string
          metadata: Json
          policy_decision: string | null
          sensitive_pattern_detected: boolean
          session_id: string
          status: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          content_length?: number | null
          content_type?: string
          created_at?: string
          device_id?: string | null
          direction: string
          id?: string
          metadata?: Json
          policy_decision?: string | null
          sensitive_pattern_detected?: boolean
          session_id: string
          status?: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          content_length?: number | null
          content_type?: string
          created_at?: string
          device_id?: string | null
          direction?: string
          id?: string
          metadata?: Json
          policy_decision?: string | null
          sensitive_pattern_detected?: boolean
          session_id?: string
          status?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_clipboard_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_clipboard_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_clipboard_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_compliance_checks: {
        Row: {
          check_key: string
          check_name: string
          checked_at: string
          created_at: string
          device_id: string | null
          evidence: Json
          id: string
          recommendation: string | null
          session_id: string
          severity: string
          status: string
          team_id: string
        }
        Insert: {
          check_key: string
          check_name: string
          checked_at?: string
          created_at?: string
          device_id?: string | null
          evidence?: Json
          id?: string
          recommendation?: string | null
          session_id: string
          severity?: string
          status: string
          team_id: string
        }
        Update: {
          check_key?: string
          check_name?: string
          checked_at?: string
          created_at?: string
          device_id?: string | null
          evidence?: Json
          id?: string
          recommendation?: string | null
          session_id?: string
          severity?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_compliance_checks_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_compliance_checks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_compliance_checks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_consent_events: {
        Row: {
          consent_type: string
          created_at: string
          device_id: string | null
          expires_at: string | null
          id: string
          metadata: Json
          request_message: string | null
          requested_at: string
          requested_by: string | null
          responded_at: string | null
          responded_by: string | null
          response_message: string | null
          session_id: string
          status: string
          team_id: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          device_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          request_message?: string | null
          requested_at?: string
          requested_by?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          session_id: string
          status: string
          team_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          device_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          request_message?: string | null
          requested_at?: string
          requested_by?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          session_id?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_consent_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_consent_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_consent_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_file_transfer_events: {
        Row: {
          checksum: string | null
          created_at: string
          device_id: string | null
          direction: string
          file_extension: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json
          policy_decision: string | null
          reason: string | null
          session_id: string
          status: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          device_id?: string | null
          direction: string
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          policy_decision?: string | null
          reason?: string | null
          session_id: string
          status?: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          checksum?: string | null
          created_at?: string
          device_id?: string | null
          direction?: string
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          policy_decision?: string | null
          reason?: string | null
          session_id?: string
          status?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_file_transfer_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_file_transfer_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_file_transfer_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_quality_metrics: {
        Row: {
          bandwidth_kbps: number | null
          captured_at: string
          connection_quality: string
          cpu_load: number | null
          created_at: string
          device_id: string | null
          fps: number | null
          id: string
          jitter_ms: number | null
          latency_ms: number | null
          memory_load: number | null
          metadata: Json
          packet_loss: number | null
          session_id: string
          team_id: string
        }
        Insert: {
          bandwidth_kbps?: number | null
          captured_at?: string
          connection_quality?: string
          cpu_load?: number | null
          created_at?: string
          device_id?: string | null
          fps?: number | null
          id?: string
          jitter_ms?: number | null
          latency_ms?: number | null
          memory_load?: number | null
          metadata?: Json
          packet_loss?: number | null
          session_id: string
          team_id: string
        }
        Update: {
          bandwidth_kbps?: number | null
          captured_at?: string
          connection_quality?: string
          cpu_load?: number | null
          created_at?: string
          device_id?: string | null
          fps?: number | null
          id?: string
          jitter_ms?: number | null
          latency_ms?: number | null
          memory_load?: number | null
          metadata?: Json
          packet_loss?: number | null
          session_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_quality_metrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_quality_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_quality_metrics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recording_metadata: {
        Row: {
          available_at: string | null
          checksum: string | null
          created_at: string
          deleted_at: string | null
          device_id: string | null
          duration_seconds: number | null
          encryption_status: string
          failure_reason: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json
          recording_mode: string
          recording_status: string
          retention_until: string | null
          session_id: string
          started_by: string | null
          storage_bucket: string | null
          storage_path: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          available_at?: string | null
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          device_id?: string | null
          duration_seconds?: number | null
          encryption_status?: string
          failure_reason?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          recording_mode?: string
          recording_status?: string
          retention_until?: string | null
          session_id: string
          started_by?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          available_at?: string | null
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          device_id?: string | null
          duration_seconds?: number | null
          encryption_status?: string
          failure_reason?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          recording_mode?: string
          recording_status?: string
          retention_until?: string | null
          session_id?: string
          started_by?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recording_metadata_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_recording_metadata_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_recording_metadata_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_report_exports: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          export_type: string
          id: string
          report_run_id: string | null
          session_id: string | null
          size_bytes: number | null
          status: string
          storage_path: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          export_type: string
          id?: string
          report_run_id?: string | null
          session_id?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          export_type?: string
          id?: string
          report_run_id?: string | null
          session_id?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_report_exports_report_run_id_fkey"
            columns: ["report_run_id"]
            isOneToOne: false
            referencedRelation: "compliance_report_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_report_exports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_report_exports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_timeline_events: {
        Row: {
          created_at: string
          description: string | null
          device_id: string | null
          event_type: string
          id: string
          metadata: Json
          offset_seconds: number | null
          session_id: string
          severity: string
          team_id: string
          timestamp_at: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          device_id?: string | null
          event_type: string
          id?: string
          metadata?: Json
          offset_seconds?: number | null
          session_id: string
          severity?: string
          team_id: string
          timestamp_at?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          device_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          offset_seconds?: number | null
          session_id?: string
          severity?: string
          team_id?: string
          timestamp_at?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_timeline_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_timeline_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_timeline_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          bitrate_kbps: number | null
          device_id: string
          end_reason: string | null
          ended_at: string | null
          expires_at: string | null
          host_user_id: string | null
          id: string
          latency_ms: number | null
          packet_loss_pct: number | null
          quality: Database["public"]["Enums"]["session_quality"] | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          team_id: string
          token_hash: string | null
          viewer_user_id: string | null
        }
        Insert: {
          bitrate_kbps?: number | null
          device_id: string
          end_reason?: string | null
          ended_at?: string | null
          expires_at?: string | null
          host_user_id?: string | null
          id?: string
          latency_ms?: number | null
          packet_loss_pct?: number | null
          quality?: Database["public"]["Enums"]["session_quality"] | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id: string
          token_hash?: string | null
          viewer_user_id?: string | null
        }
        Update: {
          bitrate_kbps?: number | null
          device_id?: string
          end_reason?: string | null
          ended_at?: string | null
          expires_at?: string | null
          host_user_id?: string | null
          id?: string
          latency_ms?: number | null
          packet_loss_pct?: number | null
          quality?: Database["public"]["Enums"]["session_quality"] | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id?: string
          token_hash?: string | null
          viewer_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      software_license_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_status: string
          created_at: string
          customer_account_id: string | null
          device_id: string | null
          id: string
          license_id: string
          metadata: Json
          revoked_at: string | null
          revoked_by: string | null
          team_id: string
          updated_at: string
          usage_last_seen_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: string
          created_at?: string
          customer_account_id?: string | null
          device_id?: string | null
          id?: string
          license_id: string
          metadata?: Json
          revoked_at?: string | null
          revoked_by?: string | null
          team_id: string
          updated_at?: string
          usage_last_seen_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_status?: string
          created_at?: string
          customer_account_id?: string | null
          device_id?: string | null
          id?: string
          license_id?: string
          metadata?: Json
          revoked_at?: string | null
          revoked_by?: string | null
          team_id?: string
          updated_at?: string
          usage_last_seen_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      software_licenses: {
        Row: {
          auto_renew: boolean
          available_seats: number | null
          billing_interval: string
          contract_id: string | null
          cost_cents: number | null
          created_at: string
          created_by: string | null
          currency: string
          end_date: string | null
          id: string
          license_key: string | null
          license_key_hash: string | null
          license_type: string
          metadata: Json
          name: string
          notes: string | null
          renewal_date: string | null
          software_product_id: string
          start_date: string | null
          status: string
          team_id: string
          total_seats: number | null
          updated_at: string
          updated_by: string | null
          used_seats: number
          vendor_id: string | null
        }
        Insert: {
          auto_renew?: boolean
          available_seats?: number | null
          billing_interval?: string
          contract_id?: string | null
          cost_cents?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date?: string | null
          id?: string
          license_key?: string | null
          license_key_hash?: string | null
          license_type?: string
          metadata?: Json
          name: string
          notes?: string | null
          renewal_date?: string | null
          software_product_id: string
          start_date?: string | null
          status?: string
          team_id: string
          total_seats?: number | null
          updated_at?: string
          updated_by?: string | null
          used_seats?: number
          vendor_id?: string | null
        }
        Update: {
          auto_renew?: boolean
          available_seats?: number | null
          billing_interval?: string
          contract_id?: string | null
          cost_cents?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date?: string | null
          id?: string
          license_key?: string | null
          license_key_hash?: string | null
          license_type?: string
          metadata?: Json
          name?: string
          notes?: string | null
          renewal_date?: string | null
          software_product_id?: string
          start_date?: string | null
          status?: string
          team_id?: string
          total_seats?: number | null
          updated_at?: string
          updated_by?: string | null
          used_seats?: number
          vendor_id?: string | null
        }
        Relationships: []
      }
      software_products: {
        Row: {
          admin_url: string | null
          created_at: string
          created_by: string | null
          data_sensitivity: string
          id: string
          metadata: Json
          name: string
          product_key: string
          product_type: string
          security_review_status: string
          status: string
          support_url: string | null
          team_id: string
          updated_at: string
          vendor_id: string | null
          website_url: string | null
        }
        Insert: {
          admin_url?: string | null
          created_at?: string
          created_by?: string | null
          data_sensitivity?: string
          id?: string
          metadata?: Json
          name: string
          product_key: string
          product_type?: string
          security_review_status?: string
          status?: string
          support_url?: string | null
          team_id: string
          updated_at?: string
          vendor_id?: string | null
          website_url?: string | null
        }
        Update: {
          admin_url?: string | null
          created_at?: string
          created_by?: string | null
          data_sensitivity?: string
          id?: string
          metadata?: Json
          name?: string
          product_key?: string
          product_type?: string
          security_review_status?: string
          status?: string
          support_url?: string | null
          team_id?: string
          updated_at?: string
          vendor_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      sso_login_attempts: {
        Row: {
          created_at: string
          domain: string | null
          email: string | null
          failure_code: string | null
          failure_message: string | null
          id: string
          identity_provider_id: string | null
          ip_address: unknown
          metadata: Json
          provider_type: string | null
          relay_state_hash: string | null
          request_id: string | null
          status: string
          team_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          domain?: string | null
          email?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          identity_provider_id?: string | null
          ip_address?: unknown
          metadata?: Json
          provider_type?: string | null
          relay_state_hash?: string | null
          request_id?: string | null
          status: string
          team_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          domain?: string | null
          email?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          identity_provider_id?: string | null
          ip_address?: unknown
          metadata?: Json
          provider_type?: string | null
          relay_state_hash?: string | null
          request_id?: string | null
          status?: string
          team_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_login_attempts_identity_provider_id_fkey"
            columns: ["identity_provider_id"]
            isOneToOne: false
            referencedRelation: "identity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sso_login_attempts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      status_components: {
        Row: {
          category: string
          component_key: string
          created_at: string
          description: string | null
          id: string
          name: string
          observability_service_id: string | null
          public_visible: boolean
          region_id: string | null
          sort_order: number
          status: string
          status_page_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          component_key: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          observability_service_id?: string | null
          public_visible?: boolean
          region_id?: string | null
          sort_order?: number
          status?: string
          status_page_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          component_key?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          observability_service_id?: string | null
          public_visible?: boolean
          region_id?: string | null
          sort_order?: number
          status?: string
          status_page_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_components_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_components_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          incident_id: string | null
          message: string
          published_at: string | null
          service_id: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id?: string | null
          message: string
          published_at?: string | null
          service_id?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id?: string | null
          message?: string
          published_at?: string | null
          service_id?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_updates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "observability_services"
            referencedColumns: ["id"]
          },
        ]
      }
      status_pages: {
        Row: {
          activated_at: string | null
          brand_profile_id: string | null
          created_at: string
          created_by: string | null
          custom_domain_id: string | null
          description: string | null
          id: string
          name: string
          partner_id: string | null
          public_subscribe_enabled: boolean
          show_component_history: boolean
          show_incident_history: boolean
          show_maintenance: boolean
          show_uptime_metrics: boolean
          status: string
          status_page_key: string
          team_id: string | null
          trust_center_id: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          activated_at?: string | null
          brand_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          id?: string
          name: string
          partner_id?: string | null
          public_subscribe_enabled?: boolean
          show_component_history?: boolean
          show_incident_history?: boolean
          show_maintenance?: boolean
          show_uptime_metrics?: boolean
          status?: string
          status_page_key: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          activated_at?: string | null
          brand_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          id?: string
          name?: string
          partner_id?: string | null
          public_subscribe_enabled?: boolean
          show_component_history?: boolean
          show_incident_history?: boolean
          show_maintenance?: boolean
          show_uptime_metrics?: boolean
          status?: string
          status_page_key?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_pages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      subprocessor_register: {
        Row: {
          added_at: string | null
          countries: string[]
          created_at: string
          created_by: string | null
          data_processed: string[]
          description: string | null
          dpa_status: string
          id: string
          privacy_url: string | null
          public_visible: boolean
          region_ids: string[]
          removed_at: string | null
          security_url: string | null
          service_category: string
          status: string
          team_id: string | null
          trust_center_id: string | null
          updated_at: string
          vendor_name: string
          website_url: string | null
        }
        Insert: {
          added_at?: string | null
          countries?: string[]
          created_at?: string
          created_by?: string | null
          data_processed?: string[]
          description?: string | null
          dpa_status?: string
          id?: string
          privacy_url?: string | null
          public_visible?: boolean
          region_ids?: string[]
          removed_at?: string | null
          security_url?: string | null
          service_category: string
          status?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          vendor_name: string
          website_url?: string | null
        }
        Update: {
          added_at?: string | null
          countries?: string[]
          created_at?: string
          created_by?: string | null
          data_processed?: string[]
          description?: string | null
          dpa_status?: string
          id?: string
          privacy_url?: string | null
          public_visible?: boolean
          region_ids?: string[]
          removed_at?: string | null
          security_url?: string | null
          service_category?: string
          status?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          vendor_name?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subprocessor_register_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subprocessor_register_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_interval: string | null
          cancel_at_period_end: boolean
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider: string
          seats: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          team_id: string
        }
        Insert: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          provider?: string
          seats?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          team_id: string
        }
        Update: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          provider?: string
          seats?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      success_plan_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          metadata: Json
          status: string
          success_plan_id: string
          task_type: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          status?: string
          success_plan_id: string
          task_type?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          status?: string
          success_plan_id?: string
          task_type?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_plan_tasks_success_plan_id_fkey"
            columns: ["success_plan_id"]
            isOneToOne: false
            referencedRelation: "success_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      success_plans: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          description: string | null
          executive_sponsor: string | null
          health_score_at_start: number | null
          id: string
          owner_user_id: string | null
          partner_client_team_id: string | null
          plan_type: string
          status: string
          target_date: string | null
          target_outcome: string | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          description?: string | null
          executive_sponsor?: string | null
          health_score_at_start?: number | null
          id?: string
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          plan_type?: string
          status?: string
          target_date?: string | null
          target_outcome?: string | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          description?: string | null
          executive_sponsor?: string | null
          health_score_at_start?: number | null
          id?: string
          owner_user_id?: string | null
          partner_client_team_id?: string | null
          plan_type?: string
          status?: string
          target_date?: string | null
          target_outcome?: string | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_escalations: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          escalated_by: string | null
          escalated_to: string | null
          escalation_level: number
          id: string
          queue_id: string | null
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          team_id: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          escalated_by?: string | null
          escalated_to?: string | null
          escalation_level?: number
          id?: string
          queue_id?: string | null
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          team_id: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          escalated_by?: string | null
          escalated_to?: string | null
          escalation_level?: number
          id?: string
          queue_id?: string | null
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          team_id?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_escalations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_internal_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          team_id: string
          ticket_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          team_id: string
          ticket_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          team_id?: string
          ticket_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_internal_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_operations_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          finished_at: string | null
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          started_at: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          finished_at?: string | null
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          finished_at?: string | null
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_queue_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          joined_at: string
          queue_id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          joined_at?: string
          queue_id: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          joined_at?: string
          queue_id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_queue_members_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "support_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      support_queues: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          priority: number
          queue_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          priority?: number
          queue_type?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          priority?: number
          queue_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_runbooks: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          steps: Json
          tags: string[]
          team_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          steps?: Json
          tags?: string[]
          team_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          steps?: Json
          tags?: string[]
          team_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      support_sla_policies: {
        Row: {
          active: boolean
          business_hours_only: boolean
          created_at: string
          created_by: string | null
          description: string | null
          escalation_minutes: number | null
          first_response_minutes: number
          id: string
          name: string
          priority: string
          resolution_minutes: number
          team_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_hours_only?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          escalation_minutes?: number | null
          first_response_minutes?: number
          id?: string
          name: string
          priority?: string
          resolution_minutes?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_hours_only?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          escalation_minutes?: number | null
          first_response_minutes?: number
          id?: string
          name?: string
          priority?: string
          resolution_minutes?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string | null
          assigned_to: string | null
          assignment_type: string
          created_at: string
          id: string
          queue_id: string | null
          reason: string | null
          team_id: string
          ticket_id: string
          unassigned_at: string | null
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string | null
          assignment_type?: string
          created_at?: string
          id?: string
          queue_id?: string | null
          reason?: string | null
          team_id: string
          ticket_id: string
          unassigned_at?: string | null
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string | null
          assignment_type?: string
          created_at?: string
          id?: string
          queue_id?: string | null
          reason?: string | null
          team_id?: string
          ticket_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_attachments: {
        Row: {
          checksum_sha256: string | null
          comment_id: string | null
          created_at: string
          deleted_at: string | null
          file_name: string
          file_size: number
          id: string
          mime_type: string | null
          scan_status: string
          storage_bucket: string
          storage_path: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          checksum_sha256?: string | null
          comment_id?: string | null
          created_at?: string
          deleted_at?: string | null
          file_name: string
          file_size: number
          id?: string
          mime_type?: string | null
          scan_status?: string
          storage_bucket?: string
          storage_path: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          checksum_sha256?: string | null
          comment_id?: string | null
          created_at?: string
          deleted_at?: string | null
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          scan_status?: string
          storage_bucket?: string
          storage_path?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "support_ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_device_links: {
        Row: {
          created_at: string
          created_by: string | null
          device_id: string | null
          id: string
          link_type: string
          session_id: string | null
          team_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          id?: string
          link_type?: string
          session_id?: string | null
          team_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          id?: string
          link_type?: string
          session_id?: string | null
          team_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_device_links_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          from_value: string | null
          id: string
          metadata: Json
          ticket_id: string
          to_value: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          from_value?: string | null
          id?: string
          metadata?: Json
          ticket_id: string
          to_value?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          from_value?: string | null
          id?: string
          metadata?: Json
          ticket_id?: string
          to_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_runbook_usage: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          runbook_id: string
          started_at: string
          status: string
          team_id: string
          ticket_id: string
          used_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          runbook_id: string
          started_at?: string
          status?: string
          team_id: string
          ticket_id: string
          used_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          runbook_id?: string
          started_at?: string
          status?: string
          team_id?: string
          ticket_id?: string
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_runbook_usage_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "support_runbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_runbook_usage_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_sla_status: {
        Row: {
          created_at: string
          escalation_due_at: string | null
          escalation_triggered: boolean
          first_response_at: string | null
          first_response_breached: boolean
          first_response_due_at: string | null
          id: string
          resolution_breached: boolean
          resolution_due_at: string | null
          resolved_at: string | null
          sla_policy_id: string | null
          status: string
          team_id: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escalation_due_at?: string | null
          escalation_triggered?: boolean
          first_response_at?: string | null
          first_response_breached?: boolean
          first_response_due_at?: string | null
          id?: string
          resolution_breached?: boolean
          resolution_due_at?: string | null
          resolved_at?: string | null
          sla_policy_id?: string | null
          status?: string
          team_id: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escalation_due_at?: string | null
          escalation_triggered?: boolean
          first_response_at?: string | null
          first_response_breached?: boolean
          first_response_due_at?: string | null
          id?: string
          resolution_breached?: boolean
          resolution_due_at?: string | null
          resolved_at?: string | null
          sla_policy_id?: string | null
          status?: string
          team_id?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_sla_status_sla_policy_id_fkey"
            columns: ["sla_policy_id"]
            isOneToOne: false
            referencedRelation: "support_sla_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_sla_status_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          tag: string
          team_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          tag: string
          team_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          tag?: string
          team_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_tags_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          closed_at: string | null
          created_at: string
          customer_impact: string | null
          description: string
          first_response_at: string | null
          id: string
          last_activity_at: string | null
          priority: string
          queue_id: string | null
          resolved_at: string | null
          severity: string | null
          source: string | null
          status: string
          subject: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          closed_at?: string | null
          created_at?: string
          customer_impact?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          last_activity_at?: string | null
          priority?: string
          queue_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          source?: string | null
          status?: string
          subject: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string
          customer_impact?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          last_activity_at?: string | null
          priority?: string
          queue_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          source?: string | null
          status?: string
          subject?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_domains: {
        Row: {
          created_at: string
          created_by: string | null
          domain: string
          id: string
          status: string
          team_id: string
          updated_at: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          domain: string
          id?: string
          status?: string
          team_id: string
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          domain?: string
          id?: string
          status?: string
          team_id?: string
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_domains_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_governance_settings: {
        Row: {
          access_review_frequency: string
          allowed_email_domains: string[]
          created_at: string
          id: string
          invite_expiry_days: number
          max_trusted_device_days: number
          require_approval_for_billing_changes: boolean
          require_approval_for_broad_api_keys: boolean
          require_approval_for_owner_transfer: boolean
          require_approval_for_policy_changes: boolean
          require_mfa_for_admins: boolean
          require_mfa_for_all_members: boolean
          session_timeout_minutes: number
          team_id: string
          updated_at: string
        }
        Insert: {
          access_review_frequency?: string
          allowed_email_domains?: string[]
          created_at?: string
          id?: string
          invite_expiry_days?: number
          max_trusted_device_days?: number
          require_approval_for_billing_changes?: boolean
          require_approval_for_broad_api_keys?: boolean
          require_approval_for_owner_transfer?: boolean
          require_approval_for_policy_changes?: boolean
          require_mfa_for_admins?: boolean
          require_mfa_for_all_members?: boolean
          session_timeout_minutes?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          access_review_frequency?: string
          allowed_email_domains?: string[]
          created_at?: string
          id?: string
          invite_expiry_days?: number
          max_trusted_device_days?: number
          require_approval_for_billing_changes?: boolean
          require_approval_for_broad_api_keys?: boolean
          require_approval_for_owner_transfer?: boolean
          require_approval_for_policy_changes?: boolean
          require_mfa_for_admins?: boolean
          require_mfa_for_all_members?: boolean
          session_timeout_minutes?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_governance_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_integrations: {
        Row: {
          auth_status: string
          catalog_id: string
          config: Json
          connected_at: string | null
          connected_by: string | null
          created_at: string
          id: string
          integration_key: string
          last_error_at: string | null
          last_error_message: string | null
          last_sync_at: string | null
          name: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          auth_status?: string
          catalog_id: string
          config?: Json
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          integration_key: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_sync_at?: string | null
          name: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          auth_status?: string
          catalog_id?: string
          config?: Json
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          integration_key?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_sync_at?: string | null
          name?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_integrations_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "integration_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          message: string | null
          revoked_at: string | null
          role: string
          status: string
          team_id: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          message?: string | null
          revoked_at?: string | null
          role?: string
          status?: string
          team_id: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          message?: string | null
          revoked_at?: string | null
          role?: string
          status?: string
          team_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: []
      }
      technician_shift_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          max_jobs: number | null
          notes: string | null
          region_id: string | null
          schedule_date: string
          service_area: string | null
          shift_end: string | null
          shift_start: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          max_jobs?: number | null
          notes?: string | null
          region_id?: string | null
          schedule_date: string
          service_area?: string | null
          shift_end?: string | null
          shift_start?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          max_jobs?: number | null
          notes?: string | null
          region_id?: string | null
          schedule_date?: string
          service_area?: string | null
          shift_end?: string | null
          shift_start?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      technician_work_orders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_account_id: string | null
          description: string | null
          due_at: string | null
          id: string
          metadata: Json
          priority: string
          status: string
          support_ticket_id: string | null
          team_id: string
          title: string
          updated_at: string
          work_order_number: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          priority?: string
          status?: string
          support_ticket_id?: string | null
          team_id: string
          title: string
          updated_at?: string
          work_order_number?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_account_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          priority?: string
          status?: string
          support_ticket_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          work_order_number?: string | null
        }
        Relationships: []
      }
      technician_workload_snapshots: {
        Row: {
          active_sessions: number
          avg_resolution_minutes: number | null
          avg_response_minutes: number | null
          breached_slas: number
          created_at: string
          id: string
          open_tickets: number
          snapshot_at: string
          team_id: string
          urgent_tickets: number
          user_id: string
        }
        Insert: {
          active_sessions?: number
          avg_resolution_minutes?: number | null
          avg_response_minutes?: number | null
          breached_slas?: number
          created_at?: string
          id?: string
          open_tickets?: number
          snapshot_at?: string
          team_id: string
          urgent_tickets?: number
          user_id: string
        }
        Update: {
          active_sessions?: number
          avg_resolution_minutes?: number | null
          avg_response_minutes?: number | null
          breached_slas?: number
          created_at?: string
          id?: string
          open_tickets?: number
          snapshot_at?: string
          team_id?: string
          urgent_tickets?: number
          user_id?: string
        }
        Relationships: []
      }
      training_certificates: {
        Row: {
          certificate_number: string | null
          course_id: string
          created_at: string
          customer_user_id: string | null
          enrollment_id: string
          expires_at: string | null
          id: string
          issued_at: string
          metadata: Json
          partner_member_id: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string | null
          verification_hash: string | null
        }
        Insert: {
          certificate_number?: string | null
          course_id: string
          created_at?: string
          customer_user_id?: string | null
          enrollment_id: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json
          partner_member_id?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id?: string | null
          verification_hash?: string | null
        }
        Update: {
          certificate_number?: string | null
          course_id?: string
          created_at?: string
          customer_user_id?: string | null
          enrollment_id?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json
          partner_member_id?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
          verification_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          certificate_enabled: boolean
          course_key: string
          course_type: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          estimated_minutes: number | null
          id: string
          passing_score: number
          published_at: string | null
          published_by: string | null
          space_id: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          certificate_enabled?: boolean
          course_key: string
          course_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          estimated_minutes?: number | null
          id?: string
          passing_score?: number
          published_at?: string | null
          published_by?: string | null
          space_id?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          certificate_enabled?: boolean
          course_key?: string
          course_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          estimated_minutes?: number | null
          id?: string
          passing_score?: number
          published_at?: string | null
          published_by?: string | null
          space_id?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_courses_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "knowledge_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      training_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          customer_user_id: string | null
          due_at: string | null
          enrolled_at: string
          enrolled_by: string | null
          id: string
          metadata: Json
          partner_member_id: string | null
          progress_percent: number
          started_at: string | null
          status: string
          team_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          customer_user_id?: string | null
          due_at?: string | null
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          metadata?: Json
          partner_member_id?: string | null
          progress_percent?: number
          started_at?: string | null
          status?: string
          team_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          customer_user_id?: string | null
          due_at?: string | null
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          metadata?: Json
          partner_member_id?: string | null
          progress_percent?: number
          started_at?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          article_id: string | null
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          estimated_minutes: number | null
          id: string
          module_key: string
          module_type: string
          required: boolean
          sort_order: number
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          module_key: string
          module_type?: string
          required?: boolean
          sort_order?: number
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          module_key?: string
          module_type?: string
          required?: boolean
          sort_order?: number
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress_events: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string
          event_type: string
          id: string
          metadata: Json
          module_id: string | null
          progress_percent: number | null
          team_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id: string
          event_type: string
          id?: string
          metadata?: Json
          module_id?: string | null
          progress_percent?: number | null
          team_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string
          event_type?: string
          id?: string
          metadata?: Json
          module_id?: string | null
          progress_percent?: number | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_events_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_events_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          customer_user_id: string | null
          enrollment_id: string | null
          feedback: Json
          id: string
          partner_member_id: string | null
          quiz_id: string
          score: number | null
          started_at: string
          status: string
          submitted_at: string | null
          team_id: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string
          customer_user_id?: string | null
          enrollment_id?: string | null
          feedback?: Json
          id?: string
          partner_member_id?: string | null
          quiz_id: string
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          team_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          customer_user_id?: string | null
          enrollment_id?: string | null
          feedback?: Json
          id?: string
          partner_member_id?: string | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "training_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          max_attempts: number
          module_id: string | null
          passing_score: number
          questions: Json
          shuffle_questions: boolean
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_attempts?: number
          module_id?: string | null
          passing_score?: number
          questions?: Json
          shuffle_questions?: boolean
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_attempts?: number
          module_id?: string | null
          passing_score?: number
          questions?: Json
          shuffle_questions?: boolean
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_access_policies: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          name: string
          policy_type: string
          priority: number
          rules: Json
          team_id: string | null
          trust_center_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          name: string
          policy_type: string
          priority?: number
          rules?: Json
          team_id?: string | null
          trust_center_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          name?: string
          policy_type?: string
          priority?: number
          rules?: Json
          team_id?: string | null
          trust_center_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_access_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_access_policies_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_center_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          status_page_id: string | null
          team_id: string | null
          title: string
          trust_center_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          status_page_id?: string | null
          team_id?: string | null
          title: string
          trust_center_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          status_page_id?: string | null
          team_id?: string | null
          title?: string
          trust_center_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_center_audit_events_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_center_audit_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_center_audit_events_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_center_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string | null
          title: string
          trust_center_id: string | null
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id?: string | null
          title: string
          trust_center_id?: string | null
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string | null
          title?: string
          trust_center_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_center_reports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_center_reports_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_centers: {
        Row: {
          activated_at: string | null
          brand_name: string | null
          brand_profile_id: string | null
          created_at: string
          created_by: string | null
          custom_domain_id: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          partner_id: string | null
          primary_color: string | null
          privacy_email: string | null
          public_summary: string | null
          security_email: string | null
          status: string
          support_email: string | null
          team_id: string | null
          trust_center_key: string
          trust_url: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          activated_at?: string | null
          brand_name?: string | null
          brand_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          partner_id?: string | null
          primary_color?: string | null
          privacy_email?: string | null
          public_summary?: string | null
          security_email?: string | null
          status?: string
          support_email?: string | null
          team_id?: string | null
          trust_center_key: string
          trust_url?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          activated_at?: string | null
          brand_name?: string | null
          brand_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          partner_id?: string | null
          primary_color?: string | null
          privacy_email?: string | null
          public_summary?: string | null
          security_email?: string | null
          status?: string
          support_email?: string | null
          team_id?: string | null
          trust_center_key?: string
          trust_url?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_centers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_document_access_events: {
        Row: {
          created_at: string
          document_id: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json
          request_id: string | null
          requester_email: string | null
          team_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          request_id?: string | null
          requester_email?: string | null
          team_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          request_id?: string | null
          requester_email?: string | null
          team_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_document_access_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "trust_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_document_access_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "trust_document_access_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_document_access_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_document_access_requests: {
        Row: {
          access_token_hash: string | null
          created_at: string
          decision_note: string | null
          document_id: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          purpose: string | null
          requester_company: string | null
          requester_email: string
          requester_name: string
          requester_title: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          team_id: string | null
          trust_center_id: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          access_token_hash?: string | null
          created_at?: string
          decision_note?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          purpose?: string | null
          requester_company?: string | null
          requester_email: string
          requester_name: string
          requester_title?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          access_token_hash?: string | null
          created_at?: string
          decision_note?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          purpose?: string | null
          requester_company?: string | null
          requester_email?: string
          requester_name?: string
          requester_title?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          team_id?: string | null
          trust_center_id?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_document_access_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "trust_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_document_access_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_document_access_requests_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checksum_sha256: string | null
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string
          effective_date: string | null
          expiry_date: string | null
          external_url: string | null
          file_name: string | null
          id: string
          metadata: Json
          published_at: string | null
          sensitivity_level: string
          status: string
          storage_bucket: string | null
          storage_path: string | null
          team_id: string | null
          title: string
          trust_center_id: string | null
          updated_at: string
          version: string | null
          visibility: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checksum_sha256?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type: string
          effective_date?: string | null
          expiry_date?: string | null
          external_url?: string | null
          file_name?: string | null
          id?: string
          metadata?: Json
          published_at?: string | null
          sensitivity_level?: string
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          team_id?: string | null
          title: string
          trust_center_id?: string | null
          updated_at?: string
          version?: string | null
          visibility?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checksum_sha256?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string
          effective_date?: string | null
          expiry_date?: string | null
          external_url?: string | null
          file_name?: string | null
          id?: string
          metadata?: Json
          published_at?: string | null
          sensitivity_level?: string
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          team_id?: string | null
          title?: string
          trust_center_id?: string | null
          updated_at?: string
          version?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_documents_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_documents_trust_center_id_fkey"
            columns: ["trust_center_id"]
            isOneToOne: false
            referencedRelation: "trust_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_fingerprint: string
          device_name: string
          id: string
          ip_address: string | null
          last_seen_at: string | null
          os: string | null
          revoked_at: string | null
          trusted_at: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_fingerprint: string
          device_name: string
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          os?: string | null
          revoked_at?: string | null
          trusted_at?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          os?: string | null
          revoked_at?: string | null
          trusted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uptime_summaries: {
        Row: {
          calculation_source: string
          component_id: string | null
          created_at: string
          degraded_minutes: number
          id: string
          incident_count: number
          maintenance_minutes: number
          metadata: Json
          outage_minutes: number
          period_end: string
          period_start: string
          status: string
          status_page_id: string
          team_id: string | null
          updated_at: string
          uptime_percent: number | null
        }
        Insert: {
          calculation_source?: string
          component_id?: string | null
          created_at?: string
          degraded_minutes?: number
          id?: string
          incident_count?: number
          maintenance_minutes?: number
          metadata?: Json
          outage_minutes?: number
          period_end: string
          period_start: string
          status?: string
          status_page_id: string
          team_id?: string | null
          updated_at?: string
          uptime_percent?: number | null
        }
        Update: {
          calculation_source?: string
          component_id?: string | null
          created_at?: string
          degraded_minutes?: number
          id?: string
          incident_count?: number
          maintenance_minutes?: number
          metadata?: Json
          outage_minutes?: number
          period_end?: string
          period_start?: string
          status?: string
          status_page_id?: string
          team_id?: string | null
          updated_at?: string
          uptime_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "uptime_summaries_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "status_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uptime_summaries_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uptime_summaries_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          metric_key: string
          metric_value: number
          period_end: string
          period_start: string
          source: string
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          metric_key: string
          metric_value?: number
          period_end: string
          period_start: string
          source?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          metric_key?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          source?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          created_at: string
          disabled_reason: string | null
          id: string
          last_disabled_at: string | null
          last_verified_at: string | null
          mfa_enabled: boolean
          recovery_codes_generated_at: string | null
          recovery_codes_remaining: number
          totp_enrolled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled_reason?: string | null
          id?: string
          last_disabled_at?: string | null
          last_verified_at?: string | null
          mfa_enabled?: boolean
          recovery_codes_generated_at?: string | null
          recovery_codes_remaining?: number
          totp_enrolled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled_reason?: string | null
          id?: string
          last_disabled_at?: string | null
          last_verified_at?: string | null
          mfa_enabled?: boolean
          recovery_codes_generated_at?: string | null
          recovery_codes_remaining?: number
          totp_enrolled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      warranty_records: {
        Row: {
          asset_id: string
          claim_url: string | null
          created_at: string
          end_date: string | null
          id: string
          metadata: Json
          notes: string | null
          start_date: string | null
          status: string
          support_contact: string | null
          team_id: string
          updated_at: string
          vendor_id: string | null
          warranty_reference: string | null
          warranty_type: string
        }
        Insert: {
          asset_id: string
          claim_url?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          start_date?: string | null
          status?: string
          support_contact?: string | null
          team_id: string
          updated_at?: string
          vendor_id?: string | null
          warranty_reference?: string | null
          warranty_type?: string
        }
        Update: {
          asset_id?: string
          claim_url?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          start_date?: string | null
          status?: string
          support_contact?: string | null
          team_id?: string
          updated_at?: string
          vendor_id?: string | null
          warranty_reference?: string | null
          warranty_type?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          endpoint_id: string
          error_message?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          endpoint_id?: string
          error_message?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          last_delivery_at: string | null
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          secret_hash: string | null
          status: string
          team_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          last_delivery_at?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          name: string
          secret_hash?: string | null
          status?: string
          team_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          last_delivery_at?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          name?: string
          secret_hash?: string | null
          status?: string
          team_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          resource_id: string | null
          resource_type: string | null
          source: string
          team_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          resource_id?: string | null
          resource_type?: string | null
          source?: string
          team_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          resource_id?: string | null
          resource_type?: string | null
          source?: string
          team_id?: string
        }
        Relationships: []
      }
      workflow_action_runs: {
        Row: {
          action_id: string
          app_id: string | null
          approval_request_id: string | null
          created_at: string
          error_message: string | null
          finished_at: string | null
          form_submission_id: string | null
          id: string
          input: Json
          output: Json
          page_id: string | null
          started_at: string | null
          status: string
          team_id: string
          triggered_by: string | null
          triggered_source: string
          updated_at: string
          workflow_run_id: string | null
        }
        Insert: {
          action_id: string
          app_id?: string | null
          approval_request_id?: string | null
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          form_submission_id?: string | null
          id?: string
          input?: Json
          output?: Json
          page_id?: string | null
          started_at?: string | null
          status?: string
          team_id: string
          triggered_by?: string | null
          triggered_source?: string
          updated_at?: string
          workflow_run_id?: string | null
        }
        Update: {
          action_id?: string
          app_id?: string | null
          approval_request_id?: string | null
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          form_submission_id?: string | null
          id?: string
          input?: Json
          output?: Json
          page_id?: string | null
          started_at?: string | null
          status?: string
          team_id?: string
          triggered_by?: string | null
          triggered_source?: string
          updated_at?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_action_runs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "workflow_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_actions: {
        Row: {
          action_key: string
          action_type: string
          allowed_roles: string[]
          app_id: string | null
          approval_type: string | null
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_schema: Json
          name: string
          requires_approval: boolean
          risk_level: string
          status: string
          team_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_key: string
          action_type: string
          allowed_roles?: string[]
          app_id?: string | null
          approval_type?: string | null
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_schema?: Json
          name: string
          requires_approval?: boolean
          risk_level?: string
          status?: string
          team_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_key?: string
          action_type?: string
          allowed_roles?: string[]
          app_id?: string | null
          approval_type?: string | null
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_schema?: Json
          name?: string
          requires_approval?: boolean
          risk_level?: string
          status?: string
          team_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_app_pages: {
        Row: {
          app_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          layout: Json
          name: string
          page_key: string
          page_type: string
          route_slug: string | null
          sort_order: number
          status: string
          team_id: string
          updated_at: string
          visibility_rules: Json
        }
        Insert: {
          app_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          layout?: Json
          name: string
          page_key: string
          page_type?: string
          route_slug?: string | null
          sort_order?: number
          status?: string
          team_id: string
          updated_at?: string
          visibility_rules?: Json
        }
        Update: {
          app_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          layout?: Json
          name?: string
          page_key?: string
          page_type?: string
          route_slug?: string | null
          sort_order?: number
          status?: string
          team_id?: string
          updated_at?: string
          visibility_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workflow_app_pages_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_app_permissions: {
        Row: {
          app_id: string
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          permission: string
          principal_id: string | null
          principal_type: string
          role_name: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          app_id: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permission: string
          principal_id?: string | null
          principal_type?: string
          role_name?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: string
          principal_id?: string | null
          principal_type?: string
          role_name?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_app_permissions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_apps: {
        Row: {
          app_key: string
          app_type: string
          created_at: string
          created_by: string | null
          description: string | null
          home_page_id: string | null
          icon: string | null
          id: string
          layout: Json
          name: string
          owner_user_id: string | null
          published_at: string | null
          published_by: string | null
          status: string
          team_id: string
          theme: Json
          updated_at: string
          updated_by: string | null
          visibility: string
        }
        Insert: {
          app_key: string
          app_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          home_page_id?: string | null
          icon?: string | null
          id?: string
          layout?: Json
          name: string
          owner_user_id?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: string
          team_id: string
          theme?: Json
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Update: {
          app_key?: string
          app_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          home_page_id?: string | null
          icon?: string | null
          id?: string
          layout?: Json
          name?: string
          owner_user_id?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: string
          team_id?: string
          theme?: Json
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Relationships: []
      }
      workflow_audit_events: {
        Row: {
          actor_id: string | null
          app_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          severity: string
          team_id: string
          title: string
          workflow_run_id: string | null
        }
        Insert: {
          actor_id?: string | null
          app_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id: string
          title: string
          workflow_run_id?: string | null
        }
        Update: {
          actor_id?: string | null
          app_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          team_id?: string
          title?: string
          workflow_run_id?: string | null
        }
        Relationships: []
      }
      workflow_components: {
        Row: {
          action_id: string | null
          app_id: string
          component_key: string
          component_type: string
          config: Json
          created_at: string
          data_binding_id: string | null
          id: string
          page_id: string
          sort_order: number
          status: string
          team_id: string
          title: string | null
          updated_at: string
          visibility_rules: Json
        }
        Insert: {
          action_id?: string | null
          app_id: string
          component_key: string
          component_type: string
          config?: Json
          created_at?: string
          data_binding_id?: string | null
          id?: string
          page_id: string
          sort_order?: number
          status?: string
          team_id: string
          title?: string | null
          updated_at?: string
          visibility_rules?: Json
        }
        Update: {
          action_id?: string | null
          app_id?: string
          component_key?: string
          component_type?: string
          config?: Json
          created_at?: string
          data_binding_id?: string | null
          id?: string
          page_id?: string
          sort_order?: number
          status?: string
          team_id?: string
          title?: string | null
          updated_at?: string
          visibility_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workflow_components_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_components_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "workflow_app_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_data_bindings: {
        Row: {
          allowed_operations: string[]
          app_id: string | null
          binding_key: string
          created_at: string
          created_by: string | null
          description: string | null
          fields: Json
          filters: Json
          id: string
          name: string
          resource_type: string | null
          sensitivity_level: string
          sort_config: Json
          source_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          allowed_operations?: string[]
          app_id?: string | null
          binding_key: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          fields?: Json
          filters?: Json
          id?: string
          name: string
          resource_type?: string | null
          sensitivity_level?: string
          sort_config?: Json
          source_type?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          allowed_operations?: string[]
          app_id?: string | null
          binding_key?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          fields?: Json
          filters?: Json
          id?: string
          name?: string
          resource_type?: string | null
          sensitivity_level?: string
          sort_config?: Json
          source_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_data_bindings_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_form_definitions: {
        Row: {
          allow_customer_submit: boolean
          allow_partner_submit: boolean
          app_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          form_key: string
          form_type: string
          id: string
          name: string
          page_id: string | null
          requires_auth: boolean
          schema: Json
          status: string
          submission_target_config: Json
          submission_target_type: string
          team_id: string
          updated_at: string
          updated_by: string | null
          validation_rules: Json
        }
        Insert: {
          allow_customer_submit?: boolean
          allow_partner_submit?: boolean
          app_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          form_key: string
          form_type?: string
          id?: string
          name: string
          page_id?: string | null
          requires_auth?: boolean
          schema?: Json
          status?: string
          submission_target_config?: Json
          submission_target_type?: string
          team_id: string
          updated_at?: string
          updated_by?: string | null
          validation_rules?: Json
        }
        Update: {
          allow_customer_submit?: boolean
          allow_partner_submit?: boolean
          app_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          form_key?: string
          form_type?: string
          id?: string
          name?: string
          page_id?: string | null
          requires_auth?: boolean
          schema?: Json
          status?: string
          submission_target_config?: Json
          submission_target_type?: string
          team_id?: string
          updated_at?: string
          updated_by?: string | null
          validation_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workflow_form_definitions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_form_definitions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "workflow_app_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_form_submissions: {
        Row: {
          app_id: string | null
          created_at: string
          form_id: string
          id: string
          linked_resource_id: string | null
          linked_resource_type: string | null
          metadata: Json
          page_id: string | null
          payload: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          submitter_customer_user_id: string | null
          submitter_partner_member_id: string | null
          submitter_user_id: string | null
          team_id: string
          updated_at: string
          validation_result: Json
          workflow_run_id: string | null
        }
        Insert: {
          app_id?: string | null
          created_at?: string
          form_id: string
          id?: string
          linked_resource_id?: string | null
          linked_resource_type?: string | null
          metadata?: Json
          page_id?: string | null
          payload?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitter_customer_user_id?: string | null
          submitter_partner_member_id?: string | null
          submitter_user_id?: string | null
          team_id: string
          updated_at?: string
          validation_result?: Json
          workflow_run_id?: string | null
        }
        Update: {
          app_id?: string | null
          created_at?: string
          form_id?: string
          id?: string
          linked_resource_id?: string | null
          linked_resource_type?: string | null
          metadata?: Json
          page_id?: string | null
          payload?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitter_customer_user_id?: string | null
          submitter_partner_member_id?: string | null
          submitter_user_id?: string | null
          team_id?: string
          updated_at?: string
          validation_result?: Json
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "workflow_form_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_published_routes: {
        Row: {
          allowed_visibility: string
          app_id: string
          created_at: string
          expires_at: string | null
          id: string
          published_at: string
          published_by: string | null
          requires_auth: boolean
          route_slug: string
          route_type: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          allowed_visibility?: string
          app_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          published_at?: string
          published_by?: string | null
          requires_auth?: boolean
          route_slug: string
          route_type?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          allowed_visibility?: string
          app_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          published_at?: string
          published_by?: string | null
          requires_auth?: boolean
          route_slug?: string
          route_type?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_published_routes_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_reports: {
        Row: {
          artifact_id: string | null
          created_at: string
          error_message: string | null
          filters: Json
          id: string
          output: Json
          report_type: string
          requested_by: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type: string
          requested_by?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          error_message?: string | null
          filters?: Json
          id?: string
          output?: Json
          report_type?: string
          requested_by?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_run_steps: {
        Row: {
          action_run_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          due_at: string | null
          error_message: string | null
          id: string
          output: Json
          started_at: string | null
          status: string
          step_key: string
          step_type: string
          team_id: string
          title: string
          updated_at: string
          workflow_run_id: string
        }
        Insert: {
          action_run_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          error_message?: string | null
          id?: string
          output?: Json
          started_at?: string | null
          status?: string
          step_key: string
          step_type?: string
          team_id: string
          title: string
          updated_at?: string
          workflow_run_id: string
        }
        Update: {
          action_run_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          error_message?: string | null
          id?: string
          output?: Json
          started_at?: string | null
          status?: string
          step_key?: string
          step_type?: string
          team_id?: string
          title?: string
          updated_at?: string
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_run_steps_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          app_id: string | null
          completed_at: string | null
          created_at: string
          current_state: string | null
          customer_account_id: string | null
          description: string | null
          due_at: string | null
          id: string
          initiated_by: string | null
          machine_id: string | null
          metadata: Json
          partner_client_team_id: string | null
          priority: string
          resource_id: string | null
          resource_type: string | null
          run_key: string | null
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          app_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_state?: string | null
          customer_account_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          initiated_by?: string | null
          machine_id?: string | null
          metadata?: Json
          partner_client_team_id?: string | null
          priority?: string
          resource_id?: string | null
          resource_type?: string | null
          run_key?: string | null
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          app_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_state?: string | null
          customer_account_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          initiated_by?: string | null
          machine_id?: string | null
          metadata?: Json
          partner_client_team_id?: string | null
          priority?: string
          resource_id?: string | null
          resource_type?: string | null
          run_key?: string | null
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "workflow_state_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_state_machines: {
        Row: {
          app_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          initial_state: string | null
          machine_key: string
          name: string
          resource_type: string | null
          states: Json
          status: string
          team_id: string
          terminal_states: string[]
          transitions: Json
          updated_at: string
        }
        Insert: {
          app_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          initial_state?: string | null
          machine_key: string
          name: string
          resource_type?: string | null
          states?: Json
          status?: string
          team_id: string
          terminal_states?: string[]
          transitions?: Json
          updated_at?: string
        }
        Update: {
          app_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          initial_state?: string | null
          machine_key?: string
          name?: string
          resource_type?: string | null
          states?: Json
          status?: string
          team_id?: string
          terminal_states?: string[]
          transitions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_state_machines_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "workflow_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          team_id: string | null
          template_config: Json
          template_key: string
          template_type: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          team_id?: string | null
          template_config?: Json
          template_key: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          team_id?: string | null
          template_config?: Json
          template_key?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _automation_compute_next_run: {
        Args: {
          _cron: string
          _from?: string
          _interval_minutes: number
          _schedule_type: string
        }
        Returns: string
      }
      _check_automation_rate_limit: {
        Args: { _pipeline_id: string; _scope: string; _team_id: string }
        Returns: boolean
      }
      _compute_connection_quality: {
        Args: { _latency: number; _loss: number }
        Returns: string
      }
      accept_team_invitation: {
        Args: { invite_token: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
        }[]
      }
      apply_billing_change_request: {
        Args: { _request_id: string }
        Returns: undefined
      }
      apply_subscription_from_webhook: {
        Args: {
          _cancel_at_period_end: boolean
          _current_period_end: string
          _interval: string
          _plan: string
          _seats: number
          _status: string
          _stripe_customer_id: string
          _stripe_subscription_id: string
          _team_id: string
        }
        Returns: undefined
      }
      archive_automation_pipeline: {
        Args: { p_pipeline_id: string }
        Returns: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_schema: Json | null
          last_run_at: string | null
          mode: string
          name: string
          next_run_at: string | null
          output_schema: Json | null
          stages: Json
          status: string
          steps: Json | null
          system_id: string | null
          team_id: string | null
          trigger_type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipelines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      can_access_partner_client: {
        Args: {
          p_client_team_id: string
          p_partner_id: string
          p_user_id?: string
        }
        Returns: boolean
      }
      can_triage_ticket: { Args: { _ticket_id: string }; Returns: boolean }
      can_view_ticket: { Args: { _ticket_id: string }; Returns: boolean }
      claim_next_automation_task: {
        Args: { p_team_id?: string }
        Returns: {
          assigned_account_id: string | null
          attempts: number
          created_at: string
          created_by: string | null
          current_stage: number
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          max_attempts: number
          name: string | null
          output_payload: Json | null
          pipeline_id: string | null
          priority: string
          progress: number
          prompt: string
          run_id: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string
          team_id: string | null
          title: string
          type: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_next_webhook_delivery: {
        Args: never
        Returns: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          team_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_automation_run: {
        Args: { p_output?: Json; p_run_id: string }
        Returns: {
          checkpoint: Json | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          metadata: Json
          output: Json
          pipeline_id: string | null
          stage_results: Json
          started_at: string | null
          status: string
          task_id: string | null
          team_id: string | null
          trigger_source: string
          triggered_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipeline_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_automation_task: {
        Args: { p_output?: Json; p_task_id: string }
        Returns: {
          assigned_account_id: string | null
          attempts: number
          created_at: string
          created_by: string | null
          current_stage: number
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          max_attempts: number
          name: string | null
          output_payload: Json | null
          pipeline_id: string | null
          priority: string
          progress: number
          prompt: string
          run_id: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string
          team_id: string | null
          title: string
          type: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_api_key: {
        Args: {
          _expires_at?: string
          _key_hash: string
          _key_prefix: string
          _name: string
          _scopes?: string[]
          _team_id: string
        }
        Returns: string
      }
      create_automation_pipeline: {
        Args: {
          p_config?: Json
          p_description?: string
          p_name: string
          p_steps?: Json
          p_team_id: string
          p_trigger_type?: string
        }
        Returns: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_schema: Json | null
          last_run_at: string | null
          mode: string
          name: string
          next_run_at: string | null
          output_schema: Json | null
          stages: Json
          status: string
          steps: Json | null
          system_id: string | null
          team_id: string | null
          trigger_type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipelines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_device_id?: string
          p_message?: string
          p_metadata?: Json
          p_session_id?: string
          p_severity?: string
          p_team_id: string
          p_title?: string
          p_type?: string
          p_user_id?: string
        }
        Returns: {
          action_url: string | null
          archived_at: string | null
          created_at: string
          device_id: string | null
          id: string
          message: string
          metadata: Json
          read_at: string | null
          rule_id: string | null
          session_id: string | null
          severity: string
          team_id: string
          title: string
          type: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_scheduler_rule: {
        Args: {
          p_cron_expression?: string
          p_interval_minutes?: number
          p_name: string
          p_pipeline_id: string
          p_schedule_type: string
          p_timezone?: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          cron_expression: string | null
          enabled: boolean
          heavy_task_window: Json | null
          id: string
          interval_minutes: number | null
          last_run_at: string | null
          light_task_window: Json | null
          name: string
          next_run_at: string | null
          pipeline_id: string | null
          schedule_type: string
          team_id: string | null
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_scheduler_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_webhook_endpoint: {
        Args: {
          p_events: string[]
          p_name: string
          p_secret_hash?: string
          p_url: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          last_delivery_at: string | null
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          secret_hash: string | null
          status: string
          team_id: string
          updated_at: string
          url: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_endpoints"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_webhook_event: {
        Args: {
          p_event_type: string
          p_payload?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_team_id: string
        }
        Returns: string
      }
      disable_mfa: {
        Args: { p_reason?: string }
        Returns: {
          created_at: string
          disabled_reason: string | null
          id: string
          last_disabled_at: string | null
          last_verified_at: string | null
          mfa_enabled: boolean
          recovery_codes_generated_at: string | null
          recovery_codes_remaining: number
          totp_enrolled: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_mfa_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      disable_webhook_endpoint: {
        Args: { p_endpoint_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          last_delivery_at: string | null
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          secret_hash: string | null
          status: string
          team_id: string
          updated_at: string
          url: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_endpoints"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      enable_mfa_after_verification: {
        Args: never
        Returns: {
          created_at: string
          disabled_reason: string | null
          id: string
          last_disabled_at: string | null
          last_verified_at: string | null
          mfa_enabled: boolean
          recovery_codes_generated_at: string | null
          recovery_codes_remaining: number
          totp_enrolled: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_mfa_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      end_remote_session: {
        Args: { _reason?: string; _session_id: string }
        Returns: undefined
      }
      enqueue_due_scheduled_runs: { Args: never; Returns: number }
      enqueue_test_webhook_delivery: {
        Args: { p_endpoint_id: string }
        Returns: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          team_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fail_automation_run: {
        Args: { p_error_message: string; p_output?: Json; p_run_id: string }
        Returns: {
          checkpoint: Json | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          metadata: Json
          output: Json
          pipeline_id: string | null
          stage_results: Json
          started_at: string | null
          status: string
          task_id: string | null
          team_id: string | null
          trigger_source: string
          triggered_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipeline_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fail_automation_task: {
        Args: { p_error_message: string; p_retry?: boolean; p_task_id: string }
        Returns: {
          assigned_account_id: string | null
          attempts: number
          created_at: string
          created_by: string | null
          current_stage: number
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          max_attempts: number
          name: string | null
          output_payload: Json | null
          pipeline_id: string | null
          priority: string
          progress: number
          prompt: string
          run_id: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string
          team_id: string | null
          title: string
          type: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_device_health_report: {
        Args: { p_run_id?: string; p_team_id: string }
        Returns: {
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          pipeline_id: string | null
          pipeline_run_id: string | null
          preview: string | null
          size_bytes: number | null
          storage_path: string | null
          task_id: string | null
          team_id: string | null
          type: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_artifacts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_recovery_codes: {
        Args: { p_code_hashes: string[] }
        Returns: number
      }
      get_automation_dashboard_summary: {
        Args: never
        Returns: {
          active_pipelines: number
          failed_runs_24h: number
          failed_tasks_24h: number
          latest_run_at: string
          next_scheduled_run_at: string
          paused_pipelines: number
          queued_runs: number
          queued_tasks: number
          running_runs: number
          successful_runs_24h: number
        }[]
      }
      get_developer_overview: {
        Args: { p_team_id: string }
        Returns: {
          active_keys: number
          failed_requests_24h: number
          rate_limited_24h: number
          requests_24h: number
          revoked_keys: number
          total_keys: number
          webhook_deliveries_24h: number
          webhook_endpoints: number
          webhook_failed_24h: number
          webhook_success_24h: number
        }[]
      }
      get_device_presence_summary: {
        Args: never
        Returns: {
          active_sessions: number
          busy_devices: number
          idle_devices: number
          last_updated_at: string
          offline_devices: number
          online_devices: number
          poor_quality_devices: number
          total_devices: number
        }[]
      }
      get_my_security_overview: {
        Args: never
        Returns: {
          active_sessions_count: number
          last_mfa_verified_at: string
          last_security_event_at: string
          mfa_enabled: boolean
          recovery_codes_remaining: number
          security_score: number
          totp_enrolled: boolean
          trusted_devices_count: number
        }[]
      }
      get_team_security_posture: {
        Args: { p_team_id: string }
        Returns: {
          members_with_mfa: number
          members_without_mfa: number
          recent_security_events: number
          risky_sessions: number
          stale_trusted_devices: number
          total_members: number
        }[]
      }
      has_partner_role: {
        Args: { p_partner_id: string; p_role: string; p_user_id?: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_ai_governance_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_bi_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_billing_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_command_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_customer_success_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_data_governance_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_deployment_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_identity_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_integration_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_knowledge_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_launch_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_marketplace_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_mobile_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_observability_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_partner_admin: {
        Args: { p_partner_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_partner_member: {
        Args: { p_partner_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_procurement_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_trust_center_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_workflow_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      log_api_request: {
        Args: {
          p_api_key_id: string
          p_error_code?: string
          p_error_message?: string
          p_ip?: unknown
          p_latency_ms?: number
          p_metadata?: Json
          p_method: string
          p_path: string
          p_request_id: string
          p_status_code: number
          p_team_id: string
          p_user_agent?: string
        }
        Returns: string
      }
      map_invite_role: {
        Args: { _role: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_device_offline: {
        Args: { p_device_id: string; p_reason?: string }
        Returns: {
          active_session_id: string | null
          active_user_id: string | null
          battery_percent: number | null
          client_version: string | null
          connection_quality: string
          cpu_load: number | null
          created_at: string
          device_id: string
          heartbeat_at: string | null
          id: string
          ip_address: unknown
          last_seen_at: string | null
          latency_ms: number | null
          memory_load: number | null
          metadata: Json
          network_type: string | null
          os_version: string | null
          packet_loss: number | null
          platform: string | null
          region: string | null
          status: string
          team_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "device_presence"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: {
          action_url: string | null
          archived_at: string | null
          created_at: string
          device_id: string | null
          id: string
          message: string
          metadata: Json
          read_at: string | null
          rule_id: string | null
          session_id: string | null
          severity: string
          team_id: string
          title: string
          type: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_webhook_delivery_failed: {
        Args: {
          p_delivery_id: string
          p_error_message: string
          p_response_body?: string
          p_response_status?: number
        }
        Returns: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          team_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_webhook_delivery_success: {
        Args: {
          p_delivery_id: string
          p_response_body?: string
          p_response_status?: number
        }
        Returns: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          endpoint_id: string
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          team_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_team_ids: { Args: { _user_id: string }; Returns: string[] }
      record_api_rate_limit_event: {
        Args: {
          p_allowed: boolean
          p_api_key_id: string
          p_limit_count?: number
          p_limit_key: string
          p_metadata?: Json
          p_reason?: string
          p_remaining?: number
          p_reset_at?: string
          p_scope: string
          p_team_id: string
        }
        Returns: string
      }
      record_automation_log: {
        Args: {
          p_context?: Json
          p_level?: string
          p_message: string
          p_pipeline_id?: string
          p_run_id?: string
          p_task_id?: string
        }
        Returns: {
          category: string | null
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json
          pipeline_id: string | null
          run_id: string | null
          system_id: string | null
          task_id: string | null
          team_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "automation_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_mfa_enrollment_started: { Args: never; Returns: undefined }
      reject_billing_change_request: {
        Args: { _reason?: string; _request_id: string }
        Returns: undefined
      }
      request_billing_change: {
        Args: {
          _billing_interval?: string
          _note?: string
          _to_plan: string
          _to_seats: number
        }
        Returns: string
      }
      revoke_api_key: { Args: { _key_id: string }; Returns: undefined }
      revoke_team_invitation: {
        Args: { invitation_id: string }
        Returns: undefined
      }
      run_automation_pipeline: {
        Args: {
          p_input?: Json
          p_pipeline_id: string
          p_trigger_source?: string
        }
        Returns: {
          checkpoint: Json | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          metadata: Json
          output: Json
          pipeline_id: string | null
          stage_results: Json
          started_at: string | null
          status: string
          task_id: string | null
          team_id: string | null
          trigger_source: string
          triggered_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipeline_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_subscription_seats: { Args: { _seats: number }; Returns: undefined }
      set_team_member_status: {
        Args: { member_id: string; new_status: string }
        Returns: undefined
      }
      start_automation_run: {
        Args: { p_run_id: string }
        Returns: {
          checkpoint: Json | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input: Json
          metadata: Json
          output: Json
          pipeline_id: string | null
          stage_results: Json
          started_at: string | null
          status: string
          task_id: string | null
          team_id: string | null
          trigger_source: string
          triggered_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipeline_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_remote_session: {
        Args: { _device_id: string }
        Returns: {
          expires_at: string
          session_id: string
          token: string
        }[]
      }
      update_automation_pipeline: {
        Args: {
          p_config?: Json
          p_description?: string
          p_name?: string
          p_pipeline_id: string
          p_status?: string
          p_steps?: Json
          p_trigger_type?: string
        }
        Returns: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_schema: Json | null
          last_run_at: string | null
          mode: string
          name: string
          next_run_at: string | null
          output_schema: Json | null
          stages: Json
          status: string
          steps: Json | null
          system_id: string | null
          team_id: string | null
          trigger_type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_pipelines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_scheduler_rule: {
        Args: {
          p_cron_expression?: string
          p_enabled?: boolean
          p_interval_minutes?: number
          p_rule_id: string
          p_schedule_type?: string
          p_timezone?: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          cron_expression: string | null
          enabled: boolean
          heavy_task_window: Json | null
          id: string
          interval_minutes: number | null
          last_run_at: string | null
          light_task_window: Json | null
          name: string
          next_run_at: string | null
          pipeline_id: string | null
          schedule_type: string
          team_id: string | null
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_scheduler_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_team_member_role: {
        Args: { member_id: string; new_role: string }
        Returns: undefined
      }
      update_webhook_endpoint: {
        Args: {
          p_endpoint_id: string
          p_events?: string[]
          p_name?: string
          p_status?: string
          p_url?: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          last_delivery_at: string | null
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          secret_hash: string | null
          status: string
          team_id: string
          updated_at: string
          url: string
        }
        SetofOptions: {
          from: "*"
          to: "webhook_endpoints"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_device_presence: {
        Args: {
          p_battery_percent?: number
          p_client_version?: string
          p_cpu_load?: number
          p_device_id: string
          p_heartbeat_at?: string
          p_latency_ms?: number
          p_memory_load?: number
          p_metadata?: Json
          p_network_type?: string
          p_os_version?: string
          p_packet_loss?: number
          p_platform?: string
          p_status: string
        }
        Returns: {
          active_session_id: string | null
          active_user_id: string | null
          battery_percent: number | null
          client_version: string | null
          connection_quality: string
          cpu_load: number | null
          created_at: string
          device_id: string
          heartbeat_at: string | null
          id: string
          ip_address: unknown
          last_seen_at: string | null
          latency_ms: number | null
          memory_load: number | null
          metadata: Json
          network_type: string | null
          os_version: string | null
          packet_loss: number | null
          platform: string | null
          region: string | null
          status: string
          team_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "device_presence"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_invoice_from_webhook: {
        Args: {
          _amount_cents: number
          _currency: string
          _issued_at: string
          _number: string
          _pdf_url: string
          _status: string
          _team_id: string
        }
        Returns: string
      }
      verify_api_key_for_request: {
        Args: { _key_hash: string; _required_scope?: string }
        Returns: {
          api_key_id: string
          scopes: string[]
          status: string
          team_id: string
        }[]
      }
      verify_api_key_hash: {
        Args: { _key_hash: string }
        Returns: {
          expired: boolean
          id: string
          revoked: boolean
          scopes: string[]
          team_id: string
        }[]
      }
      verify_recovery_code: { Args: { p_code_hash: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "support" | "member"
      audit_severity: "info" | "warn" | "critical"
      device_os: "windows" | "macos" | "linux"
      device_status: "online" | "offline"
      plan_tier: "free" | "pro" | "business" | "enterprise"
      session_quality: "good" | "fair" | "poor"
      session_status: "connected" | "ended" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "support", "member"],
      audit_severity: ["info", "warn", "critical"],
      device_os: ["windows", "macos", "linux"],
      device_status: ["online", "offline"],
      plan_tier: ["free", "pro", "business", "enterprise"],
      session_quality: ["good", "fair", "poor"],
      session_status: ["connected", "ended", "rejected"],
    },
  },
} as const
