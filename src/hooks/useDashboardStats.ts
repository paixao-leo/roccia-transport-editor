import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export type PeriodoFaturamento = "dia" | "semana" | "mes";

function getDateRange(periodo: PeriodoFaturamento) {
  const now = new Date();
  
  switch (periodo) {
    case "dia":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "semana":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "mes":
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

export function useDashboardStats(periodoFaturamento: PeriodoFaturamento = "mes") {
  return useQuery({
    queryKey: ["dashboard", "stats", periodoFaturamento],
    queryFn: async () => {
      // Buscar contagem de cargas ativas (em_transito)
      const { count: cargasAtivas, error: ativasError } = await supabase
        .from("cargas")
        .select("*", { count: "exact", head: true })
        .eq("status", "em_transito");

      if (ativasError) throw ativasError;

      // Buscar contagem de cargas em trânsito
      const { count: emTransito, error: transitoError } = await supabase
        .from("cargas")
        .select("*", { count: "exact", head: true })
        .eq("status", "em_transito");

      if (transitoError) throw transitoError;

      // Buscar contagem de cargas entregues (total histórico)
      const { count: entregues, error: entreguesError } = await supabase
        .from("cargas")
        .select("*", { count: "exact", head: true })
        .eq("status", "entregue");

      if (entreguesError) throw entreguesError;

      // Buscar faturamento do período
      const { start, end } = getDateRange(periodoFaturamento);
      
      const { data: financeiroData, error: finError } = await supabase
        .from("financeiro_cargas")
        .select("faturamento, created_at");

      if (finError) throw finError;

      // Filtrar por período e somar faturamento
      const faturamento = (financeiroData || [])
        .filter(f => {
          if (!f.created_at) return false;
          const date = new Date(f.created_at);
          return date >= start && date <= end;
        })
        .reduce((sum, f) => sum + (f.faturamento || 0), 0);

      return {
        cargasAtivas: cargasAtivas || 0,
        emTransito: emTransito || 0,
        entregues: entregues || 0,
        faturamento,
      };
    },
  });
}

export function useFaturamentoPorPeriodo(periodo: PeriodoFaturamento) {
  return useQuery({
    queryKey: ["dashboard", "faturamento", periodo],
    queryFn: async () => {
      const { start, end } = getDateRange(periodo);
      
      const { data, error } = await supabase
        .from("financeiro_cargas")
        .select("faturamento, created_at");

      if (error) throw error;

      const total = (data || [])
        .filter(f => {
          if (!f.created_at) return false;
          const date = new Date(f.created_at);
          return date >= start && date <= end;
        })
        .reduce((sum, f) => sum + (f.faturamento || 0), 0);

      return total;
    },
  });
}
