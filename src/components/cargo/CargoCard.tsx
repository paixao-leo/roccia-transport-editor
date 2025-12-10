import { cn } from "@/lib/utils";
import { MapPin, User, Package, Calendar } from "lucide-react";

// Re-exportando do types/cargo para manter compatibilidade
export type { Cargo } from "@/types/cargo";
import { Cargo } from "@/types/cargo";
import { calcularFinanceiroCarga } from "@/types/cargo";

interface CargoCardProps {
  cargo: Cargo;
  onClick?: () => void;
  colorIndex?: number;
}

const clientColors = [
  "border-l-primary",
  "border-l-red-500",
  "border-l-gray-500",
  "border-l-red-900",
  "border-l-gray-700",
  "border-l-amber-800",
  "border-l-orange-700",
  "border-l-purple-700",
  "border-l-orange-600",
  "border-l-blue-600",
  "border-l-green-600",
  "border-l-orange-500",
];

const statusConfig = {
  "em-transito": {
    label: "Em Trânsito",
    className: "status-transit",
  },
  "entregue": {
    label: "Entregue",
    className: "status-delivered",
  },
  "em-aberto": {
    label: "Em Aberto",
    className: "status-open",
  },
};

export function CargoCard({ cargo, onClick, colorIndex = 0 }: CargoCardProps) {
  const status = statusConfig[cargo.status];
  const borderColor = clientColors[colorIndex % clientColors.length];

  return (
    <div
      onClick={onClick}
      className={cn("cargo-card", borderColor)}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-lg text-foreground">
          CARGA {String(cargo.numCarga).padStart(2, "0")}
        </span>
        <span className={cn("status-badge", status.className)}>
          {status.label}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Origem
          </span>
          <span className="font-semibold text-foreground text-sm">{cargo.origem}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Destino
          </span>
          <span className="font-semibold text-foreground text-sm">{cargo.destino}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <User className="w-3 h-3" /> Motorista
          </span>
          <span className="font-semibold text-foreground text-sm">{cargo.motorista}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <Package className="w-3 h-3" /> Cliente
          </span>
          <span className="font-semibold text-foreground text-sm">{cargo.clienteNome}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Calendar className="w-4 h-4" />
          {cargo.dataCarga}
        </div>
        <div className="font-bold text-primary text-lg">
          R$ {cargo.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Click hint */}
      <div className="text-center mt-3 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        👆 Clique para ver detalhes
      </div>
    </div>
  );
}
