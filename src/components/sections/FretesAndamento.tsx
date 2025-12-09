import { CargoCard, Cargo } from "@/components/cargo/CargoCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FretesAndamentoProps {
  cargas: Cargo[];
  onAddCarga: () => void;
  onViewCarga: (cargo: Cargo) => void;
}

export function FretesAndamento({ cargas, onAddCarga, onViewCarga }: FretesAndamentoProps) {
  const fretesAtivos = cargas.filter(c => c.status !== "entregue");

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Fretes em Andamento</h2>
        <Button onClick={onAddCarga} className="gradient-primary shadow-glow shadow-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nova Carga
        </Button>
      </div>

      {fretesAtivos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum frete em andamento no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fretesAtivos.map((cargo, index) => (
            <CargoCard
              key={cargo.id}
              cargo={cargo}
              colorIndex={index}
              onClick={() => onViewCarga(cargo)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
