import { StatCard } from "@/components/dashboard/StatCard";
import { CargoCard, Cargo } from "@/components/cargo/CargoCard";
import { WeeklyCalendarView } from "@/components/dashboard/WeeklyCalendarView";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Calendar } from "lucide-react";
import { useState } from "react";

interface DashboardProps {
  cargas: Cargo[];
  onAddCarga: () => void;
  onViewCarga: (cargo: Cargo) => void;
}

type ViewMode = "kanban" | "calendar";

export function Dashboard({ cargas, onAddCarga, onViewCarga }: DashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const stats = {
    total: cargas.length,
    emTransito: cargas.filter((c) => c.status === "em-transito").length,
    entregues: cargas.filter((c) => c.status === "entregue").length,
    receita: cargas.reduce((sum, c) => sum + c.valor, 0),
  };

  const recentCargas = cargas.slice(0, 6);

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
          <span className="text-muted-foreground">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard value={stats.total} label="Cargas Ativas" />
        <StatCard value={stats.emTransito} label="Em Trânsito" />
        <StatCard value={stats.entregues} label="Entregues" />
        <StatCard
          value={`R$ ${stats.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          label="Receita do Mês"
        />
      </div>

      {/* View Toggle & Header */}
      <div className="section-header mb-6">
        <div className="flex items-center gap-4">
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
          Nova Carga
        </Button>
      </div>

      {/* Content based on view mode */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentCargas.map((cargo, index) => (
            <CargoCard
              key={cargo.id}
              cargo={cargo}
              colorIndex={index}
              onClick={() => onViewCarga(cargo)}
            />
          ))}
        </div>
      ) : (
        <WeeklyCalendarView cargas={cargas} onViewCarga={onViewCarga} />
      )}
    </section>
  );
}
