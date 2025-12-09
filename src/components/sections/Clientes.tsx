import { Button } from "@/components/ui/button";
import { Plus, Building2, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Cliente {
  id: number;
  nome: string;
  codigo: string;
  cnpj: string;
  telefone: string;
  email: string;
  contato: string;
  endereco: string;
  cidade: string;
  estado: string;
  ativo: boolean;
  observacoes: string;
}

interface ClientesProps {
  clientes: Cliente[];
  onAddCliente: () => void;
  onViewCliente: (cliente: Cliente) => void;
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

export function Clientes({ clientes, onAddCliente, onViewCliente }: ClientesProps) {
  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Gestão de Clientes</h2>
        <Button onClick={onAddCliente} className="gradient-primary shadow-glow shadow-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clientes.map((cliente, index) => (
            <div
              key={cliente.id}
              onClick={() => onViewCliente(cliente)}
              className={cn(
                "cargo-card",
                clientColors[index % clientColors.length]
              )}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg text-foreground">{cliente.nome}</span>
                </div>
                <span className={cn(
                  "status-badge",
                  cliente.ativo ? "status-delivered" : "status-open"
                )}>
                  {cliente.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{cliente.cidade}, {cliente.estado}</span>
                </div>
              </div>

              {/* Click hint */}
              <div className="text-center mt-4 text-xs text-muted-foreground">
                👆 Clique para ver detalhes
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
