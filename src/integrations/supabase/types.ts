export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bandi: {
        Row: {
          budget_disponibile: string | null
          created_at: string
          data_estrazione: string | null
          descrizione: string | null
          descrizione_completa: string | null
          fonte: string
          id: string
          importo_max: number | null
          importo_min: number | null
          modalita_presentazione: string | null
          requisiti: string | null
          scadenza: string
          scadenza_dettagliata: string | null
          settori: string[] | null
          tipo: string
          titolo: string
          ultimi_aggiornamenti: string | null
          url: string | null
        }
        Insert: {
          budget_disponibile?: string | null
          created_at?: string
          data_estrazione?: string | null
          descrizione?: string | null
          descrizione_completa?: string | null
          fonte: string
          id?: string
          importo_max?: number | null
          importo_min?: number | null
          modalita_presentazione?: string | null
          requisiti?: string | null
          scadenza: string
          scadenza_dettagliata?: string | null
          settori?: string[] | null
          tipo: string
          titolo: string
          ultimi_aggiornamenti?: string | null
          url?: string | null
        }
        Update: {
          budget_disponibile?: string | null
          created_at?: string
          data_estrazione?: string | null
          descrizione?: string | null
          descrizione_completa?: string | null
          fonte?: string
          id?: string
          importo_max?: number | null
          importo_min?: number | null
          modalita_presentazione?: string | null
          requisiti?: string | null
          scadenza?: string
          scadenza_dettagliata?: string | null
          settori?: string[] | null
          tipo?: string
          titolo?: string
          ultimi_aggiornamenti?: string | null
          url?: string | null
        }
        Relationships: []
      }
      clienti: {
        Row: {
          annofondazione: number | null
          codiceateco: string | null
          created_at: string
          dipendenti: number
          email: string
          fatturato: number
          formagiuridica: string | null
          id: string
          interessisettoriali: string[] | null
          nome: string
          provincia: string
          regione: string
          settore: string
          telefono: string | null
        }
        Insert: {
          annofondazione?: number | null
          codiceateco?: string | null
          created_at?: string
          dipendenti: number
          email: string
          fatturato: number
          formagiuridica?: string | null
          id?: string
          interessisettoriali?: string[] | null
          nome: string
          provincia: string
          regione: string
          settore: string
          telefono?: string | null
        }
        Update: {
          annofondazione?: number | null
          codiceateco?: string | null
          created_at?: string
          dipendenti?: number
          email?: string
          fatturato?: number
          formagiuridica?: string | null
          id?: string
          interessisettoriali?: string[] | null
          nome?: string
          provincia?: string
          regione?: string
          settore?: string
          telefono?: string | null
        }
        Relationships: []
      }
      fonti: {
        Row: {
          created_at: string
          id: string
          nome: string
          stato: string
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          stato?: string
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          stato?: string
          tipo?: string
          url?: string
        }
        Relationships: []
      }
      match: {
        Row: {
          archiviato: boolean | null
          bandoid: string
          clienteid: string
          compatibilita: number
          created_at: string
          id: string
          notificato: boolean | null
        }
        Insert: {
          archiviato?: boolean | null
          bandoid: string
          clienteid: string
          compatibilita: number
          created_at?: string
          id?: string
          notificato?: boolean | null
        }
        Update: {
          archiviato?: boolean | null
          bandoid?: string
          clienteid?: string
          compatibilita?: number
          created_at?: string
          id?: string
          notificato?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "match_bandoid_fkey"
            columns: ["bandoid"]
            isOneToOne: false
            referencedRelation: "bandi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_clienteid_fkey"
            columns: ["clienteid"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          dati: Json
          descrizione: string | null
          id: string
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dati?: Json
          descrizione?: string | null
          id?: string
          tipo: string
          titolo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dati?: Json
          descrizione?: string | null
          id?: string
          tipo?: string
          titolo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
