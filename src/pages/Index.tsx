import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/sections/Dashboard";
import { FretesAndamento } from "@/components/sections/FretesAndamento";
import { Historico } from "@/components/sections/Historico";
import { Clientes, Cliente } from "@/components/sections/Clientes";
import { PlaceholderSection } from "@/components/sections/PlaceholderSection";
import { CargoModal } from "@/components/modals/CargoModal";
import { CargoDetailsModal } from "@/components/modals/CargoDetailsModal";
import { Cargo } from "@/components/cargo/CargoCard";
import { sampleCargas, sampleClientes } from "@/data/sampleData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [cargas, setCargas] = useState<Cargo[]>(sampleCargas);
  const [clientes] = useState<Cliente[]>(sampleClientes);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const { toast } = useToast();

  const handleAddCarga = (newCargo: Omit<Cargo, "id" | "numCarga">) => {
    const maxId = Math.max(...cargas.map((c) => c.id), 0);
    const maxNumCarga = Math.max(...cargas.map((c) => c.numCarga), 0);
    
    const cargo: Cargo = {
      ...newCargo,
      id: maxId + 1,
      numCarga: maxNumCarga + 1,
    };
    
    setCargas([cargo, ...cargas]);
    toast({
      title: "Carga adicionada!",
      description: `Carga ${String(cargo.numCarga).padStart(2, "0")} criada com sucesso.`,
    });
  };

  const handleViewCargo = (cargo: Cargo) => {
    setSelectedCargo(cargo);
  };

  const handleMarkDelivered = (cargo: Cargo) => {
    setCargas(cargas.map(c => 
      c.id === cargo.id ? { ...c, status: "entregue" as const } : c
    ));
    setSelectedCargo(null);
    toast({
      title: "Carga entregue!",
      description: `Carga ${String(cargo.numCarga).padStart(2, "0")} marcada como entregue.`,
    });
  };

  const handleDeleteCargo = (cargo: Cargo) => {
    setCargas(cargas.filter(c => c.id !== cargo.id));
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

      <CargoModal
        open={isCargoModalOpen}
        onClose={() => setIsCargoModalOpen(false)}
        onSave={handleAddCarga}
        clientes={clientes}
      />

      <CargoDetailsModal
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
