import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type PagamentoMotorista = Tables<"pagamentos_motoristas">;

export interface PagamentoComDetalhes extends PagamentoMotorista {
  carga?: Tables<"cargas"> | null;
  motorista?: Tables<"motoristas"> | null;
}

// Hook para listar todos os pagamentos
export function usePagamentos() {
  return useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos_motoristas")
        .select(`
          *,
          carga:cargas(*),
          motorista:motoristas(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PagamentoComDetalhes[];
    },
  });
}

// Hook para pagamentos pendentes (pago_parcial)
export function usePagamentosPendentes() {
  return useQuery({
    queryKey: ["pagamentos", "pendentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos_motoristas")
        .select(`
          *,
          carga:cargas(*),
          motorista:motoristas(*)
        `)
        .eq("status", "pago_parcial")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PagamentoComDetalhes[];
    },
  });
}

// Hook para confirmar recebimento do canhoto
export function useConfirmarCanhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pagamentos_motoristas")
        .update({ canhoto_recebido: true })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
    },
  });
}

// Hook para quitar saldo restante
export function useQuitarSaldo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Buscar o pagamento atual
      const { data: pagamento, error: fetchError } = await supabase
        .from("pagamentos_motoristas")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar para pago completo
      const { error } = await supabase
        .from("pagamentos_motoristas")
        .update({
          valor_pago: pagamento.valor_total,
          percentual_pago: 100,
          saldo_restante: 0,
          status: "pago",
        })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
    },
  });
}

// Hook para atualizar pagamento
export function useUpdatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      pagamento,
    }: {
      id: string;
      pagamento: Partial<TablesUpdate<"pagamentos_motoristas">>;
    }) => {
      const { error } = await supabase
        .from("pagamentos_motoristas")
        .update(pagamento)
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
    },
  });
}
