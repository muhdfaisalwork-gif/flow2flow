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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tfa_pending_verifications: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          method: Database["public"]["Enums"]["tfa_method"]
          used: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          method: Database["public"]["Enums"]["tfa_method"]
          used?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          method?: Database["public"]["Enums"]["tfa_method"]
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          created_at: string
          encrypted_data: Json
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_data?: Json
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_data?: Json
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          email_verified: boolean
          enabled: boolean
          id: string
          phone_number: string | null
          phone_verified: boolean
          preferred_method: Database["public"]["Enums"]["tfa_method"] | null
          totp_secret: string | null
          totp_verified: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          email_verified?: boolean
          enabled?: boolean
          id?: string
          phone_number?: string | null
          phone_verified?: boolean
          preferred_method?: Database["public"]["Enums"]["tfa_method"] | null
          totp_secret?: string | null
          totp_verified?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          email_verified?: boolean
          enabled?: boolean
          id?: string
          phone_number?: string | null
          phone_verified?: boolean
          preferred_method?: Database["public"]["Enums"]["tfa_method"] | null
          totp_secret?: string | null
          totp_verified?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          created_at: string
          error_log: string | null
          finished_at: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          retry_count: number
          started_at: string
          status: Database["public"]["Enums"]["workflow_run_status"]
          workflow_id: string
        }
        Insert: {
          created_at?: string
          error_log?: string | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number
          started_at?: string
          status?: Database["public"]["Enums"]["workflow_run_status"]
          workflow_id: string
        }
        Update: {
          created_at?: string
          error_log?: string | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number
          started_at?: string
          status?: Database["public"]["Enums"]["workflow_run_status"]
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          edges: Json
          id: string
          is_public: boolean
          name: string
          nodes: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_public?: boolean
          name: string
          nodes?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_public?: boolean
          name?: string
          nodes?: Json
        }
        Relationships: []
      }
      workflow_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string
          description: string | null
          edges: Json
          id: string
          name: string
          nodes: Json
          settings: Json
          version_number: number
          workflow_id: string
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          edges?: Json
          id?: string
          name: string
          nodes?: Json
          settings?: Json
          version_number: number
          workflow_id: string
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          edges?: Json
          id?: string
          name?: string
          nodes?: Json
          settings?: Json
          version_number?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_versions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          description: string | null
          edges: Json
          id: string
          is_active: boolean
          is_public: boolean
          name: string
          nodes: Json
          settings: Json
          share_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          nodes?: Json
          settings?: Json
          share_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          nodes?: Json
          settings?: Json
          share_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_tfa_settings_safe: {
        Row: {
          created_at: string | null
          email_verified: boolean | null
          enabled: boolean | null
          id: string | null
          phone_verified: boolean | null
          preferred_method: Database["public"]["Enums"]["tfa_method"] | null
          totp_verified: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_verified?: boolean | null
          enabled?: boolean | null
          id?: string | null
          phone_verified?: boolean | null
          preferred_method?: Database["public"]["Enums"]["tfa_method"] | null
          totp_verified?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_verified?: boolean | null
          enabled?: boolean | null
          id?: string | null
          phone_verified?: boolean | null
          preferred_method?: Database["public"]["Enums"]["tfa_method"] | null
          totp_verified?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tfa_method: "totp" | "email" | "sms"
      workflow_run_status: "pending" | "running" | "success" | "failed"
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
      tfa_method: ["totp", "email", "sms"],
      workflow_run_status: ["pending", "running", "success", "failed"],
    },
  },
} as const
