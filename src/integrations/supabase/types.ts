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
          scopes: string[]
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
          scopes?: string[]
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
          scopes?: string[]
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
          created_at: string
          id: string
          name: string
          pipeline_run_id: string | null
          preview: string | null
          size_bytes: number | null
          storage_path: string | null
          task_id: string | null
          team_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pipeline_run_id?: string | null
          preview?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          task_id?: string | null
          team_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
          finished_at: string | null
          id: string
          pipeline_id: string | null
          stage_results: Json
          started_at: string | null
          status: string
          task_id: string | null
          team_id: string | null
        }
        Insert: {
          checkpoint?: Json | null
          created_at?: string
          duration_ms?: number | null
          finished_at?: string | null
          id?: string
          pipeline_id?: string | null
          stage_results?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
          team_id?: string | null
        }
        Update: {
          checkpoint?: Json | null
          created_at?: string
          duration_ms?: number | null
          finished_at?: string | null
          id?: string
          pipeline_id?: string | null
          stage_results?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
          team_id?: string | null
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
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_schema: Json | null
          mode: string
          name: string
          output_schema: Json | null
          stages: Json
          status: string
          system_id: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          mode?: string
          name: string
          output_schema?: Json | null
          stages?: Json
          status?: string
          system_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          mode?: string
          name?: string
          output_schema?: Json | null
          stages?: Json
          status?: string
          system_id?: string | null
          team_id?: string | null
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
          cooldown_seconds: number | null
          detected_at: string
          id: string
          message: string | null
          provider: string | null
          resolved_at: string | null
          severity: string
          signal: string | null
          team_id: string | null
        }
        Insert: {
          account_id?: string | null
          cooldown_seconds?: number | null
          detected_at?: string
          id?: string
          message?: string | null
          provider?: string | null
          resolved_at?: string | null
          severity?: string
          signal?: string | null
          team_id?: string | null
        }
        Update: {
          account_id?: string | null
          cooldown_seconds?: number | null
          detected_at?: string
          id?: string
          message?: string | null
          provider?: string | null
          resolved_at?: string | null
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
          light_task_window: Json | null
          name: string
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
          light_task_window?: Json | null
          name: string
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
          light_task_window?: Json | null
          name?: string
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
          created_at: string
          created_by: string | null
          current_stage: number
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          output_payload: Json | null
          pipeline_id: string | null
          priority: string
          progress: number
          prompt: string
          scheduled_for: string | null
          started_at: string | null
          status: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_account_id?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: number
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          output_payload?: Json | null
          pipeline_id?: string | null
          priority?: string
          progress?: number
          prompt: string
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_account_id?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: number
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          output_payload?: Json | null
          pipeline_id?: string | null
          priority?: string
          progress?: number
          prompt?: string
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          team_id?: string | null
          title?: string
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
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          closed_at: string | null
          created_at: string
          description: string
          id: string
          priority: string
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
          description: string
          id?: string
          priority?: string
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
          description?: string
          id?: string
          priority?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      can_triage_ticket: { Args: { _ticket_id: string }; Returns: boolean }
      can_view_ticket: { Args: { _ticket_id: string }; Returns: boolean }
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
      end_remote_session: {
        Args: { _reason?: string; _session_id: string }
        Returns: undefined
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
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
      my_team_ids: { Args: { _user_id: string }; Returns: string[] }
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
      set_subscription_seats: { Args: { _seats: number }; Returns: undefined }
      set_team_member_status: {
        Args: { member_id: string; new_status: string }
        Returns: undefined
      }
      start_remote_session: {
        Args: { _device_id: string }
        Returns: {
          expires_at: string
          session_id: string
          token: string
        }[]
      }
      update_team_member_role: {
        Args: { member_id: string; new_role: string }
        Returns: undefined
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
