import { CargaCompleta } from "@/hooks/useCargas";
import { cn } from "@/lib/utils";

interface KanbanViewProps {
  cargas: CargaCompleta[];
  onViewCarga: (carga: CargaCompleta) => void;
}

const statusConfig = {
  planejada: {
    label: "Planejada",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
    dotColor: "bg-blue-500",
  },
  em_transito: {
    label: "Em Trânsito",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-400",
    dotColor: "bg-yellow-500",
  },
  entregue: {
    label: "Entregue",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
    textColor: "text-green-400",
    dotColor: "bg-green-500",
  },
};

export function KanbanView({ cargas, onViewCarga }: KanbanViewProps) {
  const columns = [
    { status: "planejada", cargas: cargas.filter((c) => c.status === "planejada") },
    { status: "em_transito", cargas: cargas.filter((c) => c.status === "em_transito") },
    { status: "entregue", cargas: cargas.filter((c) => c.status === "entregue") },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(({ status, cargas: columnCargas }) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <div key={status} className="space-y-4">
            {/* Column Header */}
            <div
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                config.bgColor
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", config.dotColor)} />
              <span className={cn("font-semibold", config.textColor)}>
                {config.label}
              </span>
              <span className="ml-auto text-muted-foreground text-sm">
                {columnCargas.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnCargas.map((carga) => (
                <div
                  key={carga.id}
                  onClick={() => onViewCarga(carga)}
                  className={cn(
                    "p-4 rounded-xl border-l-4 bg-card cursor-pointer transition-all",
                    "hover:-translate-y-1 hover:shadow-lg",
                    config.borderColor
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-foreground">{carga.nome}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(carga.data_carregamento).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  
                  {carga.percurso && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {carga.percurso}
                    </p>
                  )}
                  
                  {carga.cliente && (
                    <p className="text-xs text-primary font-medium">
                      {carga.cliente.nome}
                    </p>
                  )}

                  {carga.financeiro && (
                    <p className="text-sm font-semibold text-green-400 mt-2">
                      R$ {carga.financeiro.faturamento?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
              ))}

              {columnCargas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma carga
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
