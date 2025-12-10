import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CargoCompleta, calcularFinanceiroCarga } from "@/types/cargo";
import { cn } from "@/lib/utils";
import { 
  MapPin, User, Building2, Package, Calendar, DollarSign, FileText, 
  Pencil, Trash2, CheckCircle, Truck, CreditCard, Calculator, Phone
} from "lucide-react";

interface CargoDetailsModalCompletoProps {
  cargo: CargoCompleta | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (cargo: CargoCompleta) => void;
  onDelete?: (cargo: CargoCompleta) => void;
  onMarkDelivered?: (cargo: CargoCompleta) => void;
}

const statusConfig = {
  "em-transito": { label: "Em Trânsito", className: "status-transit" },
  "entregue": { label: "Entregue", className: "status-delivered" },
  "em-aberto": { label: "Em Aberto", className: "status-open" },
};

const docStatusConfig = {
  "em-aberto": { label: "Em Aberto", className: "bg-yellow-500/20 text-yellow-400" },
  "emitido": { label: "Emitido", className: "bg-blue-500/20 text-blue-400" },
  "finalizado": { label: "Finalizado", className: "bg-green-500/20 text-green-400" },
};

export function CargoDetailsModalCompleto({ 
  cargo, open, onClose, onEdit, onDelete, onMarkDelivered 
}: CargoDetailsModalCompletoProps) {
  if (!cargo) return null;

  const status = statusConfig[cargo.status];
  const calculados = calcularFinanceiroCarga(cargo);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl text-primary">
                CARGA {String(cargo.numCarga).padStart(2, "0")}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {cargo.dataCarga} • {cargo.percurso}
              </p>
            </div>
            <span className={cn("status-badge text-sm", status.className)}>
              {status.label}
            </span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4">
          {/* Rota */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-primary">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Rota
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="Origem" value={`${cargo.origem} ${cargo.estadoOrigem}`} />
              <InfoItem label="Destino" value={`${cargo.destino} ${cargo.estadoDestino}`} />
              <InfoItem label="Percurso" value={cargo.percurso} />
              <InfoItem label="Cliente" value={cargo.clienteNome} />
              <InfoItem label="Responsável" value={cargo.responsavelTomador} className="col-span-2" />
            </div>
          </div>

          {/* Motorista */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-blue-500">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Motorista
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="Nome" value={cargo.motorista.nome} className="col-span-2" />
              <InfoItem label="CPF/CNPJ" value={cargo.motorista.cpfCnpj} />
              <InfoItem label="Telefone" value={cargo.motorista.telefone} />
              <InfoItem label="Placa Cavalo" value={cargo.motorista.placaCavalo} />
              <InfoItem label="Placa Carreta" value={cargo.motorista.placaCarreta} />
              {cargo.motorista.donoAnti && (
                <InfoItem label="Dono Anti" value={cargo.motorista.donoAnti} />
              )}
              {cargo.motorista.proprietarioCarreta && (
                <InfoItem label="Proprietário" value={cargo.motorista.proprietarioCarreta} />
              )}
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-green-500">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Dados Bancários
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <InfoItem label="Banco" value={cargo.dadosBancarios.banco} />
              <InfoItem label="Agência" value={cargo.dadosBancarios.agencia} />
              <InfoItem label="Conta" value={cargo.dadosBancarios.conta} />
              <InfoItem label="Tipo Chave" value={cargo.dadosBancarios.tipoChave.toUpperCase()} />
              <InfoItem label="Chave PIX" value={cargo.dadosBancarios.chavePix} className="col-span-2" />
              <InfoItem label="Favorecido" value={cargo.dadosBancarios.nomeFavorecido} className="col-span-3" />
            </div>
          </div>

          {/* Dados da Carga */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-amber-500">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Dados da Carga
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="Mercadoria" value={cargo.dadosCarga.mercadoria} />
              <InfoItem label="Peso" value={`${cargo.dadosCarga.peso.toLocaleString("pt-BR")} KG`} />
              <InfoItem label="Tipo Frete" value={cargo.dadosCarga.tipoCargaFrete.toUpperCase()} />
              <InfoItem label="Veículo" value={`${cargo.dadosCarga.tipoVeiculo} - ${cargo.dadosCarga.numEixos} Eixos`} />
              {cargo.dadosCarga.totalKm && (
                <InfoItem label="Total KM" value={`${cargo.dadosCarga.totalKm.toLocaleString("pt-BR")} km`} />
              )}
            </div>
          </div>

          {/* Valores Principais - Caixa Grande Amarela */}
          <div className="lg:col-span-2 bg-yellow-500/10 p-4 rounded-xl border-l-4 border-l-yellow-500">
            <h4 className="font-semibold text-yellow-500 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financeiro Principal
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ValueBox 
                label="Valor Cobrado Cliente" 
                value={cargo.financeiro.valorFreteCobrado} 
                color="text-yellow-400"
                bg="bg-yellow-500/20"
              />
              <ValueBox 
                label="Frete Motorista (ML)" 
                value={cargo.financeiro.valorFreteMotorista} 
                color="text-blue-400"
                bg="bg-blue-500/20"
              />
              <ValueBox 
                label="Frete para 3º" 
                value={cargo.financeiro.freteTerceiro} 
                color="text-purple-400"
                bg="bg-purple-500/20"
              />
              <ValueBox 
                label="Valor Carga (Est.)" 
                value={cargo.financeiro.valorFreteCobrado * 10} 
                color="text-cyan-400"
                bg="bg-cyan-500/20"
              />
            </div>
          </div>

          {/* Adiantamento e Saldo */}
          <div className="bg-blue-500/10 p-4 rounded-xl border-l-4 border-l-blue-500">
            <h4 className="font-semibold text-blue-400 mb-3">Adiantamento</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem 
                label="Vale Pedágio" 
                value={cargo.financeiro.comValePedagio ? "SIM" : "NÃO"} 
                valueClass={cargo.financeiro.comValePedagio ? "text-green-400" : "text-red-400"}
              />
              <InfoItem 
                label="Valor Pedágio" 
                value={`R$ ${cargo.financeiro.valorPedagio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
              />
              <InfoItem 
                label="% Adiantamento" 
                value={`${cargo.financeiro.percentualAdiantamento}%`} 
              />
              <InfoItem 
                label="Acréscimo/Saldo" 
                value={`R$ ${cargo.financeiro.acrescimoSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-green-500/20 rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Adiantamento</span>
                <p className="text-lg font-bold text-green-400">
                  R$ {cargo.financeiro.valorAdiantamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Saldo</span>
                <p className="text-lg font-bold text-amber-400">
                  R$ {cargo.financeiro.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Impostos */}
          <div className="bg-red-500/10 p-4 rounded-xl border-l-4 border-l-red-500">
            <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Impostos e Taxas
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm mb-3">
              <div className="text-center p-2 bg-background/50 rounded">
                <span className="text-xs text-muted-foreground block">Federal</span>
                <span className="font-bold">{cargo.impostos.percentualFederal}%</span>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <span className="text-xs text-muted-foreground block">ICMS</span>
                <span className="font-bold">{cargo.impostos.percentualIcms}%</span>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <span className="text-xs text-muted-foreground block">Seguro</span>
                <span className="font-bold">{cargo.impostos.percentualSeguradora}%</span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg text-center">
              <span className="text-xs text-muted-foreground">Total Impostos</span>
              <p className="text-lg font-bold text-red-400">
                R$ {calculados.totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Custos Extras */}
          <div className="bg-secondary/50 p-4 rounded-xl border-l-4 border-l-orange-500">
            <h4 className="font-semibold text-orange-400 mb-3">Custos Extras</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <InfoItem label="Custo RCV" value={`R$ ${cargo.custosExtras.custoFixoRcv.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <InfoItem label="Custos GR" value={`R$ ${cargo.custosExtras.custosGr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <InfoItem label="Custos Chapa" value={`R$ ${cargo.custosExtras.custosChapa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <InfoItem label="Diversos" value={`R$ ${cargo.custosExtras.custosDiversos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <InfoItem 
                label="Comissão Agente" 
                value={`${cargo.custosExtras.percentualComissaoAgente}% = R$ ${cargo.custosExtras.comissaoAgente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
                className="col-span-2"
              />
            </div>
          </div>

          {/* Resumo Final - Lucro */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
            <div className="p-4 bg-orange-500/20 rounded-xl text-center">
              <span className="text-sm text-orange-400">Total Despesas</span>
              <p className="text-2xl font-bold text-orange-400">
                R$ {calculados.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-green-500/20 rounded-xl text-center">
              <span className="text-sm text-green-400">% Lucro</span>
              <p className="text-2xl font-bold text-green-400">
                {calculados.percentualLucro.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-green-500/30 rounded-xl text-center border-2 border-green-500">
              <span className="text-sm text-green-400">Valor do Lucro</span>
              <p className="text-2xl font-bold text-green-400">
                R$ {calculados.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Status Documentos */}
          <div className="lg:col-span-2 bg-secondary/50 p-4 rounded-xl border-l-4 border-l-purple-500">
            <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Status dos Documentos
            </h4>
            <div className="flex flex-wrap gap-3">
              <DocBadge 
                label="Cadastro" 
                status={cargo.documentos.cadastro === "ok" ? "finalizado" : "em-aberto"} 
              />
              <DocBadge label="Carta Frete/CIOT" status={cargo.documentos.cartaFreteCiot} />
              <DocBadge label="Manifesto" status={cargo.documentos.manifesto} />
              <DocBadge 
                label="Finalizado" 
                status={cargo.documentos.finalizado ? "finalizado" : "em-aberto"} 
              />
              {cargo.documentos.numeroManifesto && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">
                  Nº Manifesto: {cargo.documentos.numeroManifesto}
                </span>
              )}
            </div>
          </div>

          {/* Observações */}
          {cargo.observacoes && (
            <div className="lg:col-span-2 bg-secondary/50 p-4 rounded-xl border-l-4 border-l-gray-500">
              <h4 className="font-semibold text-foreground mb-2">Observações</h4>
              <p className="text-foreground">{cargo.observacoes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-border">
          <Button onClick={() => onEdit?.(cargo)} className="gradient-primary shadow-glow">
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {cargo.status !== "entregue" && (
            <Button
              onClick={() => onMarkDelivered?.(cargo)}
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar Entregue
            </Button>
          )}
          <Button
            onClick={() => onDelete?.(cargo)}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componentes auxiliares
function InfoItem({ 
  label, value, className, valueClass 
}: { 
  label: string; 
  value: string; 
  className?: string;
  valueClass?: string;
}) {
  return (
    <div className={className}>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <p className={cn("font-semibold text-foreground", valueClass)}>{value || "—"}</p>
    </div>
  );
}

function ValueBox({ 
  label, value, color, bg 
}: { 
  label: string; 
  value: number; 
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("p-3 rounded-lg text-center", bg)}>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <p className={cn("text-lg font-bold", color)}>
        R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function DocBadge({ label, status }: { label: string; status: string }) {
  const config = docStatusConfig[status as keyof typeof docStatusConfig] || docStatusConfig["em-aberto"];
  return (
    <span className={cn("px-3 py-1 rounded-full text-sm", config.className)}>
      {label}: {config.label}
    </span>
  );
}
