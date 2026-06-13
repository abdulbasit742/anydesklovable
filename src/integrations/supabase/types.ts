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
      devices: {
        Row: {
          client_version: string | null
          cpu: string | null
          created_at: string
          device_password_hash: string | null
          id: string
          ip: unknown
          last_seen: string | null
          name: string
          os: Database["public"]["Enums"]["device_os"]
          os_version: string | null
          owner_id: string
          ram: string | null
          remote_desk_id: string
          status: Database["public"]["Enums"]["device_status"]
          tags: string[]
          team_id: string
        }
        Insert: {
          client_version?: string | null
          cpu?: string | null
          created_at?: string
          device_password_hash?: string | null
          id?: string
          ip?: unknown
          last_seen?: string | null
          name: string
          os: Database["public"]["Enums"]["device_os"]
          os_version?: string | null
          owner_id: string
          ram?: string | null
          remote_desk_id: string
          status?: Database["public"]["Enums"]["device_status"]
          tags?: string[]
          team_id: string
        }
        Update: {
          client_version?: string | null
          cpu?: string | null
          created_at?: string
          device_password_hash?: string | null
          id?: string
          ip?: unknown
          last_seen?: string | null
          name?: string
          os?: Database["public"]["Enums"]["device_os"]
          os_version?: string | null
          owner_id?: string
          ram?: string | null
          remote_desk_id?: string
          status?: Database["public"]["Enums"]["device_status"]
          tags?: string[]
          team_id?: string
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
          host_user_id: string | null
          id: string
          latency_ms: number | null
          packet_loss_pct: number | null
          quality: Database["public"]["Enums"]["session_quality"] | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          team_id: string
          viewer_user_id: string | null
        }
        Insert: {
          bitrate_kbps?: number | null
          device_id: string
          end_reason?: string | null
          ended_at?: string | null
          host_user_id?: string | null
          id?: string
          latency_ms?: number | null
          packet_loss_pct?: number | null
          quality?: Database["public"]["Enums"]["session_quality"] | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id: string
          viewer_user_id?: string | null
        }
        Update: {
          bitrate_kbps?: number | null
          device_id?: string
          end_reason?: string | null
          ended_at?: string | null
          host_user_id?: string | null
          id?: string
          latency_ms?: number | null
          packet_loss_pct?: number | null
          quality?: Database["public"]["Enums"]["session_quality"] | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id?: string
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
      accept_team_invitation: {
        Args: { invite_token: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
        }[]
      }
      can_triage_ticket: { Args: { _ticket_id: string }; Returns: boolean }
      can_view_ticket: { Args: { _ticket_id: string }; Returns: boolean }
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
      my_team_ids: { Args: { _user_id: string }; Returns: string[] }
      revoke_team_invitation: {
        Args: { invitation_id: string }
        Returns: undefined
      }
      set_team_member_status: {
        Args: { member_id: string; new_status: string }
        Returns: undefined
      }
      update_team_member_role: {
        Args: { member_id: string; new_role: string }
        Returns: undefined
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
