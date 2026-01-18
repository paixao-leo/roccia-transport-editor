import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateCarga } from "@/hooks/useCargas";
import { useClientes, useCreateCliente } from "@/hooks/useClientes";
import { useMotoristas, useCreateMotorista } from "@/hooks/useMotoristas";
import { useVeiculos, useCreateVeiculo, TIPOS_VEICULO } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Package,
  Loader2,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  User,
  Truck,
  DollarSign,
  FileText,
} from "lucide-react";

interface CargaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Etapa = "info" | "motorista" | "veiculo" | "financeiro" | "docs";

const ETAPAS: { key: Etapa; label: string; icon: React.ReactNode }[] = [
  { key: "info", label: "Info", icon: <Package className="w-4 h-4" /> },
  { key: "motorista", label: "Motorista", icon: <User className="w-4 h-4" /> },
  { key: "veiculo", label: "Veículo", icon: <Truck className="w-4 h-4" /> },
  { key: "financeiro", label: "Financeiro", icon: <DollarSign className="w-4 h-4" /> },
  { key: "docs", label: "Docs", icon: <FileText className="w-4 h-4" /> },
];

interface FormData {
  // Info
  nome: string;
  data_carregamento: Date | undefined;
  cliente_id: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  // Motorista
  motorista_id: string;
  novo_motorista: { nome: string; cpf: string; telefone: string; dono_antt: string };
  criar_motorista: boolean;
  // Veículo
  veiculo_id: string;
  novo_veiculo: { tipo: string; placa_veiculo: string; placa_carreta_1: string; placa_carreta_2: string };
  criar_veiculo: boolean;
  // Financeiro
  faturamento: string;
  valor_mercadoria: string;
  percentual_seguro: string;
  frete_terceiro: string;
  impostos: string;
  custos_extras: string;
}

const initialFormData: FormData = {
  nome: "",
  data_carregamento: undefined,
  cliente_id: "",
  origem_cidade: "",
  origem_estado: "",
  destino_cidade: "",
  destino_estado: "",
  motorista_id: "",
  novo_motorista: { nome: "", cpf: "", telefone: "", dono_antt: "" },
  criar_motorista: false,
  veiculo_id: "",
  novo_veiculo: { tipo: "", placa_veiculo: "", placa_carreta_1: "", placa_carreta_2: "" },
  criar_veiculo: false,
  faturamento: "",
  valor_mercadoria: "",
  percentual_seguro: "0.35",
  frete_terceiro: "",
  impostos: "",
  custos_extras: "",
};

export function CargaModal({ open, onOpenChange }: CargaModalProps) {
  const [etapaAtual, setEtapaAtual] = useState<Etapa>("info");
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const createCarga = useCreateCarga();
  const createMotorista = useCreateMotorista();
  const createVeiculo = useCreateVeiculo();

  const { data: clientes } = useClientes();
  const { data: motoristas } = useMotoristas();
  const { data: veiculos } = useVeiculos();

  const { toast } = useToast();

  const etapaIndex = ETAPAS.findIndex((e) => e.key === etapaAtual);

  // Computed percurso
  const percurso =
    formData.origem_cidade && formData.destino_cidade
      ? `${formData.origem_cidade} - ${formData.origem_estado} → ${formData.destino_cidade} - ${formData.destino_estado}`
      : "";

  // Computed financeiro values
  const faturamento = parseFloat(formData.faturamento) || 0;
  const valorMercadoria = parseFloat(formData.valor_mercadoria) || 0;
  const percentualSeguro = parseFloat(formData.percentual_seguro) || 0;
  const valorSeguro = valorMercadoria * (percentualSeguro / 100);
  const freteTerceiro = parseFloat(formData.frete_terceiro) || 0;
  const impostos = parseFloat(formData.impostos) || 0;
  const custosExtras = parseFloat(formData.custos_extras) || 0;
  const totalDespesas = freteTerceiro + impostos + valorSeguro + custosExtras;
  const lucro = faturamento - totalDespesas;

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNovoMotoristaChange = (field: keyof FormData["novo_motorista"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      novo_motorista: { ...prev.novo_motorista, [field]: value },
    }));
  };

  const handleNovoVeiculoChange = (field: keyof FormData["novo_veiculo"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      novo_veiculo: { ...prev.novo_veiculo, [field]: value },
    }));
  };

  const canAdvance = (): boolean => {
    switch (etapaAtual) {
      case "info":
        return !!(formData.nome && formData.data_carregamento);
      case "motorista":
        if (formData.criar_motorista) {
          return !!formData.novo_motorista.nome;
        }
        return !!formData.motorista_id;
      case "veiculo":
        if (formData.criar_veiculo) {
          return !!(formData.novo_veiculo.tipo && formData.novo_veiculo.placa_veiculo);
        }
        return true; // Veiculo is optional
      case "financeiro":
        return !!(formData.faturamento && formData.valor_mercadoria && formData.percentual_seguro);
      case "docs":
        return true;
      default:
        return false;
    }
  };

  const nextEtapa = () => {
    if (etapaIndex < ETAPAS.length - 1) {
      setEtapaAtual(ETAPAS[etapaIndex + 1].key);
    }
  };

  const prevEtapa = () => {
    if (etapaIndex > 0) {
      setEtapaAtual(ETAPAS[etapaIndex - 1].key);
    }
  };

  const handleSubmit = async () => {
    try {
      let motoristaId = formData.motorista_id;
      let veiculoId = formData.veiculo_id;

      // Create new motorista if needed
      if (formData.criar_motorista && formData.novo_motorista.nome) {
        const novoMotorista = await createMotorista.mutateAsync({
          nome: formData.novo_motorista.nome,
          cpf: formData.novo_motorista.cpf || null,
          telefone: formData.novo_motorista.telefone || null,
          dono_antt: formData.novo_motorista.dono_antt || null,
        });
        motoristaId = novoMotorista.id;
      }

      // Create new veiculo if needed
      if (formData.criar_veiculo && formData.novo_veiculo.placa_veiculo) {
        const novoVeiculo = await createVeiculo.mutateAsync({
          tipo: formData.novo_veiculo.tipo,
          placa_veiculo: formData.novo_veiculo.placa_veiculo,
          placa_carreta_1: formData.novo_veiculo.placa_carreta_1 || null,
          placa_carreta_2: formData.novo_veiculo.placa_carreta_2 || null,
        });
        veiculoId = novoVeiculo.id;
      }

      // Create the carga
      await createCarga.mutateAsync({
        carga: {
          nome: formData.nome,
          data_carregamento: format(formData.data_carregamento!, "yyyy-MM-dd"),
          cliente_id: formData.cliente_id || null,
          percurso: percurso || null,
          etapa: "docs",
          status: "planejada",
        },
        financeiro: {
          faturamento,
          valor_mercadoria: valorMercadoria,
          percentual_seguro: percentualSeguro,
          frete_terceiro: freteTerceiro || 0,
          impostos: impostos || 0,
          custos_extras: custosExtras || 0,
        },
        motoristaId: motoristaId || undefined,
        veiculoId: veiculoId || undefined,
      });

      toast({
        title: "Carga cadastrada!",
        description: `${formData.nome} foi criada com sucesso.`,
      });

      handleClose(false);
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar a carga. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData(initialFormData);
      setEtapaAtual("info");
    }
    onOpenChange(open);
  };

  const isLoading = createCarga.isPending || createMotorista.isPending || createVeiculo.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Package className="w-5 h-5" />
            Nova Carga
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          {ETAPAS.map((etapa, idx) => (
            <div key={etapa.key} className="flex items-center">
              <button
                onClick={() => setEtapaAtual(etapa.key)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  idx <= etapaIndex ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    idx < etapaIndex
                      ? "bg-primary border-primary text-primary-foreground"
                      : idx === etapaIndex
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/30"
                  )}
                >
                  {idx < etapaIndex ? <Check className="w-5 h-5" /> : etapa.icon}
                </div>
                <span className="text-xs font-medium hidden sm:block">{etapa.label}</span>
              </button>
              {idx < ETAPAS.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-16 h-0.5 mx-1",
                    idx < etapaIndex ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Etapa content */}
        <div className="min-h-[300px]">
          {etapaAtual === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Nome da Carga <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: Carga São Paulo - Rio"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Data de Carregamento <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.data_carregamento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                        {formData.data_carregamento
                          ? format(formData.data_carregamento, "dd/MM/yyyy", { locale: ptBR })
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_carregamento}
                        onSelect={(date) => handleChange("data_carregamento", date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => handleChange("cliente_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origem - Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={formData.origem_cidade}
                    onChange={(e) => handleChange("origem_cidade", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Origem - Estado</Label>
                  <Input
                    placeholder="UF"
                    maxLength={2}
                    value={formData.origem_estado}
                    onChange={(e) => handleChange("origem_estado", e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destino - Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={formData.destino_cidade}
                    onChange={(e) => handleChange("destino_cidade", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destino - Estado</Label>
                  <Input
                    placeholder="UF"
                    maxLength={2}
                    value={formData.destino_estado}
                    onChange={(e) => handleChange("destino_estado", e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {percurso && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Label className="text-xs text-muted-foreground">Percurso</Label>
                  <p className="text-white font-medium">{percurso}</p>
                </div>
              )}
            </div>
          )}

          {etapaAtual === "motorista" && (
            <div className="space-y-4">
              {!formData.criar_motorista ? (
                <>
                  <div className="space-y-2">
                    <Label>
                      Selecione o Motorista <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.motorista_id}
                      onValueChange={(value) => handleChange("motorista_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um motorista" />
                      </SelectTrigger>
                      <SelectContent>
                        {motoristas?.map((motorista) => (
                          <SelectItem key={motorista.id} value={motorista.id}>
                            {motorista.nome} {motorista.cpf && `(${motorista.cpf})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleChange("criar_motorista", true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Novo Motorista
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg">Novo Motorista</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleChange("criar_motorista", false)}
                    >
                      Selecionar existente
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Nome <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="Nome do motorista"
                        value={formData.novo_motorista.nome}
                        onChange={(e) => handleNovoMotoristaChange("nome", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        placeholder="000.000.000-00"
                        value={formData.novo_motorista.cpf}
                        onChange={(e) => handleNovoMotoristaChange("cpf", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={formData.novo_motorista.telefone}
                        onChange={(e) => handleNovoMotoristaChange("telefone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dono ANTT</Label>
                      <Input
                        placeholder="Nome do proprietário"
                        value={formData.novo_motorista.dono_antt}
                        onChange={(e) => handleNovoMotoristaChange("dono_antt", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {etapaAtual === "veiculo" && (
            <div className="space-y-4">
              {!formData.criar_veiculo ? (
                <>
                  <div className="space-y-2">
                    <Label>Selecione o Veículo</Label>
                    <Select
                      value={formData.veiculo_id}
                      onValueChange={(value) => handleChange("veiculo_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um veículo (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculos?.map((veiculo) => (
                          <SelectItem key={veiculo.id} value={veiculo.id}>
                            {veiculo.placa_veiculo} - {veiculo.tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleChange("criar_veiculo", true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Novo Veículo
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg">Novo Veículo</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleChange("criar_veiculo", false)}
                    >
                      Selecionar existente
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Tipo <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.novo_veiculo.tipo}
                        onValueChange={(value) => handleNovoVeiculoChange("tipo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_VEICULO.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Placa do Veículo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="ABC-1234"
                        value={formData.novo_veiculo.placa_veiculo}
                        onChange={(e) =>
                          handleNovoVeiculoChange("placa_veiculo", e.target.value.toUpperCase())
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Placa Carreta 1</Label>
                      <Input
                        placeholder="ABC-1234"
                        value={formData.novo_veiculo.placa_carreta_1}
                        onChange={(e) =>
                          handleNovoVeiculoChange("placa_carreta_1", e.target.value.toUpperCase())
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Placa Carreta 2</Label>
                      <Input
                        placeholder="ABC-1234"
                        value={formData.novo_veiculo.placa_carreta_2}
                        onChange={(e) =>
                          handleNovoVeiculoChange("placa_carreta_2", e.target.value.toUpperCase())
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {etapaAtual === "financeiro" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Faturamento (R$) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={formData.faturamento}
                    onChange={(e) => handleChange("faturamento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Valor da Mercadoria (R$) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={formData.valor_mercadoria}
                    onChange={(e) => handleChange("valor_mercadoria", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Percentual do Seguro (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.35"
                    value={formData.percentual_seguro}
                    onChange={(e) => handleChange("percentual_seguro", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frete Terceiro (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={formData.frete_terceiro}
                    onChange={(e) => handleChange("frete_terceiro", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impostos (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={formData.impostos}
                    onChange={(e) => handleChange("impostos", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custos Extras (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={formData.custos_extras}
                    onChange={(e) => handleChange("custos_extras", e.target.value)}
                  />
                </div>
              </div>

              {/* Calculated values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Seguro</p>
                  <p className="text-lg font-semibold">
                    R$ {valorSeguro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Despesas</p>
                  <p className="text-lg font-semibold text-destructive">
                    R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lucro</p>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      lucro >= 0 ? "text-green-500" : "text-destructive"
                    )}
                  >
                    R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {etapaAtual === "docs" && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tudo pronto!</h3>
                <p className="text-muted-foreground">
                  Revise as informações e clique em "Salvar Carga" para finalizar.
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carga:</span>
                  <span className="font-medium">{formData.nome}</span>
                </div>
                {formData.data_carregamento && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {format(formData.data_carregamento, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {percurso && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Percurso:</span>
                    <span className="font-medium text-white">{percurso}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faturamento:</span>
                  <span className="font-medium">
                    R$ {faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lucro Estimado:</span>
                  <span
                    className={cn("font-medium", lucro >= 0 ? "text-green-500" : "text-destructive")}
                  >
                    R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={prevEtapa} disabled={etapaIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {etapaAtual !== "docs" ? (
            <Button onClick={nextEtapa} disabled={!canAdvance()} className="gradient-primary">
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="gradient-primary">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Carga"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
