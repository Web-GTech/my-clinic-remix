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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      client_medical_records: {
        Row: {
          attachments: Json | null
          client_id: string
          complaints: string | null
          created_at: string
          created_by: string
          diagnosis: string | null
          id: string
          observations: string | null
          record_date: string
          record_type: string
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          client_id: string
          complaints?: string | null
          created_at?: string
          created_by: string
          diagnosis?: string | null
          id?: string
          observations?: string | null
          record_date?: string
          record_type: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          client_id?: string
          complaints?: string | null
          created_at?: string
          created_by?: string
          diagnosis?: string | null
          id?: string
          observations?: string | null
          record_date?: string
          record_type?: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_medical_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_medications_history: {
        Row: {
          adverse_reactions: string | null
          application_method: string | null
          applied_at: string
          applied_by: string
          batch_number: string | null
          client_id: string
          created_at: string
          dosage: string | null
          expiry_date: string | null
          id: string
          medication_name: string
          product_id: string | null
          service_id: string | null
        }
        Insert: {
          adverse_reactions?: string | null
          application_method?: string | null
          applied_at?: string
          applied_by: string
          batch_number?: string | null
          client_id: string
          created_at?: string
          dosage?: string | null
          expiry_date?: string | null
          id?: string
          medication_name: string
          product_id?: string | null
          service_id?: string | null
        }
        Update: {
          adverse_reactions?: string | null
          application_method?: string | null
          applied_at?: string
          applied_by?: string
          batch_number?: string | null
          client_id?: string
          created_at?: string
          dosage?: string | null
          expiry_date?: string | null
          id?: string
          medication_name?: string
          product_id?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_medications_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_medications_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_medications_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_procedures: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          performed_at: string
          performed_by: string
          photos: Json | null
          product_id: string | null
          reactions: string | null
          service_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_at?: string
          performed_by: string
          photos?: Json | null
          product_id?: string | null
          reactions?: string | null
          service_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string
          photos?: Json | null
          product_id?: string | null
          reactions?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_procedures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_procedures_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_procedures_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          allergies: string | null
          birth_date: string | null
          blood_type: string | null
          city: string | null
          cpf: string | null
          created_at: string
          current_medications: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          has_allergies: boolean | null
          has_current_medications: boolean | null
          has_medical_history: boolean | null
          id: string
          medical_history: string | null
          phone: string
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          blood_type?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          has_allergies?: boolean | null
          has_current_medications?: boolean | null
          has_medical_history?: boolean | null
          id?: string
          medical_history?: string | null
          phone: string
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          blood_type?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          has_allergies?: boolean | null
          has_current_medications?: boolean | null
          has_medical_history?: boolean | null
          id?: string
          medical_history?: string | null
          phone?: string
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string
          service_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method: string
          service_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          service_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          min_stock_alert: number | null
          name: string
          price: number
          stock_quantity: number | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock_alert?: number | null
          name: string
          price: number
          stock_quantity?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock_alert?: number | null
          name?: string
          price?: number
          stock_quantity?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      queue: {
        Row: {
          called_at: string | null
          created_at: string
          id: string
          queue_date: string
          queue_number: number
          service_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          called_at?: string | null
          created_at?: string
          id?: string
          queue_date: string
          queue_number: number
          service_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          called_at?: string | null
          created_at?: string
          id?: string
          queue_date?: string
          queue_number?: number
          service_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          created_at: string
          discount: number | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          service_id: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number
          service_id: string
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          service_id?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          client_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          payment_status: string | null
          service_date: string
          service_time: string
          service_type: string
          status: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          service_date: string
          service_time: string
          service_type: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          service_date?: string
          service_time?: string
          service_type?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "recepcionista" | "medicacao" | "doutor"
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
      app_role: ["recepcionista", "medicacao", "doutor"],
    },
  },
} as const
