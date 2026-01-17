import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Motorista = Tables<"motoristas">;
export type MotoristaInsert = TablesInsert<"motoristas">;
export type MotoristaUpdate = TablesUpdate<"motoristas">;

// Hook para listar todos os motoristas
export function useMotoristas() {
  return useQuery({
    queryKey: ["motoristas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motoristas")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Motorista[];
    },
  });
}

// Hook para buscar motoristas por nome, CPF ou telefone
export function useSearchMotoristas(searchTerm: string) {
  return useQuery({
    queryKey: ["motoristas", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        const { data, error } = await supabase
          .from("motoristas")
          .select("*")
          .order("nome");

        if (error) throw error;
        return data as Motorista[];
      }

      const { data, error } = await supabase
        .from("motoristas")
        .select("*")
        .or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`)
        .order("nome");

      if (error) throw error;
      return data as Motorista[];
    },
    enabled: true,
  });
}

// Hook para criar motorista
export function useCreateMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motorista: MotoristaInsert) => {
      const { data, error } = await supabase
        .from("motoristas")
        .insert(motorista)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
    },
  });
}

// Hook para atualizar motorista
export function useUpdateMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motorista }: { id: string; motorista: MotoristaUpdate }) => {
      const { data, error } = await supabase
        .from("motoristas")
        .update(motorista)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
    },
  });
}

// Hook para deletar motorista
export function useDeleteMotorista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("motoristas").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
    },
  });
}
