import { StatCard } from "@/components/dashboard/StatCard";
import { FaturamentoCard } from "@/components/dashboard/FaturamentoCard";
import { KanbanView } from "@/components/dashboard/KanbanView";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Calendar } from "lucide-react";
import { useState } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useCargasEmAndamento, CargaCompleta } from "@/hooks/useCargas";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  onAddCarga: () => void;
  onViewCarga: (carga: CargaCompleta) => void;
}

type ViewMode = "kanban" | "calendar";

export function Dashboard({ onAddCarga, onViewCarga }: DashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const { data: stats, isLoading: statsLoading } = useDashboardStats("mes");
  const { data: cargas, isLoading: cargasLoading } = useCargasEmAndamento();

  return (
    <section className="animate-slide-in">
      {/* Header */}
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Online</span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : (
          <>
            <StatCard value={stats?.cargasAtivas || 0} label="Cargas Ativas" />
            <StatCard value={stats?.emTransito || 0} label="Em Trânsito" />
            <StatCard value={stats?.entregues || 0} label="Entregues" />
            <FaturamentoCard />
          </>
        )}
      </div>

      {/* View Toggle & Header */}
      <div className="section-header mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-xl font-bold text-foreground">Cargas em Andamento</h3>

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

      {/* Content based on view mode */}
      {cargasLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanView cargas={cargas || []} onViewCarga={onViewCarga} />
      ) : (
        <CalendarView cargas={cargas || []} onViewCarga={onViewCarga} />
      )}
    </section>
  );
}
