import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, User, Phone, CreditCard, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchMotoristas, Motorista } from "@/hooks/useMotoristas";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface MotoristasProps {
  onAddMotorista: () => void;
  onViewMotorista: (motorista: Motorista) => void;
}

const cardColors = [
  "border-l-primary",
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-yellow-500",
  "border-l-purple-500",
  "border-l-orange-500",
];

export function Motoristas({ onAddMotorista, onViewMotorista }: MotoristasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: motoristas, isLoading } = useSearchMotoristas(searchTerm);

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Gestão de Motoristas</h2>
        <Button onClick={onAddMotorista} className="gradient-primary shadow-glow shadow-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Novo Motorista</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (motoristas?.length || 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum motorista encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {motoristas?.map((motorista, index) => (
            <div
              key={motorista.id}
              onClick={() => onViewMotorista(motorista)}
              className={cn("cargo-card", cardColors[index % cardColors.length])}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg text-foreground">{motorista.nome}</span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                {motorista.cpf && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>{motorista.cpf}</span>
                  </div>
                )}
                {motorista.telefone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{motorista.telefone}</span>
                  </div>
                )}
                {motorista.dono_antt && (
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-xs text-muted-foreground">DONO ANTT</span>
                    <p className="text-sm font-medium text-foreground">{motorista.dono_antt}</p>
                  </div>
                )}
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
