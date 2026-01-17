import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Veiculo = Tables<"veiculos">;
export type VeiculoInsert = TablesInsert<"veiculos">;
export type VeiculoUpdate = TablesUpdate<"veiculos">;

export const TIPOS_VEICULO = [
  "Van",
  "VUC",
  "3/4",
  "Toco",
  "Truck",
  "Bitruck",
  "Carreta",
  "Carreta 7 eixos",
  "Rodotrem",
] as const;

export type TipoVeiculo = typeof TIPOS_VEICULO[number];

// Hook para listar todos os veículos
export function useVeiculos() {
  return useQuery({
    queryKey: ["veiculos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos")
        .select("*")
        .order("placa_veiculo");

      if (error) throw error;
      return data as Veiculo[];
    },
  });
}

// Hook para criar veículo
export function useCreateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (veiculo: VeiculoInsert) => {
      const { data, error } = await supabase
        .from("veiculos")
        .insert(veiculo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });
}

// Hook para atualizar veículo
export function useUpdateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, veiculo }: { id: string; veiculo: VeiculoUpdate }) => {
      const { data, error } = await supabase
        .from("veiculos")
        .update(veiculo)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });
}

// Hook para deletar veículo
export function useDeleteVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });
}
