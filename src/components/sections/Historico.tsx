import { CargoCard, Cargo } from "@/components/cargo/CargoCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface HistoricoProps {
  cargas: Cargo[];
  onViewCarga: (cargo: Cargo) => void;
}

export function Historico({ cargas, onViewCarga }: HistoricoProps) {
  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Histórico de Cargas</h2>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Filter className="w-4 h-4 mr-2" />
          Filtrar
        </Button>
      </div>

      {cargas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhuma carga no histórico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cargas.map((cargo, index) => (
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
