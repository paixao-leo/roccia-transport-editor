import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { MapPin, Package, Calendar, Truck, Pencil, Trash2, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type Carga = Tables<"cargas">;

interface CargoDetailsModalProps {
  cargo: Carga | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (cargo: Carga) => void;
  onDelete?: (cargo: Carga) => void;
  onMarkDelivered?: (cargo: Carga) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  "planejada": {
    label: "Planejada",
    className: "bg-blue-500/20 text-blue-400 border border-blue-500/50",
  },
  "em_transito": {
    label: "Em Trânsito",
    className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
  },
  "entregue": {
    label: "Entregue",
    className: "bg-green-500/20 text-green-400 border border-green-500/50",
  },
};

export function CargoDetailsModal({ cargo, open, onClose, onEdit, onDelete, onMarkDelivered }: CargoDetailsModalProps) {
  if (!cargo) return null;

  const status = statusConfig[cargo.status] || statusConfig["planejada"];
  const percurso = cargo.percurso?.split(" → ") || ["--", "--"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl text-primary">
              {cargo.nome}
            </DialogTitle>
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", status.className)}>
              {status.label}
            </span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Rota */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Rota
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Origem:</span>
                <span className="font-semibold text-foreground">{percurso[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destino:</span>
                <span className="font-semibold text-foreground">{percurso[1] || "--"}</span>
              </div>
            </div>
          </div>

          {/* Data e Etapa */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Informações
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-semibold text-foreground">
                  {format(parseISO(cargo.data_carregamento), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Etapa:</span>
                <span className="font-semibold text-foreground capitalize">{cargo.etapa}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary md:col-span-2">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Status da Carga
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Atual:</span>
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", status.className)}>
                  {status.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Percurso Completo:</span>
                <span className="font-semibold text-foreground">{cargo.percurso || "--"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-border">
          <Button
            onClick={() => onEdit?.(cargo)}
            className="gradient-primary shadow-glow"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {cargo.status !== "entregue" && (
            <Button
              onClick={() => onMarkDelivered?.(cargo)}
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar Entregue
            </Button>
          )}
          <Button
            onClick={() => onDelete?.(cargo)}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
