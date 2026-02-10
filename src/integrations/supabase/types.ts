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
      carga_motorista_veiculo: {
        Row: {
          carga_id: string
          created_at: string | null
          id: string
          motorista_id: string
          veiculo_id: string | null
        }
        Insert: {
          carga_id: string
          created_at?: string | null
          id?: string
          motorista_id: string
          veiculo_id?: string | null
        }
        Update: {
          carga_id?: string
          created_at?: string | null
          id?: string
          motorista_id?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carga_motorista_veiculo_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carga_motorista_veiculo_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carga_motorista_veiculo_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      cargas: {
        Row: {
          classificada: boolean
          cliente_id: string | null
          created_at: string | null
          data_carregamento: string
          etapa: string
          id: string
          nome: string
          percurso: string | null
          status: string
          tipo_frete: string
          updated_at: string | null
        }
        Insert: {
          classificada?: boolean
          cliente_id?: string | null
          created_at?: string | null
          data_carregamento: string
          etapa: string
          id?: string
          nome: string
          percurso?: string | null
          status: string
          tipo_frete?: string
          updated_at?: string | null
        }
        Update: {
          classificada?: boolean
          cliente_id?: string | null
          created_at?: string | null
          data_carregamento?: string
          etapa?: string
          id?: string
          nome?: string
          percurso?: string | null
          status?: string
          tipo_frete?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cargas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_com_ultima_carga"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cnpj_cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj_cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj_cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      financeiro_cargas: {
        Row: {
          carga_id: string
          created_at: string | null
          custos_extras: number | null
          faturamento: number
          frete_terceiro: number | null
          id: string
          impostos: number | null
          lucro: number | null
          percentual_seguro: number
          total_despesas: number | null
          valor_mercadoria: number
          valor_seguro: number | null
        }
        Insert: {
          carga_id: string
          created_at?: string | null
          custos_extras?: number | null
          faturamento: number
          frete_terceiro?: number | null
          id?: string
          impostos?: number | null
          lucro?: number | null
          percentual_seguro: number
          total_despesas?: number | null
          valor_mercadoria: number
          valor_seguro?: number | null
        }
        Update: {
          carga_id?: string
          created_at?: string | null
          custos_extras?: number | null
          faturamento?: number
          frete_terceiro?: number | null
          id?: string
          impostos?: number | null
          lucro?: number | null
          percentual_seguro?: number
          total_despesas?: number | null
          valor_mercadoria?: number
          valor_seguro?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_cargas_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: true
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          cpf: string | null
          created_at: string | null
          dono_antt: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          dono_antt?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          dono_antt?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      pagamentos_motoristas: {
        Row: {
          canhoto_recebido: boolean | null
          carga_id: string
          created_at: string | null
          id: string
          motorista_id: string
          percentual_pago: number
          saldo_restante: number
          status: string
          valor_pago: number
          valor_total: number
        }
        Insert: {
          canhoto_recebido?: boolean | null
          carga_id: string
          created_at?: string | null
          id?: string
          motorista_id: string
          percentual_pago: number
          saldo_restante: number
          status: string
          valor_pago: number
          valor_total: number
        }
        Update: {
          canhoto_recebido?: boolean | null
          carga_id?: string
          created_at?: string | null
          id?: string
          motorista_id?: string
          percentual_pago?: number
          saldo_restante?: number
          status?: string
          valor_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_motoristas_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_motoristas_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          created_at: string | null
          id: string
          placa_carreta_1: string | null
          placa_carreta_2: string | null
          placa_veiculo: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          placa_carreta_1?: string | null
          placa_carreta_2?: string | null
          placa_veiculo: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          placa_carreta_1?: string | null
          placa_carreta_2?: string | null
          placa_veiculo?: string
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      clientes_com_ultima_carga: {
        Row: {
          id: string | null
          nome: string | null
          ultima_carga: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
