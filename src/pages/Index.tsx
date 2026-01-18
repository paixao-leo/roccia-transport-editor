import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/sections/Dashboard";
import { FretesAndamento } from "@/components/sections/FretesAndamento";
import { Historico } from "@/components/sections/Historico";
import { Clientes } from "@/components/sections/Clientes";
import { Motoristas } from "@/components/sections/Motoristas";
import { Veiculos } from "@/components/sections/Veiculos";
import { Saldos } from "@/components/sections/Saldos";
import { PlaceholderSection } from "@/components/sections/PlaceholderSection";
import { CargaModal } from "@/components/modals/CargaModal";
import { ClienteModal } from "@/components/modals/ClienteModal";
import { CargaCompleta } from "@/hooks/useCargas";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<CargaCompleta | null>(null);
  const { toast } = useToast();

  const handleViewCarga = (carga: CargaCompleta) => {
    setSelectedCarga(carga);
    // TODO: Open details modal
    toast({
      title: carga.nome,
      description: `Percurso: ${carga.percurso || "N/A"}`,
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Dashboard
            onAddCarga={() => setIsCargoModalOpen(true)}
            onViewCarga={handleViewCarga}
          />
        );
      case "fretes-andamento":
        return (
          <FretesAndamento
            onAddCarga={() => setIsCargoModalOpen(true)}
            onViewCarga={handleViewCarga}
          />
        );
      case "historico":
        return <Historico onViewCarga={handleViewCarga} />;
      case "clientes":
        return (
          <Clientes
            onAddCliente={() => setIsClienteModalOpen(true)}
            onViewCliente={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
          />
        );
      case "saldos":
        return <Saldos />;
      case "motoristas":
        return (
          <Motoristas
            onAddMotorista={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
            onViewMotorista={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
          />
        );
      case "veiculos":
        return (
          <Veiculos
            onAddVeiculo={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
            onViewVeiculo={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento." })}
          />
        );
      case "relatorios":
        return <PlaceholderSection title="Relatórios" buttonText="Gerar Relatório" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main content with padding for mobile header */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-background/80 backdrop-blur-sm pt-20 lg:pt-8">
        {renderSection()}
      </main>

      {/* Modals */}
      <CargaModal open={isCargoModalOpen} onOpenChange={setIsCargoModalOpen} />
      <ClienteModal open={isClienteModalOpen} onOpenChange={setIsClienteModalOpen} />
    </div>
  );
};

export default Index;
