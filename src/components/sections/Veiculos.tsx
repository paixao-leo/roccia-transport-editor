import { Button } from "@/components/ui/button";
import { Plus, Car, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVeiculos, Veiculo, TIPOS_VEICULO } from "@/hooks/useVeiculos";
import { Skeleton } from "@/components/ui/skeleton";

interface VeiculosProps {
  onAddVeiculo: () => void;
  onViewVeiculo: (veiculo: Veiculo) => void;
}

const cardColors = [
  "border-l-primary",
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-yellow-500",
  "border-l-purple-500",
  "border-l-orange-500",
];

export function Veiculos({ onAddVeiculo, onViewVeiculo }: VeiculosProps) {
  const { data: veiculos, isLoading } = useVeiculos();

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Gestão de Veículos</h2>
        <Button onClick={onAddVeiculo} className="gradient-primary shadow-glow shadow-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Novo Veículo</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (veiculos?.length || 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum veículo cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {veiculos?.map((veiculo, index) => (
            <div
              key={veiculo.id}
              onClick={() => onViewVeiculo(veiculo)}
              className={cn("cargo-card", cardColors[index % cardColors.length])}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg text-foreground">{veiculo.placa_veiculo}</span>
                </div>
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                  {veiculo.tipo}
                </span>
              </div>

              {/* Placas */}
              <div className="space-y-2">
                {veiculo.placa_carreta_1 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>Carreta 1: <span className="text-foreground">{veiculo.placa_carreta_1}</span></span>
                  </div>
                )}
                {veiculo.placa_carreta_2 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>Carreta 2: <span className="text-foreground">{veiculo.placa_carreta_2}</span></span>
                  </div>
                )}
                {!veiculo.placa_carreta_1 && !veiculo.placa_carreta_2 && (
                  <p className="text-sm text-muted-foreground">Sem carretas vinculadas</p>
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
