import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useCargas, CargaCompleta } from "@/hooks/useCargas";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HistoricoProps {
  onViewCarga: (carga: CargaCompleta) => void;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  planejada: { label: "Planejada", class: "bg-blue-100 text-blue-700" },
  em_transito: { label: "Em Trânsito", class: "bg-orange-100 text-orange-700" },
  entregue: { label: "Entregue", class: "bg-green-100 text-green-700" },
};

const cardColors = [
  "border-l-primary",
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-yellow-500",
  "border-l-purple-500",
  "border-l-orange-500",
];

export function Historico({ onViewCarga }: HistoricoProps) {
  const { data: cargas, isLoading } = useCargas();

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Histórico de Cargas</h2>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Filter className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Filtrar</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (cargas?.length || 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhuma carga no histórico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cargas?.map((carga, index) => {
            const status = statusConfig[carga.status] || statusConfig.planejada;
            return (
              <div
                key={carga.id}
                onClick={() => onViewCarga(carga)}
                className={cn(
                  "cargo-card",
                  cardColors[index % cardColors.length]
                )}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-foreground">{carga.nome}</span>
                  <span className={cn("status-badge", status.class)}>
                    {status.label}
                  </span>
                </div>

                {/* Route */}
                {carga.percurso && (
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {carga.percurso}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-muted-foreground mb-2">
                  📅 {new Date(carga.data_carregamento).toLocaleDateString("pt-BR")}
                </p>

                {/* Cliente */}
                {carga.cliente && (
                  <p className="text-sm text-primary font-medium mb-2">
                    🏢 {carga.cliente.nome}
                  </p>
                )}

                {/* Faturamento */}
                {carga.financeiro && (
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Faturamento</span>
                    <span className="text-sm font-bold text-green-400">
                      R$ {carga.financeiro.faturamento?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {/* Click hint */}
                <div className="text-center mt-3 text-xs text-muted-foreground">
                  👆 Clique para ver detalhes
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
