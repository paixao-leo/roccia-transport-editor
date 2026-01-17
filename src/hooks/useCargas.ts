import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Carga = Tables<"cargas">;
export type CargaInsert = TablesInsert<"cargas">;
export type CargaUpdate = TablesUpdate<"cargas">;

export type FinanceiroCarga = Tables<"financeiro_cargas">;
export type FinanceiroInsert = TablesInsert<"financeiro_cargas">;

export type CargaMotoristaVeiculo = Tables<"carga_motorista_veiculo">;

// Tipo combinado para exibição
export interface CargaCompleta extends Carga {
  financeiro?: FinanceiroCarga | null;
  cliente?: Tables<"clientes"> | null;
  motorista_veiculo?: (CargaMotoristaVeiculo & {
    motorista?: Tables<"motoristas"> | null;
    veiculo?: Tables<"veiculos"> | null;
  }) | null;
}

// Hook para listar cargas
export function useCargas() {
  return useQuery({
    queryKey: ["cargas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cargas")
        .select(`
          *,
          financeiro:financeiro_cargas(*),
          cliente:clientes(*),
          motorista_veiculo:carga_motorista_veiculo(
            *,
            motorista:motoristas(*),
            veiculo:veiculos(*)
          )
        `)
        .order("data_carregamento", { ascending: false });

      if (error) throw error;
      
      // Flatten the motorista_veiculo array to single object
      return (data || []).map(carga => ({
        ...carga,
        motorista_veiculo: carga.motorista_veiculo?.[0] || null
      })) as CargaCompleta[];
    },
  });
}

// Hook para cargas em andamento (planejada ou em_transito)
export function useCargasEmAndamento() {
  return useQuery({
    queryKey: ["cargas", "em_andamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cargas")
        .select(`
          *,
          financeiro:financeiro_cargas(*),
          cliente:clientes(*),
          motorista_veiculo:carga_motorista_veiculo(
            *,
            motorista:motoristas(*),
            veiculo:veiculos(*)
          )
        `)
        .in("status", ["planejada", "em_transito"])
        .order("data_carregamento", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(carga => ({
        ...carga,
        motorista_veiculo: carga.motorista_veiculo?.[0] || null
      })) as CargaCompleta[];
    },
  });
}

// Hook para criar carga
export function useCreateCarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      carga,
      financeiro,
      motoristaId,
      veiculoId,
    }: {
      carga: CargaInsert;
      financeiro: Omit<FinanceiroInsert, "carga_id">;
      motoristaId?: string;
      veiculoId?: string;
    }) => {
      // 1. Criar a carga
      const { data: novaCarga, error: cargaError } = await supabase
        .from("cargas")
        .insert(carga)
        .select()
        .single();

      if (cargaError) throw cargaError;

      // 2. Criar o financeiro
      const { error: finError } = await supabase
        .from("financeiro_cargas")
        .insert({
          ...financeiro,
          carga_id: novaCarga.id,
        });

      if (finError) throw finError;

      // 3. Vincular motorista/veículo se fornecido
      if (motoristaId) {
        const { error: mvError } = await supabase
          .from("carga_motorista_veiculo")
          .insert({
            carga_id: novaCarga.id,
            motorista_id: motoristaId,
            veiculo_id: veiculoId || null,
          });

        if (mvError) throw mvError;
      }

      return novaCarga;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Hook para atualizar carga
export function useUpdateCarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      carga,
      financeiro,
    }: {
      id: string;
      carga: CargaUpdate;
      financeiro?: Partial<FinanceiroCarga>;
    }) => {
      // Atualizar carga
      const { error: cargaError } = await supabase
        .from("cargas")
        .update(carga)
        .eq("id", id);

      if (cargaError) throw cargaError;

      // Atualizar financeiro se fornecido
      if (financeiro) {
        const { error: finError } = await supabase
          .from("financeiro_cargas")
          .update(financeiro)
          .eq("carga_id", id);

        if (finError) throw finError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Hook para deletar carga
export function useDeleteCarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cargas").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Hook para marcar como entregue
export function useMarkAsDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cargas")
        .update({ status: "entregue" })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
