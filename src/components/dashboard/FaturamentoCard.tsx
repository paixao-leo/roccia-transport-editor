import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDashboardStats, PeriodoFaturamento } from "@/hooks/useDashboardStats";

interface FaturamentoCardProps {
  className?: string;
}

const periodoLabels: Record<PeriodoFaturamento, string> = {
  dia: "Hoje",
  semana: "Esta Semana",
  mes: "Este Mês",
};

export function FaturamentoCard({ className }: FaturamentoCardProps) {
  const [periodo, setPeriodo] = useState<PeriodoFaturamento>("mes");
  const { data: stats, isLoading } = useDashboardStats(periodo);

  const cyclePeriodo = () => {
    const periodos: PeriodoFaturamento[] = ["dia", "semana", "mes"];
    const currentIndex = periodos.indexOf(periodo);
    const nextIndex = (currentIndex + 1) % periodos.length;
    setPeriodo(periodos[nextIndex]);
  };

  return (
    <div
      onClick={cyclePeriodo}
      className={cn(
        "stat-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
        className
      )}
    >
      <div className="text-4xl font-bold text-primary mb-2">
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : (
          `R$ ${(stats?.faturamento || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`
        )}
      </div>
      <div className="text-muted-foreground uppercase font-semibold text-sm tracking-wide">
        Faturamento
      </div>
      <div className="text-xs text-primary mt-1 font-medium">
        {periodoLabels[periodo]} • Clique para alternar
      </div>
    </div>
  );
}
