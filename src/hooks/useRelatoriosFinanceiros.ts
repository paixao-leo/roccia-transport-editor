import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek, subWeeks, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export type GranularidadeRelatorio = "diario" | "semanal" | "mensal";

interface DadoFaturamento {
  periodo: string;
  faturamento: number;
  lucro: number;
  despesas: number;
}

interface ResumoFinanceiro {
  totalFaturamento: number;
  totalLucro: number;
  totalDespesas: number;
  margemLucro: number;
  quantidadeCargas: number;
}

function getPeriodsForGranularity(granularidade: GranularidadeRelatorio, numPeriodos: number = 6) {
  const now = new Date();
  const periods: { start: Date; end: Date; label: string }[] = [];

  for (let i = numPeriodos - 1; i >= 0; i--) {
    switch (granularidade) {
      case "diario": {
        const date = subDays(now, i);
        periods.push({
          start: startOfDay(date),
          end: endOfDay(date),
          label: format(date, "dd/MM", { locale: ptBR }),
        });
        break;
      }
      case "semanal": {
        const date = subWeeks(now, i);
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        periods.push({
          start,
          end,
          label: `${format(start, "dd/MM", { locale: ptBR })}`,
        });
        break;
      }
      case "mensal": {
        const date = subMonths(now, i);
        periods.push({
          start: startOfMonth(date),
          end: endOfMonth(date),
          label: format(date, "MMM/yy", { locale: ptBR }),
        });
        break;
      }
    }
  }

  return periods;
}

export function useRelatorioFaturamento(granularidade: GranularidadeRelatorio = "mensal") {
  return useQuery({
    queryKey: ["relatorio", "faturamento", granularidade],
    queryFn: async (): Promise<DadoFaturamento[]> => {
      const periods = getPeriodsForGranularity(granularidade);
      
      const { data, error } = await supabase
        .from("financeiro_cargas")
        .select("faturamento, lucro, total_despesas, created_at");

      if (error) throw error;

      return periods.map((period) => {
        const periodData = (data || []).filter((f) => {
          if (!f.created_at) return false;
          const date = new Date(f.created_at);
          return date >= period.start && date <= period.end;
        });

        return {
          periodo: period.label,
          faturamento: periodData.reduce((sum, f) => sum + (f.faturamento || 0), 0),
          lucro: periodData.reduce((sum, f) => sum + (f.lucro || 0), 0),
          despesas: periodData.reduce((sum, f) => sum + (f.total_despesas || 0), 0),
        };
      });
    },
  });
}

export function useResumoFinanceiro(granularidade: GranularidadeRelatorio = "mensal") {
  return useQuery({
    queryKey: ["relatorio", "resumo", granularidade],
    queryFn: async (): Promise<ResumoFinanceiro> => {
      const periods = getPeriodsForGranularity(granularidade);
      const startDate = periods[0].start;
      const endDate = periods[periods.length - 1].end;

      const { data, error } = await supabase
        .from("financeiro_cargas")
        .select("faturamento, lucro, total_despesas, created_at");

      if (error) throw error;

      const periodData = (data || []).filter((f) => {
        if (!f.created_at) return false;
        const date = new Date(f.created_at);
        return date >= startDate && date <= endDate;
      });

      const totalFaturamento = periodData.reduce((sum, f) => sum + (f.faturamento || 0), 0);
      const totalLucro = periodData.reduce((sum, f) => sum + (f.lucro || 0), 0);
      const totalDespesas = periodData.reduce((sum, f) => sum + (f.total_despesas || 0), 0);
      const margemLucro = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;

      return {
        totalFaturamento,
        totalLucro,
        totalDespesas,
        margemLucro,
        quantidadeCargas: periodData.length,
      };
    },
  });
}

export function useFaturamentoPorCliente() {
  return useQuery({
    queryKey: ["relatorio", "faturamento-por-cliente"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cargas")
        .select(`
          cliente:clientes(nome),
          financeiro:financeiro_cargas(faturamento, lucro)
        `);

      if (error) throw error;

      const clienteMap = new Map<string, { faturamento: number; lucro: number; cargas: number }>();

      (data || []).forEach((carga) => {
        const clienteNome = carga.cliente?.nome || "Sem cliente";
        const existing = clienteMap.get(clienteNome) || { faturamento: 0, lucro: 0, cargas: 0 };
        
        clienteMap.set(clienteNome, {
          faturamento: existing.faturamento + (carga.financeiro?.faturamento || 0),
          lucro: existing.lucro + (carga.financeiro?.lucro || 0),
          cargas: existing.cargas + 1,
        });
      });

      return Array.from(clienteMap.entries())
        .map(([nome, dados]) => ({ nome, ...dados }))
        .sort((a, b) => b.faturamento - a.faturamento)
        .slice(0, 5);
    },
  });
}
