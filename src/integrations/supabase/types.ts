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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          doctor_id: string | null
          health_problem: string
          hospital_id: string | null
          id: string
          patient_age: number
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          payment_status: string
          slot_id: string | null
          status: string | null
          token_number: number | null
          transaction_id: string | null
          waiting_time: number | null
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          health_problem: string
          hospital_id?: string | null
          id?: string
          patient_age: number
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          payment_status?: string
          slot_id?: string | null
          status?: string | null
          token_number?: number | null
          transaction_id?: string | null
          waiting_time?: number | null
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          health_problem?: string
          hospital_id?: string | null
          id?: string
          patient_age?: number
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          payment_status?: string
          slot_id?: string | null
          status?: string | null
          token_number?: number | null
          transaction_id?: string | null
          waiting_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          bed_count: number | null
          created_at: string
          description: string | null
          head_doctor_id: string | null
          hospital_id: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          bed_count?: number | null
          created_at?: string
          description?: string | null
          head_doctor_id?: string | null
          hospital_id: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          bed_count?: number | null
          created_at?: string
          description?: string | null
          head_doctor_id?: string | null
          hospital_id?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      doctor_access_codes: {
        Row: {
          access_code: string
          created_at: string
          doctor_id: string
          id: string
        }
        Insert: {
          access_code: string
          created_at?: string
          doctor_id: string
          id?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          doctor_id?: string
          id?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          age: number | null
          created_at: string
          education_details: string | null
          email: string | null
          experience: number
          hospital_id: string
          id: string
          name: string
          phone: string | null
          specialization: string[]
          status: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          education_details?: string | null
          email?: string | null
          experience?: number
          hospital_id: string
          id?: string
          name: string
          phone?: string | null
          specialization: string[]
          status?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          education_details?: string | null
          email?: string | null
          experience?: number
          hospital_id?: string
          id?: string
          name?: string
          phone?: string | null
          specialization?: string[]
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors_request: {
        Row: {
          age: string | null
          created_at: string
          doctor_name: string
          education: string | null
          email: string | null
          experience: string | null
          hospital_id: string
          id: string
          phone: string | null
          specialization: string[]
        }
        Insert: {
          age?: string | null
          created_at?: string
          doctor_name: string
          education?: string | null
          email?: string | null
          experience?: string | null
          hospital_id: string
          id?: string
          phone?: string | null
          specialization: string[]
        }
        Update: {
          age?: string | null
          created_at?: string
          doctor_name?: string
          education?: string | null
          email?: string | null
          experience?: string | null
          hospital_id?: string
          id?: string
          phone?: string | null
          specialization?: string[]
        }
        Relationships: []
      }
      health_tips: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hospital_insurance_plans: {
        Row: {
          cashless_available: boolean | null
          created_at: string
          hospital_id: string
          id: string
          notes: string | null
          plan_id: string
        }
        Insert: {
          cashless_available?: boolean | null
          created_at?: string
          hospital_id: string
          id?: string
          notes?: string | null
          plan_id: string
        }
        Update: {
          cashless_available?: boolean | null
          created_at?: string
          hospital_id?: string
          id?: string
          notes?: string | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_insurance_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string
          admin_user_id: string | null
          bed_count: number | null
          created_at: string
          description: string | null
          district: string
          email: string
          emergency_phone: string | null
          facilities: string[] | null
          hospital_type: string | null
          id: string
          name: string
          phone: string
          pincode: string | null
          setup_complete: boolean | null
          specializations: string[]
          state: string
          status: Database["public"]["Enums"]["hospital_status"]
          updated_at: string
          upi_qr_url: string | null
          website: string | null
          year_established: number | null
        }
        Insert: {
          address: string
          admin_user_id?: string | null
          bed_count?: number | null
          created_at?: string
          description?: string | null
          district: string
          email: string
          emergency_phone?: string | null
          facilities?: string[] | null
          hospital_type?: string | null
          id?: string
          name: string
          phone: string
          pincode?: string | null
          setup_complete?: boolean | null
          specializations?: string[]
          state: string
          status?: Database["public"]["Enums"]["hospital_status"]
          updated_at?: string
          upi_qr_url?: string | null
          website?: string | null
          year_established?: number | null
        }
        Update: {
          address?: string
          admin_user_id?: string | null
          bed_count?: number | null
          created_at?: string
          description?: string | null
          district?: string
          email?: string
          emergency_phone?: string | null
          facilities?: string[] | null
          hospital_type?: string | null
          id?: string
          name?: string
          phone?: string
          pincode?: string | null
          setup_complete?: boolean | null
          specializations?: string[]
          state?: string
          status?: Database["public"]["Enums"]["hospital_status"]
          updated_at?: string
          upi_qr_url?: string | null
          website?: string | null
          year_established?: number | null
        }
        Relationships: []
      }
      insurance_companies: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          irdai_number: string | null
          logo_url: string | null
          name: string
          revenue_share_pct: number | null
          status: string
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          irdai_number?: string | null
          logo_url?: string | null
          name: string
          revenue_share_pct?: number | null
          status?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          irdai_number?: string | null
          logo_url?: string | null
          name?: string
          revenue_share_pct?: number | null
          status?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      insurance_plans: {
        Row: {
          age_max: number | null
          age_min: number | null
          cashless_available: boolean | null
          company_id: string
          coverage_max: number | null
          coverage_min: number | null
          created_at: string
          exclusions: string[] | null
          features: string[] | null
          id: string
          name: string
          plan_type: string
          premium_max: number | null
          premium_min: number | null
          status: string
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          cashless_available?: boolean | null
          company_id: string
          coverage_max?: number | null
          coverage_min?: number | null
          created_at?: string
          exclusions?: string[] | null
          features?: string[] | null
          id?: string
          name: string
          plan_type?: string
          premium_max?: number | null
          premium_min?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          cashless_available?: boolean | null
          company_id?: string
          coverage_max?: number | null
          coverage_min?: number | null
          created_at?: string
          exclusions?: string[] | null
          features?: string[] | null
          id?: string
          name?: string
          plan_type?: string
          premium_max?: number | null
          premium_min?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          file_url: string | null
          hospital_name: string | null
          id: string
          notes: string | null
          record_date: string | null
          record_name: string
          record_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          hospital_name?: string | null
          id?: string
          notes?: string | null
          record_date?: string | null
          record_name: string
          record_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          hospital_name?: string | null
          id?: string
          notes?: string | null
          record_date?: string | null
          record_name?: string
          record_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          appointment_id: string
          body: string
          created_at: string
          id: string
          recipient_email: string | null
          recipient_phone: string | null
          recipient_type: string
          status: string | null
          subject: string
        }
        Insert: {
          appointment_id: string
          body: string
          created_at?: string
          id?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          recipient_type: string
          status?: string | null
          subject: string
        }
        Update: {
          appointment_id?: string
          body?: string
          created_at?: string
          id?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          recipient_type?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          phone: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          doctor_id: string | null
          hospital_id: string
          id: string
          patient_name: string
          rating: number
          replied_at: string | null
          reply_text: string | null
          review_text: string | null
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          hospital_id: string
          id?: string
          patient_name?: string
          rating?: number
          replied_at?: string | null
          reply_text?: string | null
          review_text?: string | null
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          hospital_id?: string
          id?: string
          patient_name?: string
          rating?: number
          replied_at?: string | null
          reply_text?: string | null
          review_text?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          is_booked: boolean
          slot_date: string
          slot_time: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          is_booked?: boolean
          slot_date: string
          slot_time: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          is_booked?: boolean
          slot_date?: string
          slot_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "hospital_admin"
      hospital_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user", "hospital_admin"],
      hospital_status: ["pending", "approved", "rejected"],
    },
  },
} as const
