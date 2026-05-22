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
      alerts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          keywords: string[];
          cpv_codes: string[];
          departments: string[];
          frequency: 'daily' | 'weekly';
          filters: Json;
          last_run: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          keywords?: string[];
          cpv_codes?: string[];
          departments?: string[];
          frequency: 'daily' | 'weekly';
          filters?: Json;
          last_run?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          keywords?: string[];
          cpv_codes?: string[];
          departments?: string[];
          frequency?: 'daily' | 'weekly';
          filters?: Json;
          last_run?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          display_name: string | null;
          first_name: string | null;
          business_sector: string | null;
          alert_preferences: Json;
          premium_until: string | null;
          stripe_customer_id: string | null;
          role: 'admin' | 'user';
          first_login_completed: boolean;
          password_changed_at: string | null;
          auth_provider: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          display_name?: string | null;
          first_name?: string | null;
          business_sector?: string | null;
          alert_preferences?: Json;
          premium_until?: string | null;
          stripe_customer_id?: string | null;
          role?: 'admin' | 'user';
          first_login_completed?: boolean;
          password_changed_at?: string | null;
          auth_provider?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          display_name?: string | null;
          first_name?: string | null;
          business_sector?: string | null;
          alert_preferences?: Json;
          premium_until?: string | null;
          stripe_customer_id?: string | null;
          role?: 'admin' | 'user';
          first_login_completed?: boolean;
          password_changed_at?: string | null;
          auth_provider?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_facet_preferences: {
        Row: {
          id: string;
          user_id: string;
          facet_type: string;
          facet_values: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          facet_type: string;
          facet_values?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          facet_type?: string;
          facet_values?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          search_params: Json;
          is_favorite: boolean;
          use_count: number;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          search_params: Json;
          is_favorite?: boolean;
          use_count?: number;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          search_params?: Json;
          is_favorite?: boolean;
          use_count?: number;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          contract_id: string;
          contract_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contract_id: string;
          contract_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contract_id?: string;
          contract_data?: Json;
          created_at?: string;
        };
      };
      stripe_customers: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          template_key: string;
          name: string;
          subject: string;
          body: string;
          variables: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_key: string;
          name: string;
          subject: string;
          body: string;
          variables?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_key?: string;
          name?: string;
          subject?: string;
          body?: string;
          variables?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          user_id: string | null;
          template_key: string;
          subject: string;
          sent_at: string;
          status: 'sent' | 'failed' | 'pending';
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          template_key: string;
          subject: string;
          sent_at?: string;
          status?: 'sent' | 'failed' | 'pending';
          error_message?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          template_key?: string;
          subject?: string;
          sent_at?: string;
          status?: 'sent' | 'failed' | 'pending';
          error_message?: string | null;
        };
      };
      tracking_config: {
        Row: {
          id: string;
          enabled: boolean;
          conversion_id: string;
          conversion_events: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          enabled?: boolean;
          conversion_id?: string;
          conversion_events?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          enabled?: boolean;
          conversion_id?: string;
          conversion_events?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Views: {
      admin_user_stats: {
        Row: {
          total_users: number;
          total_admins: number;
          premium_users: number;
          new_users_week: number;
          new_users_month: number;
        };
      };
      email_stats: {
        Row: {
          template_key: string;
          total_sent: number;
          successful: number;
          failed: number;
          pending: number;
          last_sent: string | null;
        };
      };
    };
    Functions: {
      is_premium: {
        Args: {
          check_user_id?: string;
        };
        Returns: boolean;
      };
      upgrade_to_premium: {
        Args: {
          target_user_id: string;
          duration_months?: number;
        };
        Returns: void;
      };
      is_admin: {
        Args: {
          check_user_id?: string;
        };
        Returns: boolean;
      };
      promote_to_admin: {
        Args: {
          target_user_id: string;
        };
        Returns: void;
      };
      increment_use_count: {
        Args: {
          search_id: string;
        };
        Returns: void;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
