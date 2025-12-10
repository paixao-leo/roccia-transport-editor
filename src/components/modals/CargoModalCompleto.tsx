import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { CargoCompleta, calcularFinanceiroCarga } from "@/types/cargo";
import { Cliente } from "@/components/sections/Clientes";
import { MapPin, User, Truck, DollarSign, FileText, Building2, Calculator } from "lucide-react";

interface CargoModalCompletoProps {
  open: boolean;
  onClose: () => void;
  onSave: (cargo: Omit<CargoCompleta, "id" | "numCarga" | "totalDespesas" | "lucro" | "percentualLucro">) => void;
  clientes: Cliente[];
  cargoEdit?: CargoCompleta | null;
}

const estadosBrasil = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function CargoModalCompleto({ open, onClose, onSave, clientes, cargoEdit }: CargoModalCompletoProps) {
  const [formData, setFormData] = useState<Partial<CargoCompleta>>({
    dataCarga: new Date().toISOString().split("T")[0],
    origem: "",
    estadoOrigem: "SP",
    destino: "",
    estadoDestino: "MG",
    percurso: "",
    clienteNome: "",
    responsavelTomador: "",
    motorista: {
      nome: "",
      cpfCnpj: "",
      telefone: "",
      donoAnti: "",
      proprietarioCarreta: "",
      placaCavalo: "",
      placaCarreta: "",
    },
    dadosBancarios: {
      banco: "",
      agencia: "",
      conta: "",
      tipoChave: "telefone",
      chavePix: "",
      nomeFavorecido: "",
    },
    dadosCarga: {
      mercadoria: "",
      peso: 0,
      totalKm: 0,
      tipoCargaFrete: "dedicado",
      tipoVeiculo: "TRUCK",
      numEixos: 6,
    },
    financeiro: {
      valorFreteCobrado: 0,
      valorFreteMotorista: 0,
      comValePedagio: false,
      valorPedagio: 0,
      freteTerceiro: 0,
      percentualAdiantamento: 80,
      valorAdiantamento: 0,
      saldo: 0,
      acrescimoSaldo: 0,
    },
    impostos: {
      percentualFederal: 7,
      percentualIcms: 12,
      percentualSeguradora: 0.065,
      valorImpostosFederais: 0,
      valorIcms: 0,
      valorSeguro: 0,
    },
    custosExtras: {
      custoFixoRcv: 25,
      custosGr: 0,
      custosChapa: 0,
      custosDiversos: 0,
      comissaoAgente: 0,
      percentualComissaoAgente: 0,
    },
    documentos: {
      cadastro: "ok",
      faturamento: "",
      finalizado: false,
      cartaFreteCiot: "em-aberto",
      manifesto: "em-aberto",
      numeroManifesto: "",
    },
    status: "em-aberto",
    observacoes: "",
  });

  // Atualizar percurso automaticamente
  useEffect(() => {
    if (formData.estadoOrigem && formData.estadoDestino) {
      setFormData(prev => ({
        ...prev,
        percurso: `${prev.estadoOrigem}>${prev.estadoDestino}`
      }));
    }
  }, [formData.estadoOrigem, formData.estadoDestino]);

  // Calcular adiantamento automaticamente
  useEffect(() => {
    const valorMotorista = formData.financeiro?.valorFreteMotorista || 0;
    const percentual = formData.financeiro?.percentualAdiantamento || 0;
    const adiantamento = valorMotorista * (percentual / 100);
    const saldo = valorMotorista - adiantamento + (formData.financeiro?.acrescimoSaldo || 0);
    
    setFormData(prev => ({
      ...prev,
      financeiro: {
        ...prev.financeiro!,
        valorAdiantamento: adiantamento,
        saldo: saldo,
      }
    }));
  }, [formData.financeiro?.valorFreteMotorista, formData.financeiro?.percentualAdiantamento, formData.financeiro?.acrescimoSaldo]);

  const calculados = calcularFinanceiroCarga(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      dataCarga: new Date(formData.dataCarga!).toLocaleDateString("pt-BR"),
      origem: formData.origem!,
      estadoOrigem: formData.estadoOrigem!,
      destino: formData.destino!,
      estadoDestino: formData.estadoDestino!,
      percurso: formData.percurso!,
      clienteNome: formData.clienteNome!,
      responsavelTomador: formData.responsavelTomador!,
      motorista: formData.motorista!,
      dadosBancarios: formData.dadosBancarios!,
      dadosCarga: formData.dadosCarga!,
      financeiro: formData.financeiro!,
      impostos: formData.impostos!,
      custosExtras: formData.custosExtras!,
      documentos: formData.documentos!,
      status: formData.status!,
      observacoes: formData.observacoes,
    } as any);

    onClose();
  };

  const updateNested = <T extends keyof CargoCompleta>(
    key: T,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [field]: value,
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            {cargoEdit ? "Editar Carga" : "Nova Carga"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="rota" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="rota" className="text-xs">
                <MapPin className="w-4 h-4 mr-1" />Rota
              </TabsTrigger>
              <TabsTrigger value="motorista" className="text-xs">
                <User className="w-4 h-4 mr-1" />Motorista
              </TabsTrigger>
              <TabsTrigger value="carga" className="text-xs">
                <Truck className="w-4 h-4 mr-1" />Carga
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="text-xs">
                <DollarSign className="w-4 h-4 mr-1" />Financeiro
              </TabsTrigger>
              <TabsTrigger value="impostos" className="text-xs">
                <Calculator className="w-4 h-4 mr-1" />Impostos
              </TabsTrigger>
              <TabsTrigger value="docs" className="text-xs">
                <FileText className="w-4 h-4 mr-1" />Docs
              </TabsTrigger>
            </TabsList>

            {/* Aba Rota */}
            <TabsContent value="rota" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data da Carga</Label>
                  <Input
                    type="date"
                    value={formData.dataCarga}
                    onChange={(e) => setFormData({ ...formData, dataCarga: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em-aberto">Em Aberto</SelectItem>
                      <SelectItem value="em-transito">Em Trânsito</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Origem (Cidade)</Label>
                  <Input
                    placeholder="Ex: MAUA"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value.toUpperCase() })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.estadoOrigem}
                    onValueChange={(value) => setFormData({ ...formData, estadoOrigem: value })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Destino (Cidade)</Label>
                  <Input
                    placeholder="Ex: MANHUACU"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value.toUpperCase() })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.estadoDestino}
                    onValueChange={(value) => setFormData({ ...formData, estadoDestino: value })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Percurso</Label>
                  <Input
                    value={formData.percurso}
                    className="form-input bg-muted"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente / Tomador</Label>
                  <Select
                    value={formData.clienteNome}
                    onValueChange={(value) => setFormData({ ...formData, clienteNome: value })}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.filter(c => c.ativo).map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.nome}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável Tomador</Label>
                  <Input
                    value={formData.responsavelTomador}
                    onChange={(e) => setFormData({ ...formData, responsavelTomador: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Motorista */}
            <TabsContent value="motorista" className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-xl border-l-4 border-l-primary">
                <h4 className="font-semibold text-foreground mb-4">Dados do Motorista</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={formData.motorista?.nome}
                      onChange={(e) => updateNested("motorista", "nome", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF/CNPJ</Label>
                    <Input
                      value={formData.motorista?.cpfCnpj}
                      onChange={(e) => updateNested("motorista", "cpfCnpj", e.target.value)}
                      className="form-input"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.motorista?.telefone}
                      onChange={(e) => updateNested("motorista", "telefone", e.target.value)}
                      className="form-input"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dono Anti</Label>
                    <Input
                      value={formData.motorista?.donoAnti}
                      onChange={(e) => updateNested("motorista", "donoAnti", e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proprietário Carreta</Label>
                    <Input
                      value={formData.motorista?.proprietarioCarreta}
                      onChange={(e) => updateNested("motorista", "proprietarioCarreta", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-xl border-l-4 border-l-amber-500">
                <h4 className="font-semibold text-foreground mb-4">Veículos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Placa Cavalo</Label>
                    <Input
                      value={formData.motorista?.placaCavalo}
                      onChange={(e) => updateNested("motorista", "placaCavalo", e.target.value.toUpperCase())}
                      className="form-input"
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placa Carreta</Label>
                    <Input
                      value={formData.motorista?.placaCarreta}
                      onChange={(e) => updateNested("motorista", "placaCarreta", e.target.value.toUpperCase())}
                      className="form-input"
                      placeholder="XYZ-5678"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-xl border-l-4 border-l-green-500">
                <h4 className="font-semibold text-foreground mb-4">Dados Bancários</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      value={formData.dadosBancarios?.banco}
                      onChange={(e) => updateNested("dadosBancarios", "banco", e.target.value)}
                      className="form-input"
                      placeholder="ITAU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      value={formData.dadosBancarios?.agencia}
                      onChange={(e) => updateNested("dadosBancarios", "agencia", e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      value={formData.dadosBancarios?.conta}
                      onChange={(e) => updateNested("dadosBancarios", "conta", e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Chave PIX</Label>
                    <Select
                      value={formData.dadosBancarios?.tipoChave}
                      onValueChange={(value) => updateNested("dadosBancarios", "tipoChave", value)}
                    >
                      <SelectTrigger className="form-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input
                      value={formData.dadosBancarios?.chavePix}
                      onChange={(e) => updateNested("dadosBancarios", "chavePix", e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Favorecido</Label>
                    <Input
                      value={formData.dadosBancarios?.nomeFavorecido}
                      onChange={(e) => updateNested("dadosBancarios", "nomeFavorecido", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba Carga */}
            <TabsContent value="carga" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mercadoria</Label>
                  <Input
                    value={formData.dadosCarga?.mercadoria}
                    onChange={(e) => updateNested("dadosCarga", "mercadoria", e.target.value.toUpperCase())}
                    className="form-input"
                    placeholder="Ex: ADUBO"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (KG)</Label>
                  <Input
                    type="number"
                    value={formData.dadosCarga?.peso}
                    onChange={(e) => updateNested("dadosCarga", "peso", parseFloat(e.target.value) || 0)}
                    className="form-input"
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total KM</Label>
                  <Input
                    type="number"
                    value={formData.dadosCarga?.totalKm}
                    onChange={(e) => updateNested("dadosCarga", "totalKm", parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Carga/Frete</Label>
                  <Select
                    value={formData.dadosCarga?.tipoCargaFrete}
                    onValueChange={(value) => updateNested("dadosCarga", "tipoCargaFrete", value)}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dedicado">Dedicado</SelectItem>
                      <SelectItem value="fracionado">Fracionado</SelectItem>
                      <SelectItem value="lotacao">Lotação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo Veículo</Label>
                  <Select
                    value={formData.dadosCarga?.tipoVeiculo}
                    onValueChange={(value) => updateNested("dadosCarga", "tipoVeiculo", value)}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRUCK">Truck</SelectItem>
                      <SelectItem value="CARRETA">Carreta</SelectItem>
                      <SelectItem value="BITREM">Bitrem</SelectItem>
                      <SelectItem value="RODOTREM">Rodotrem</SelectItem>
                      <SelectItem value="VAN">Van</SelectItem>
                      <SelectItem value="VUC">VUC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nº Eixos</Label>
                  <Input
                    type="number"
                    value={formData.dadosCarga?.numEixos}
                    onChange={(e) => updateNested("dadosCarga", "numEixos", parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="form-input"
                  placeholder="Observações gerais sobre a carga..."
                />
              </div>
            </TabsContent>

            {/* Aba Financeiro */}
            <TabsContent value="financeiro" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-yellow-500/10 rounded-xl border-l-4 border-l-yellow-500">
                  <h4 className="font-semibold text-yellow-500 mb-4">Valores Principais</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Valor Cobrado ao Cliente (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.financeiro?.valorFreteCobrado}
                        onChange={(e) => updateNested("financeiro", "valorFreteCobrado", parseFloat(e.target.value) || 0)}
                        className="form-input text-lg font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frete ML - Valor Acordado Motorista (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.financeiro?.valorFreteMotorista}
                        onChange={(e) => updateNested("financeiro", "valorFreteMotorista", parseFloat(e.target.value) || 0)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frete para 3º (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.financeiro?.freteTerceiro}
                        onChange={(e) => updateNested("financeiro", "freteTerceiro", parseFloat(e.target.value) || 0)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-xl border-l-4 border-l-blue-500">
                  <h4 className="font-semibold text-blue-400 mb-4">Pedágio e Adiantamento</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Com Vale Pedágio?</Label>
                      <Switch
                        checked={formData.financeiro?.comValePedagio}
                        onCheckedChange={(checked) => updateNested("financeiro", "comValePedagio", checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor do Pedágio (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.financeiro?.valorPedagio}
                        onChange={(e) => updateNested("financeiro", "valorPedagio", parseFloat(e.target.value) || 0)}
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>% Adiantamento</Label>
                      <Input
                        type="number"
                        value={formData.financeiro?.percentualAdiantamento}
                        onChange={(e) => updateNested("financeiro", "percentualAdiantamento", parseFloat(e.target.value) || 0)}
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Acréscimo/Saldo (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.financeiro?.acrescimoSaldo}
                        onChange={(e) => updateNested("financeiro", "acrescimoSaldo", parseFloat(e.target.value) || 0)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Valores Calculados */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-500/10 rounded-xl border-l-4 border-l-green-500">
                <div>
                  <span className="text-sm text-muted-foreground">Adiantamento:</span>
                  <p className="text-lg font-bold text-foreground">
                    R$ {(formData.financeiro?.valorAdiantamento || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Saldo:</span>
                  <p className="text-lg font-bold text-foreground">
                    R$ {(formData.financeiro?.saldo || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Aba Impostos */}
            <TabsContent value="impostos" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-500/10 rounded-xl text-center">
                  <Label className="text-red-400">Impostos Federais (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.impostos?.percentualFederal}
                    onChange={(e) => updateNested("impostos", "percentualFederal", parseFloat(e.target.value) || 0)}
                    className="form-input text-center mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Fixo</p>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-xl text-center">
                  <Label className="text-orange-400">ICMS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.impostos?.percentualIcms}
                    onChange={(e) => updateNested("impostos", "percentualIcms", parseFloat(e.target.value) || 0)}
                    className="form-input text-center mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Ajustável</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-xl text-center">
                  <Label className="text-purple-400">Seguradora (%)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.impostos?.percentualSeguradora}
                    onChange={(e) => updateNested("impostos", "percentualSeguradora", parseFloat(e.target.value) || 0)}
                    className="form-input text-center mt-2"
                  />
                </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-xl">
                <h4 className="font-semibold text-foreground mb-4">Custos Extras</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Custo Fixo RCV (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosExtras?.custoFixoRcv}
                      onChange={(e) => updateNested("custosExtras", "custoFixoRcv", parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custos de GR (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosExtras?.custosGr}
                      onChange={(e) => updateNested("custosExtras", "custosGr", parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custos de Chapa (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosExtras?.custosChapa}
                      onChange={(e) => updateNested("custosExtras", "custosChapa", parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custos Diversos (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosExtras?.custosDiversos}
                      onChange={(e) => updateNested("custosExtras", "custosDiversos", parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>% Comissão Agente</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosExtras?.percentualComissaoAgente}
                      onChange={(e) => updateNested("custosExtras", "percentualComissaoAgente", parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Comissão Agente (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosExtras?.comissaoAgente}
                      onChange={(e) => updateNested("custosExtras", "comissaoAgente", parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-500/20 rounded-xl text-center">
                  <span className="text-sm text-red-400">Total Impostos</span>
                  <p className="text-xl font-bold text-red-400">
                    R$ {calculados.totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-orange-500/20 rounded-xl text-center">
                  <span className="text-sm text-orange-400">Total Despesas</span>
                  <p className="text-xl font-bold text-orange-400">
                    R$ {calculados.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-green-500/20 rounded-xl text-center">
                  <span className="text-sm text-green-400">Lucro ({calculados.percentualLucro.toFixed(1)}%)</span>
                  <p className="text-xl font-bold text-green-400">
                    R$ {calculados.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Aba Documentos */}
            <TabsContent value="docs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cadastro</Label>
                  <Select
                    value={formData.documentos?.cadastro}
                    onValueChange={(value) => updateNested("documentos", "cadastro", value)}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ok">OK</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Faturamento</Label>
                  <Input
                    value={formData.documentos?.faturamento}
                    onChange={(e) => updateNested("documentos", "faturamento", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carta Frete / CIOT</Label>
                  <Select
                    value={formData.documentos?.cartaFreteCiot}
                    onValueChange={(value) => updateNested("documentos", "cartaFreteCiot", value)}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em-aberto">Em Aberto</SelectItem>
                      <SelectItem value="emitido">Emitido</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Manifesto</Label>
                  <Select
                    value={formData.documentos?.manifesto}
                    onValueChange={(value) => updateNested("documentos", "manifesto", value)}
                  >
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em-aberto">Em Aberto</SelectItem>
                      <SelectItem value="emitido">Emitido</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nº Manifesto</Label>
                  <Input
                    value={formData.documentos?.numeroManifesto}
                    onChange={(e) => updateNested("documentos", "numeroManifesto", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="flex items-center gap-3 p-4">
                  <Switch
                    checked={formData.documentos?.finalizado}
                    onCheckedChange={(checked) => updateNested("documentos", "finalizado", checked)}
                  />
                  <Label>Finalizado</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gradient-primary shadow-glow">
              Salvar Carga
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
