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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_observability_manager: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
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
