import { Tables } from "@/integrations/supabase/types";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Carga = Tables<"cargas">;

interface WeeklyCalendarViewProps {
  cargas: Carga[];
  onViewCarga: (cargo: Carga) => void;
}

const statusColors: Record<string, string> = {
  "em_transito": "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  "entregue": "bg-green-500/20 border-green-500/50 text-green-400",
  "planejada": "bg-blue-500/20 border-blue-500/50 text-blue-400",
};

export function WeeklyCalendarView({ cargas, onViewCarga }: WeeklyCalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getCargasForDay = (date: Date) => {
    return cargas.filter((cargo) => {
      const cargoDate = parseISO(cargo.data_carregamento);
      return isSameDay(cargoDate, date);
    });
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
            Hoje
          </Button>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 6), "dd MMM yyyy", { locale: ptBR })}
        </h3>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`text-center p-2 rounded-t-lg border-b border-border ${
              isSameDay(day, new Date()) ? "bg-primary/20" : "bg-card"
            }`}
          >
            <p className="text-xs text-muted-foreground uppercase">
              {format(day, "EEE", { locale: ptBR })}
            </p>
            <p className={`text-lg font-bold ${isSameDay(day, new Date()) ? "text-primary" : "text-foreground"}`}>
              {format(day, "dd")}
            </p>
          </div>
        ))}

        {/* Day Content */}
        {weekDays.map((day) => {
          const dayCargas = getCargasForDay(day);
          return (
            <div
              key={`content-${day.toISOString()}`}
              className={`min-h-[200px] p-2 rounded-b-lg border border-border ${
                isSameDay(day, new Date()) ? "bg-primary/5" : "bg-card/50"
              }`}
            >
              <div className="space-y-2">
                {dayCargas.map((cargo) => (
                  <button
                    key={cargo.id}
                    onClick={() => onViewCarga(cargo)}
                    className={`w-full text-left p-2 rounded-md border text-xs transition-all hover:scale-[1.02] ${statusColors[cargo.status] || statusColors["planejada"]}`}
                  >
                    <p className="font-semibold truncate">{cargo.nome}</p>
                    <p className="text-[10px] opacity-80 truncate">
                      {cargo.percurso || "--"}
                    </p>
                  </button>
                ))}
                {dayCargas.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Sem cargas
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/50" />
          <span className="text-xs text-muted-foreground">Em Trânsito</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/50" />
          <span className="text-xs text-muted-foreground">Entregue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/50" />
          <span className="text-xs text-muted-foreground">Em Aberto</span>
        </div>
      </div>
    </div>
  );
}
