import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CargaCompleta, useUpdateCarga, useDeleteCarga, useMarkAsDelivered } from "@/hooks/useCargas";
import { useClientes } from "@/hooks/useClientes";
import { useMotoristas } from "@/hooks/useMotoristas";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
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
  const [activeTab, setActiveTab] = useState("info");
  
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

  if (!carga) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Package className="w-5 h-5" />
              Editar Carga - {carga.nome}
            </DialogTitle>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              status === "entregue" ? "bg-green-500/20 text-green-400" :
              status === "em_transito" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-blue-500/20 text-blue-400"
            )}>
              {status === "entregue" ? "Entregue" : status === "em_transito" ? "Em Trânsito" : "Planejada"}
            </span>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Info</span>
            </TabsTrigger>
            <TabsTrigger value="motorista" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Motorista</span>
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="impostos" className="flex items-center gap-1">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Impostos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Carga</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da carga"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Percurso</Label>
              <Input
                value={percurso}
                onChange={(e) => setPercurso(e.target.value)}
                placeholder="Origem → Destino"
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
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
          </TabsContent>

          <TabsContent value="motorista" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Motorista</Label>
                <Select value={motoristaId} onValueChange={setMotoristaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {motoristas?.map((motorista) => (
                      <SelectItem key={motorista.id} value={motorista.id}>
                        {motorista.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select value={veiculoId} onValueChange={setVeiculoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
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
            </div>

            {/* Adicionais do motorista */}
            <div className="p-4 rounded-lg bg-muted/50 border space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Adicionais do Motorista
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Diárias (R$)</Label>
                  <Input
                    type="number"
                    value={diarias}
                    onChange={(e) => setDiarias(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chapas (R$)</Label>
                  <Input
                    type="number"
                    value={chapas}
                    onChange={(e) => setChapas(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adicionais Diversos (R$)</Label>
                  <Input
                    type="number"
                    value={adicionaisDiversos}
                    onChange={(e) => setAdicionaisDiversos(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Total Adicionais: </span>
                <span className="font-bold text-primary">
                  R$ {calculos.totalAdicionaisMotorista.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Faturamento (R$)</Label>
                <Input
                  type="number"
                  value={faturamento}
                  onChange={(e) => setFaturamento(e.target.value)}
                  placeholder="Valor cobrado do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor da Mercadoria (R$)</Label>
                <Input
                  type="number"
                  value={valorMercadoria}
                  onChange={(e) => setValorMercadoria(e.target.value)}
                  placeholder="Base para cálculo do seguro"
                />
              </div>
              <div className="space-y-2">
                <Label>Frete Terceiro (R$)</Label>
                <Input
                  type="number"
                  value={freteTerceiro}
                  onChange={(e) => setFreteTerceiro(e.target.value)}
                  placeholder="Valor pago ao motorista"
                />
              </div>
              <div className="space-y-2">
                <Label>Custos Extras (R$)</Label>
                <Input
                  type="number"
                  value={custosExtras}
                  onChange={(e) => setCustosExtras(e.target.value)}
                  placeholder="RCV, GR, etc"
                />
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50 border">
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-xs text-muted-foreground">Total Despesas</p>
                <p className="text-lg font-semibold text-destructive">
                  R$ {calculos.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-xs text-muted-foreground">Impostos</p>
                <p className="text-lg font-semibold text-orange-400">
                  R$ {calculos.totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground">Lucro</p>
                <p className={cn(
                  "text-xl font-bold",
                  calculos.lucro >= 0 ? "text-green-500" : "text-destructive"
                )}>
                  R$ {calculos.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="impostos" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50 border space-y-6">
              {/* Seguro */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Seguro</h4>
                    <p className="text-xs text-muted-foreground">
                      Percentual fixo de {PERCENTUAL_SEGURO}% sobre valor da mercadoria
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      R$ {calculos.valorSeguro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Imposto Federal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Imposto Federal</h4>
                    <p className="text-xs text-muted-foreground">
                      Fixo em {IMPOSTO_FEDERAL}% sobre faturamento
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">
                      R$ {calculos.impostoFederal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* ICMS */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">ICMS</h4>
                    <p className="text-xs text-muted-foreground">
                      Selecione a alíquota aplicável
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">
                      R$ {calculos.impostoIcms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
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

              <hr className="border-border" />

              {/* Total Impostos */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                <h4 className="font-semibold">Total de Impostos</h4>
                <p className="text-xl font-bold text-orange-400">
                  R$ {calculos.totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
