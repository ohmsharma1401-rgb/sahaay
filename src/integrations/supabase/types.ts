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
      appointments: {
        Row: {
          citizen_id: string | null
          created_at: string
          email: string | null
          id: string
          lawyer_id: string | null
          message: string | null
          name: string
          ngo_id: string | null
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          citizen_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lawyer_id?: string | null
          message?: string | null
          name: string
          ngo_id?: string | null
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          citizen_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lawyer_id?: string | null
          message?: string | null
          name?: string
          ngo_id?: string | null
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          attachment_url: string | null
          citizen_id: string | null
          created_at: string
          id: string
          issue_type: string | null
          location: string | null
          message: string
          name: string
          ngo_id: string
          phone: string
          status: string
          subject: string
          title: string | null
          updated_at: string
          urgency: string
        }
        Insert: {
          attachment_url?: string | null
          citizen_id?: string | null
          created_at?: string
          id?: string
          issue_type?: string | null
          location?: string | null
          message: string
          name: string
          ngo_id: string
          phone: string
          status?: string
          subject: string
          title?: string | null
          updated_at?: string
          urgency?: string
        }
        Update: {
          attachment_url?: string | null
          citizen_id?: string | null
          created_at?: string
          id?: string
          issue_type?: string | null
          location?: string | null
          message?: string
          name?: string
          ngo_id?: string
          phone?: string
          status?: string
          subject?: string
          title?: string | null
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_requests_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          about: string | null
          achievements: string[]
          available_days: string | null
          available_time: string | null
          bar_number: string | null
          certificates: string[]
          city: string | null
          consultation_fee: number | null
          created_at: string
          email: string | null
          emergency_consultation: boolean
          experience_years: number
          full_name: string
          google_maps_url: string | null
          id: string
          languages: string[]
          latitude: number | null
          longitude: number | null
          office_address: string | null
          offline_consultation: boolean
          online_consultation: boolean
          owner_id: string | null
          phone: string | null
          photo_url: string | null
          practice_since: number | null
          qualification: string | null
          slug: string
          specializations: string[]
          university: string | null
          updated_at: string
          verified: boolean
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          achievements?: string[]
          available_days?: string | null
          available_time?: string | null
          bar_number?: string | null
          certificates?: string[]
          city?: string | null
          consultation_fee?: number | null
          created_at?: string
          email?: string | null
          emergency_consultation?: boolean
          experience_years?: number
          full_name: string
          google_maps_url?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          office_address?: string | null
          offline_consultation?: boolean
          online_consultation?: boolean
          owner_id?: string | null
          phone?: string | null
          photo_url?: string | null
          practice_since?: number | null
          qualification?: string | null
          slug: string
          specializations?: string[]
          university?: string | null
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          achievements?: string[]
          available_days?: string | null
          available_time?: string | null
          bar_number?: string | null
          certificates?: string[]
          city?: string | null
          consultation_fee?: number | null
          created_at?: string
          email?: string | null
          emergency_consultation?: boolean
          experience_years?: number
          full_name?: string
          google_maps_url?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          office_address?: string | null
          offline_consultation?: boolean
          online_consultation?: boolean
          owner_id?: string | null
          phone?: string | null
          photo_url?: string | null
          practice_since?: number | null
          qualification?: string | null
          slug?: string
          specializations?: string[]
          university?: string | null
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      ngo_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          ngo_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          ngo_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          ngo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ngo_gallery_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      ngos: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          contact_person: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          emergency_support: boolean
          google_maps_url: string | null
          id: string
          languages: string[]
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          mission: string | null
          name: string
          nearby_landmark: string | null
          owner_id: string | null
          phone: string | null
          pin_code: string | null
          registration_number: string | null
          services: string[]
          slug: string
          state: string | null
          updated_at: string
          verified: boolean
          website: string | null
          whatsapp: string | null
          working_days: string | null
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          emergency_support?: boolean
          google_maps_url?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          mission?: string | null
          name: string
          nearby_landmark?: string | null
          owner_id?: string | null
          phone?: string | null
          pin_code?: string | null
          registration_number?: string | null
          services?: string[]
          slug: string
          state?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
          working_days?: string | null
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          emergency_support?: boolean
          google_maps_url?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          mission?: string | null
          name?: string
          nearby_landmark?: string | null
          owner_id?: string | null
          phone?: string | null
          pin_code?: string | null
          registration_number?: string | null
          services?: string[]
          slug?: string
          state?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
          working_days?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          citizen_id: string
          comment: string | null
          created_at: string
          id: string
          lawyer_id: string | null
          ngo_id: string | null
          rating: number
          updated_at: string
        }
        Insert: {
          citizen_id: string
          comment?: string | null
          created_at?: string
          id?: string
          lawyer_id?: string | null
          ngo_id?: string | null
          rating: number
          updated_at?: string
        }
        Update: {
          citizen_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          lawyer_id?: string | null
          ngo_id?: string | null
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_lawyers: {
        Row: {
          created_at: string
          lawyer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          lawyer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          lawyer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_lawyers_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_ngos: {
        Row: {
          created_at: string
          ngo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ngo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          ngo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_ngos_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
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
      app_role: "citizen" | "lawyer" | "ngo_owner" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["citizen", "lawyer", "ngo_owner", "admin"],
    },
  },
} as const
