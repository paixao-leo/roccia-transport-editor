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
import { CargaEditModal } from "@/components/modals/CargaEditModal";
import { ClienteModal } from "@/components/modals/ClienteModal";
import { ClienteEditModal } from "@/components/modals/ClienteEditModal";
import { MotoristaModal } from "@/components/modals/MotoristaModal";
import { VeiculoModal } from "@/components/modals/VeiculoModal";
import { SaldoEditModal } from "@/components/modals/SaldoEditModal";
import { CargaCompleta } from "@/hooks/useCargas";
import { Cliente } from "@/hooks/useClientes";
import { Motorista } from "@/hooks/useMotoristas";
import { Veiculo } from "@/hooks/useVeiculos";
import { PagamentoComDetalhes } from "@/hooks/usePagamentos";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Modal states
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isMotoristaModalOpen, setIsMotoristaModalOpen] = useState(false);
  const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);
  
  // Edit modal states
  const [selectedCarga, setSelectedCarga] = useState<CargaCompleta | null>(null);
  const [isCargaEditModalOpen, setIsCargaEditModalOpen] = useState(false);
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isClienteEditModalOpen, setIsClienteEditModalOpen] = useState(false);
  
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null);
  const [isMotoristaEditModalOpen, setIsMotoristaEditModalOpen] = useState(false);
  
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [isVeiculoEditModalOpen, setIsVeiculoEditModalOpen] = useState(false);
  
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoComDetalhes | null>(null);
  const [isSaldoEditModalOpen, setIsSaldoEditModalOpen] = useState(false);

  // Handlers for viewing/editing
  const handleViewCarga = (carga: CargaCompleta) => {
    setSelectedCarga(carga);
    setIsCargaEditModalOpen(true);
  };

  const handleViewCliente = (cliente: any) => {
    // Cliente pode vir da view clientes_com_ultima_carga, precisamos buscar os dados completos
    setSelectedCliente(cliente as Cliente);
    setIsClienteEditModalOpen(true);
  };

  const handleViewMotorista = (motorista: Motorista) => {
    setSelectedMotorista(motorista);
    setIsMotoristaEditModalOpen(true);
  };

  const handleViewVeiculo = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsVeiculoEditModalOpen(true);
  };

  const handleViewPagamento = (pagamento: PagamentoComDetalhes) => {
    setSelectedPagamento(pagamento);
    setIsSaldoEditModalOpen(true);
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
            onViewCliente={handleViewCliente}
          />
        );
      case "saldos":
        return <Saldos onViewPagamento={handleViewPagamento} />;
      case "motoristas":
        return (
          <Motoristas
            onAddMotorista={() => setIsMotoristaModalOpen(true)}
            onViewMotorista={handleViewMotorista}
          />
        );
      case "veiculos":
        return (
          <Veiculos
            onAddVeiculo={() => setIsVeiculoModalOpen(true)}
            onViewVeiculo={handleViewVeiculo}
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

      {/* Create Modals */}
      <CargaModal open={isCargoModalOpen} onOpenChange={setIsCargoModalOpen} />
      <ClienteModal open={isClienteModalOpen} onOpenChange={setIsClienteModalOpen} />
      <MotoristaModal 
        open={isMotoristaModalOpen} 
        onOpenChange={setIsMotoristaModalOpen} 
        mode="create" 
      />
      <VeiculoModal 
        open={isVeiculoModalOpen} 
        onOpenChange={setIsVeiculoModalOpen} 
        mode="create" 
      />

      {/* Edit Modals */}
      <CargaEditModal
        carga={selectedCarga}
        open={isCargaEditModalOpen}
        onOpenChange={setIsCargaEditModalOpen}
      />
      <ClienteEditModal
        cliente={selectedCliente}
        open={isClienteEditModalOpen}
        onOpenChange={setIsClienteEditModalOpen}
      />
      <MotoristaModal
        motorista={selectedMotorista}
        open={isMotoristaEditModalOpen}
        onOpenChange={setIsMotoristaEditModalOpen}
        mode="edit"
      />
      <VeiculoModal
        veiculo={selectedVeiculo}
        open={isVeiculoEditModalOpen}
        onOpenChange={setIsVeiculoEditModalOpen}
        mode="edit"
      />
      <SaldoEditModal
        pagamento={selectedPagamento}
        open={isSaldoEditModalOpen}
        onOpenChange={setIsSaldoEditModalOpen}
      />
    </div>
  );
};

export default Index;
