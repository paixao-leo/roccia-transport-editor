import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CargaCompleta, useUpdateCarga, useDeleteCarga, useMarkAsDelivered } from "@/hooks/useCargas";
import { useClientes } from "@/hooks/useClientes";
import { useMotoristas } from "@/hooks/useMotoristas";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Package,
  Loader2,
  MapPin,
  DollarSign,
  User,
  Truck,
  Trash2,
  CheckCircle,
  Save,
  Calculator,
  Calendar,
  Building2,
  Shield,
  TrendingUp,
  TrendingDown,
  Receipt,
} from "lucide-react";

interface CargaEditModalProps {
  carga: CargaCompleta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Alíquotas ICMS disponíveis
const ALIQUOTAS_ICMS = [7, 12, 17, 18, 19, 20, 22] as const;
const PERCENTUAL_SEGURO = 0.065; // 0.065%
const IMPOSTO_FEDERAL = 7; // 7%

export function CargaEditModal({ carga, open, onOpenChange }: CargaEditModalProps) {
  // Form state
  const [nome, setNome] = useState("");
  const [percurso, setPercurso] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [motoristaId, setMotoristaId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [status, setStatus] = useState("planejada");
  
  // Financeiro state
  const [faturamento, setFaturamento] = useState("");
  const [valorMercadoria, setValorMercadoria] = useState("");
  const [freteTerceiro, setFreteTerceiro] = useState("");
  const [custosExtras, setCustosExtras] = useState("");
  const [aliquotaIcms, setAliquotaIcms] = useState(7);
  
  // Adicionais motorista
  const [diarias, setDiarias] = useState("");
  const [chapas, setChapas] = useState("");
  const [adicionaisDiversos, setAdicionaisDiversos] = useState("");

  const updateCarga = useUpdateCarga();
  const deleteCarga = useDeleteCarga();
  const markAsDelivered = useMarkAsDelivered();
  
  const { data: clientes } = useClientes();
  const { data: motoristas } = useMotoristas();
  const { data: veiculos } = useVeiculos();
  
  const { toast } = useToast();

  // Load carga data when modal opens
  useEffect(() => {
    if (carga && open) {
      setNome(carga.nome || "");
      setPercurso(carga.percurso || "");
      setClienteId(carga.cliente_id || "");
      setStatus(carga.status || "planejada");
      setMotoristaId(carga.motorista_veiculo?.motorista_id || "");
      setVeiculoId(carga.motorista_veiculo?.veiculo_id || "");
      
      if (carga.financeiro) {
        setFaturamento(carga.financeiro.faturamento?.toString() || "");
        setValorMercadoria(carga.financeiro.valor_mercadoria?.toString() || "");
        setFreteTerceiro(carga.financeiro.frete_terceiro?.toString() || "");
        setCustosExtras(carga.financeiro.custos_extras?.toString() || "");
      }
    }
  }, [carga, open]);

  // Cálculos automáticos
  const calculos = useMemo(() => {
    const fat = parseFloat(faturamento) || 0;
    const valMerc = parseFloat(valorMercadoria) || 0;
    const freteTer = parseFloat(freteTerceiro) || 0;
    const custExt = parseFloat(custosExtras) || 0;
    const diar = parseFloat(diarias) || 0;
    const chap = parseFloat(chapas) || 0;
    const adicDiv = parseFloat(adicionaisDiversos) || 0;
    
    // Seguro: 0.065% do valor da mercadoria
    const valorSeguro = valMerc * (PERCENTUAL_SEGURO / 100);
    
    // Impostos baseados no faturamento
    const impostoFederal = fat * (IMPOSTO_FEDERAL / 100);
    const impostoIcms = fat * (aliquotaIcms / 100);
    const totalImpostos = impostoFederal + impostoIcms;
    
    // Total adicionais motorista
    const totalAdicionaisMotorista = diar + chap + adicDiv;
    
    // Total despesas
    const totalDespesas = freteTer + totalImpostos + valorSeguro + custExt + totalAdicionaisMotorista;
    
    // Lucro
    const lucro = fat - totalDespesas;
    
    return {
      valorSeguro,
      impostoFederal,
      impostoIcms,
      totalImpostos,
      totalAdicionaisMotorista,
      totalDespesas,
      lucro,
    };
  }, [faturamento, valorMercadoria, freteTerceiro, custosExtras, aliquotaIcms, diarias, chapas, adicionaisDiversos]);

  const handleSave = async () => {
    if (!carga) return;

    try {
      // Update carga
      await updateCarga.mutateAsync({
        id: carga.id,
        carga: {
          nome,
          percurso,
          cliente_id: clienteId || null,
          status,
        },
        financeiro: {
          faturamento: parseFloat(faturamento) || 0,
          valor_mercadoria: parseFloat(valorMercadoria) || 0,
          frete_terceiro: parseFloat(freteTerceiro) || 0,
          custos_extras: parseFloat(custosExtras) || 0,
          impostos: calculos.totalImpostos,
        },
      });

      // Update motorista/veiculo if changed
      if (motoristaId && carga.motorista_veiculo?.id) {
        await supabase
          .from("carga_motorista_veiculo")
          .update({
            motorista_id: motoristaId,
            veiculo_id: veiculoId || null,
          })
          .eq("id", carga.motorista_veiculo.id);
      } else if (motoristaId && !carga.motorista_veiculo) {
        await supabase
          .from("carga_motorista_veiculo")
          .insert({
            carga_id: carga.id,
            motorista_id: motoristaId,
            veiculo_id: veiculoId || null,
          });
      }

      toast({
        title: "Carga atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!carga) return;

    try {
      await deleteCarga.mutateAsync(carga.id);
      toast({
        title: "Carga excluída!",
        description: "A carga foi removida do sistema.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a carga.",
        variant: "destructive",
      });
    }
  };

  const handleMarkDelivered = async () => {
    if (!carga) return;

    try {
      await markAsDelivered.mutateAsync(carga.id);
      toast({
        title: "Carga entregue!",
        description: "A carga foi marcada como entregue.",
      });
      setStatus("entregue");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como entregue.",
        variant: "destructive",
      });
    }
  };

  const isLoading = updateCarga.isPending || deleteCarga.isPending || markAsDelivered.isPending;

  const cliente = clientes?.find(c => c.id === clienteId);
  const motorista = motoristas?.find(m => m.id === motoristaId);
  const veiculo = veiculos?.find(v => v.id === veiculoId);

  if (!carga) return null;

  const statusConfig: Record<string, { label: string; className: string }> = {
    planejada: { label: "Planejada", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
    em_transito: { label: "Em Trânsito", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    entregue: { label: "Entregue", className: "bg-green-500/20 text-green-400 border-green-500/50" },
  };

  const statusInfo = statusConfig[status] || statusConfig.planejada;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl text-primary">
              <Package className="w-6 h-6" />
              {carga.nome}
            </DialogTitle>
            <span className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border",
              statusInfo.className
            )}>
              {statusInfo.label}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              Informações Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30 border">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Nome da Carga</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Data de Carregamento
                </Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-background flex items-center text-sm">
                  {carga.data_carregamento 
                    ? format(parseISO(carga.data_carregamento), "dd/MM/yyyy", { locale: ptBR })
                    : "—"
                  }
                </div>
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label className="text-muted-foreground text-xs">Percurso</Label>
                <Input
                  value={percurso}
                  onChange={(e) => setPercurso(e.target.value)}
                  placeholder="Origem → Destino"
                  className="bg-background"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: CLIENTE */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Building2 className="w-5 h-5 text-primary" />
              Cliente
            </h3>
            <div className="p-4 rounded-xl bg-secondary/30 border">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Selecione o Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {cliente && (
                <div className="mt-4 p-3 rounded-lg bg-background grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium">{cliente.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CNPJ/CPF</p>
                    <p className="font-medium">{cliente.cnpj_cpf || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{cliente.telefone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{cliente.email || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 3: MOTORISTA E VEÍCULO */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="w-5 h-5 text-primary" />
              Motorista & Veículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Motorista */}
              <div className="p-4 rounded-xl bg-secondary/30 border space-y-3">
                <Label className="text-muted-foreground text-xs">Motorista</Label>
                <Select value={motoristaId} onValueChange={setMotoristaId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {motoristas?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {motorista && (
                  <div className="p-3 rounded-lg bg-background space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPF:</span>
                      <span className="font-medium">{motorista.cpf || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{motorista.telefone || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dono ANTT:</span>
                      <span className="font-medium">{motorista.dono_antt || "—"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Veículo */}
              <div className="p-4 rounded-xl bg-secondary/30 border space-y-3">
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Veículo
                </Label>
                <Select value={veiculoId} onValueChange={setVeiculoId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.placa_veiculo} - {v.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {veiculo && (
                  <div className="p-3 rounded-lg bg-background space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">{veiculo.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placa Veículo:</span>
                      <span className="font-medium">{veiculo.placa_veiculo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carreta 1:</span>
                      <span className="font-medium">{veiculo.placa_carreta_1 || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carreta 2:</span>
                      <span className="font-medium">{veiculo.placa_carreta_2 || "—"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Adicionais do motorista */}
            <div className="p-4 rounded-xl bg-secondary/30 border space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Adicionais do Motorista
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Diárias (R$)</Label>
                  <Input
                    type="number"
                    value={diarias}
                    onChange={(e) => setDiarias(e.target.value)}
                    placeholder="0,00"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Chapas (R$)</Label>
                  <Input
                    type="number"
                    value={chapas}
                    onChange={(e) => setChapas(e.target.value)}
                    placeholder="0,00"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Adicionais Diversos (R$)</Label>
                  <Input
                    type="number"
                    value={adicionaisDiversos}
                    onChange={(e) => setAdicionaisDiversos(e.target.value)}
                    placeholder="0,00"
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="text-right pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Total Adicionais: </span>
                <span className="text-lg font-bold text-primary">
                  R$ {calculos.totalAdicionaisMotorista.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: FINANCEIRO */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <DollarSign className="w-5 h-5 text-primary" />
              Financeiro
            </h3>
            <div className="p-4 rounded-xl bg-secondary/30 border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Faturamento (R$)</Label>
                  <Input
                    type="number"
                    value={faturamento}
                    onChange={(e) => setFaturamento(e.target.value)}
                    placeholder="Valor cobrado do cliente"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Valor da Mercadoria (R$)</Label>
                  <Input
                    type="number"
                    value={valorMercadoria}
                    onChange={(e) => setValorMercadoria(e.target.value)}
                    placeholder="Base para cálculo do seguro"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Frete Terceiro (R$)</Label>
                  <Input
                    type="number"
                    value={freteTerceiro}
                    onChange={(e) => setFreteTerceiro(e.target.value)}
                    placeholder="Valor pago ao motorista"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Custos Extras (R$)</Label>
                  <Input
                    type="number"
                    value={custosExtras}
                    onChange={(e) => setCustosExtras(e.target.value)}
                    placeholder="RCV, GR, etc"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 5: IMPOSTOS (Cálculo Automático) */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Calculator className="w-5 h-5 text-primary" />
              Impostos (Calculados Automaticamente)
            </h3>
            <div className="p-4 rounded-xl bg-secondary/30 border space-y-4">
              {/* Seguro */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium">Seguro</p>
                    <p className="text-xs text-muted-foreground">{PERCENTUAL_SEGURO}% do valor da mercadoria</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-400">
                  R$ {calculos.valorSeguro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Imposto Federal */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="font-medium">Imposto Federal</p>
                    <p className="text-xs text-muted-foreground">{IMPOSTO_FEDERAL}% fixo do faturamento</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-orange-400">
                  R$ {calculos.impostoFederal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* ICMS */}
              <div className="p-3 rounded-lg bg-background space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-medium">ICMS</p>
                      <p className="text-xs text-muted-foreground">Selecione a alíquota</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-orange-400">
                    R$ {calculos.impostoIcms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALIQUOTAS_ICMS.map((aliquota) => (
                    <button
                      key={aliquota}
                      onClick={() => setAliquotaIcms(aliquota)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        aliquotaIcms === aliquota
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {aliquota}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Impostos */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="font-semibold text-lg">Total de Impostos</p>
                <p className="text-2xl font-bold text-orange-400">
                  R$ {calculos.totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 6: RESUMO FINANCEIRO */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Resumo Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border text-center">
                <p className="text-sm text-muted-foreground mb-1">Faturamento</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {(parseFloat(faturamento) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="w-4 h-4" />
                  Total Despesas
                </div>
                <p className="text-2xl font-bold text-destructive">
                  R$ {calculos.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={cn(
                "p-4 rounded-xl border text-center",
                calculos.lucro >= 0 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-destructive/10 border-destructive/30"
              )}>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                  {calculos.lucro >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  Lucro
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  calculos.lucro >= 0 ? "text-green-500" : "text-destructive"
                )}>
                  R$ {calculos.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
            {status !== "entregue" && (
              <Button
                variant="outline"
                onClick={handleMarkDelivered}
                disabled={isLoading}
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar Entregue
              </Button>
            )}
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="gradient-primary">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
