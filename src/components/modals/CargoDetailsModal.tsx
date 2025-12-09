import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cargo } from "@/components/cargo/CargoCard";
import { cn } from "@/lib/utils";
import { MapPin, User, Building2, Package, Calendar, DollarSign, FileText, Pencil, Trash2, CheckCircle } from "lucide-react";

interface CargoDetailsModalProps {
  cargo: Cargo | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (cargo: Cargo) => void;
  onDelete?: (cargo: Cargo) => void;
  onMarkDelivered?: (cargo: Cargo) => void;
}

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

export function CargoDetailsModal({ cargo, open, onClose, onEdit, onDelete, onMarkDelivered }: CargoDetailsModalProps) {
  if (!cargo) return null;

  const status = statusConfig[cargo.status];
  const comissao = cargo.valor * 0.8;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl text-primary">
              CARGA {String(cargo.numCarga).padStart(2, "0")}
            </DialogTitle>
            <span className={cn("status-badge text-sm", status.className)}>
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
                <span className="font-semibold text-foreground">{cargo.origem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destino:</span>
                <span className="font-semibold text-foreground">{cargo.destino}</span>
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Responsáveis
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motorista:</span>
                <span className="font-semibold text-foreground">{cargo.motorista}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-foreground">{cargo.clienteNome}</span>
              </div>
            </div>
          </div>

          {/* Carga */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Carga
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peso:</span>
                <span className="font-semibold text-foreground">{cargo.peso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-semibold text-foreground">{cargo.dataCarga}</span>
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Financeiro
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Frete:</span>
                <span className="font-semibold text-primary">
                  R$ {cargo.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comissão (80%):</span>
                <span className="font-semibold text-foreground">
                  R$ {comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {cargo.observacoes && (
            <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary md:col-span-2">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Observações
              </h4>
              <p className="text-foreground">{cargo.observacoes}</p>
            </div>
          )}
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
