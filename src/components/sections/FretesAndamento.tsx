import { KanbanView } from "@/components/dashboard/KanbanView";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Calendar } from "lucide-react";
import { useState } from "react";
import { useCargasEmAndamento, CargaCompleta } from "@/hooks/useCargas";
import { Skeleton } from "@/components/ui/skeleton";

interface FretesAndamentoProps {
  onAddCarga: () => void;
  onViewCarga: (carga: CargaCompleta) => void;
}

type ViewMode = "kanban" | "calendar";

export function FretesAndamento({ onAddCarga, onViewCarga }: FretesAndamentoProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const { data: cargas, isLoading } = useCargasEmAndamento();

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-primary">Fretes em Andamento</h2>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </button>
          </div>
        </div>

        <Button onClick={onAddCarga} className="gradient-primary shadow-glow shadow-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Nova Carga</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (cargas?.length || 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum frete em andamento no momento.</p>
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanView cargas={cargas || []} onViewCarga={onViewCarga} />
      ) : (
        <CalendarView cargas={cargas || []} onViewCarga={onViewCarga} />
      )}
    </section>
  );
}
