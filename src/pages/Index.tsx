import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/sections/Dashboard";
import { FretesAndamento } from "@/components/sections/FretesAndamento";
import { Historico } from "@/components/sections/Historico";
import { Clientes, Cliente } from "@/components/sections/Clientes";
import { PlaceholderSection } from "@/components/sections/PlaceholderSection";
import { CargoModalCompleto } from "@/components/modals/CargoModalCompleto";
import { CargoDetailsModalCompleto } from "@/components/modals/CargoDetailsModalCompleto";
import { CargoCompleta, Cargo, toCargoSimples, calcularFinanceiroCarga } from "@/types/cargo";
import { sampleCargasCompletas, sampleClientes } from "@/data/sampleData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [cargasCompletas, setCargasCompletas] = useState<CargoCompleta[]>(sampleCargasCompletas);
  const [clientes] = useState<Cliente[]>(sampleClientes);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoCompleta | null>(null);
  const { toast } = useToast();

  // Converter para formato simplificado para os componentes que usam Cargo
  const cargas: Cargo[] = cargasCompletas.map(toCargoSimples);

  const handleAddCarga = (newCargo: Omit<CargoCompleta, "id" | "numCarga" | "totalDespesas" | "lucro" | "percentualLucro">) => {
    const maxId = Math.max(...cargasCompletas.map((c) => c.id), 0);
    const maxNumCarga = Math.max(...cargasCompletas.map((c) => c.numCarga), 0);
    
    const calculados = calcularFinanceiroCarga(newCargo as Partial<CargoCompleta>);
    
    const cargo: CargoCompleta = {
      ...newCargo,
      id: maxId + 1,
      numCarga: maxNumCarga + 1,
      totalDespesas: calculados.totalDespesas,
      lucro: calculados.lucro,
      percentualLucro: calculados.percentualLucro,
    } as CargoCompleta;
    
    setCargasCompletas([cargo, ...cargasCompletas]);
    toast({
      title: "Carga adicionada!",
      description: `Carga ${String(cargo.numCarga).padStart(2, "0")} criada com sucesso.`,
    });
  };

  const handleViewCargo = (cargo: Cargo) => {
    // Encontrar a carga completa correspondente
    const cargoCompleta = cargasCompletas.find(c => c.id === cargo.id);
    if (cargoCompleta) {
      setSelectedCargo(cargoCompleta);
    }
  };

  const handleMarkDelivered = (cargo: CargoCompleta) => {
    setCargasCompletas(cargasCompletas.map(c => 
      c.id === cargo.id ? { ...c, status: "entregue" as const } : c
    ));
    setSelectedCargo(null);
    toast({
      title: "Carga entregue!",
      description: `Carga ${String(cargo.numCarga).padStart(2, "0")} marcada como entregue.`,
    });
  };

  const handleDeleteCargo = (cargo: CargoCompleta) => {
    setCargasCompletas(cargasCompletas.filter(c => c.id !== cargo.id));
    setSelectedCargo(null);
    toast({
      title: "Carga excluída",
      description: `Carga ${String(cargo.numCarga).padStart(2, "0")} foi removida.`,
      variant: "destructive",
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Dashboard
            cargas={cargas}
            onAddCarga={() => setIsCargoModalOpen(true)}
            onViewCarga={handleViewCargo}
          />
        );
      case "fretes-andamento":
        return (
          <FretesAndamento
            cargas={cargas}
            onAddCarga={() => setIsCargoModalOpen(true)}
            onViewCarga={handleViewCargo}
          />
        );
      case "historico":
        return <Historico cargas={cargas} onViewCarga={handleViewCargo} />;
      case "clientes":
        return (
          <Clientes
            clientes={clientes}
            onAddCliente={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
            onViewCliente={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
          />
        );
      case "saldos":
        return <PlaceholderSection title="Gestão de Saldos" buttonText="Novo Saldo" />;
      case "motoristas":
        return <PlaceholderSection title="Gestão de Motoristas" buttonText="Novo Motorista" />;
      case "relatorios":
        return <PlaceholderSection title="Relatórios" buttonText="Gerar Relatório" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 p-8 overflow-y-auto bg-background/80 backdrop-blur-sm">
        {renderSection()}
      </main>

      <CargoModalCompleto
        open={isCargoModalOpen}
        onClose={() => setIsCargoModalOpen(false)}
        onSave={handleAddCarga}
        clientes={clientes}
      />

      <CargoDetailsModalCompleto
        cargo={selectedCargo}
        open={!!selectedCargo}
        onClose={() => setSelectedCargo(null)}
        onMarkDelivered={handleMarkDelivered}
        onDelete={handleDeleteCargo}
      />
    </div>
  );
};

export default Index;
