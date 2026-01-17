import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientesComUltimaCarga, ClienteComUltimaCarga } from "@/hooks/useClientes";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ClientesProps {
  onAddCliente: () => void;
  onViewCliente: (cliente: ClienteComUltimaCarga) => void;
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

export function Clientes({ onAddCliente, onViewCliente }: ClientesProps) {
  const { data: clientes, isLoading } = useClientesComUltimaCarga();
  const [search, setSearch] = useState("");

  const filteredClientes = clientes?.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Gestão de Clientes</h2>
        <Button onClick={onAddCliente} className="gradient-primary shadow-glow shadow-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Novo Cliente</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Buscar cliente por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (filteredClientes?.length || 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClientes?.map((cliente, index) => (
            <div
              key={cliente.id}
              onClick={() => onViewCliente(cliente)}
              className={cn("cargo-card", clientColors[index % clientColors.length])}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg text-foreground">{cliente.nome}</span>
                </div>
              </div>

              {/* Última carga */}
              {cliente.ultima_carga && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    Última carga:{" "}
                    <span className="text-foreground font-medium">
                      {new Date(cliente.ultima_carga).toLocaleDateString("pt-BR")}
                    </span>
                  </span>
                </div>
              )}

              {!cliente.ultima_carga && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-2 bg-muted/50 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span>Sem cargas registradas</span>
                </div>
              )}

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
