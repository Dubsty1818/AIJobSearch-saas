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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      job_matches: {
        Row: {
          analysis: string | null
          company_name: string
          created_at: string
          date: string
          expected_salary: string | null
          id: string
          job_description: string
          job_title: string
          location: string | null
          platform: string
          reasoning: string | null
          score: number | null
          search_keywords: string
          url: string
          user_id: string
          employer_image_url: string | null
          contract_type: string | null
          time_ago: string | null
          min_salary: number | null
          max_salary: number | null
          salary_period: string | null
          job_publisher: string | null
          is_remote: boolean | null
          job_benefits: Json | null
          status: string | null
        }
        Insert: {
          analysis?: string | null
          company_name?: string
          created_at?: string
          date?: string
          expected_salary?: string | null
          id?: string
          job_description?: string
          job_title?: string
          location?: string | null
          platform?: string
          reasoning?: string | null
          score?: number | null
          search_keywords?: string
          url?: string
          user_id: string
          employer_image_url?: string | null
          contract_type?: string | null
          time_ago?: string | null
          min_salary?: number | null
          max_salary?: number | null
          salary_period?: string | null
          job_publisher?: string | null
          is_remote?: boolean | null
          job_benefits?: Json | null
          status?: string | null
        }
        Update: {
          analysis?: string | null
          company_name?: string
          created_at?: string
          date?: string
          expected_salary?: string | null
          id?: string
          job_description?: string
          job_title?: string
          location?: string | null
          platform?: string
          reasoning?: string | null
          score?: number | null
          search_keywords?: string
          url?: string
          user_id?: string
          employer_image_url?: string | null
          contract_type?: string | null
          time_ago?: string | null
          min_salary?: number | null
          max_salary?: number | null
          salary_period?: string | null
          job_publisher?: string | null
          is_remote?: boolean | null
          job_benefits?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          keywords: string
          search_limit: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keywords: string
          search_limit?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string
          search_limit?: number
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          custom_rules: Json
          cv_text: string
          free_searches_remaining: number | null
          id: string
          max_score_limit: number | null
          quota_reset_at: string
          setup_completed: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          target_keywords: string
          updated_at: string
          monthly_quota: number
          role: string | null
        }
        Insert: {
          created_at?: string
          custom_rules?: Json
          cv_text?: string
          free_searches_remaining?: number | null
          id: string
          max_score_limit?: number | null
          quota_reset_at?: string
          setup_completed?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          target_keywords?: string
          updated_at?: string
          monthly_quota?: number
          role?: string | null
        }
        Update: {
          created_at?: string
          custom_rules?: Json
          cv_text?: string
          free_searches_remaining?: number | null
          id?: string
          max_score_limit?: number | null
          quota_reset_at?: string
          setup_completed?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          target_keywords?: string
          updated_at?: string
          monthly_quota?: number
          role?: string | null
        }
        Relationships: []
      }
      daily_active_users: {
        Row: { date: string; user_id: string }
        Insert: { date?: string; user_id: string }
        Update: { date?: string; user_id?: string }
        Relationships: []
      }
      daily_metrics: {
        Row: { date: string; searches_run: number; wizard_completions: number }
        Insert: { date?: string; searches_run?: number; wizard_completions?: number }
        Update: { date?: string; searches_run?: number; wizard_completions?: number }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_daily_metric: {
        Args: { metric_name: string }
        Returns: undefined
      }
      log_active_user: {
        Args: { uid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
