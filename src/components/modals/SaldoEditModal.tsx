import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PagamentoComDetalhes, useUpdatePagamento, useConfirmarCanhoto, useQuitarSaldo } from "@/hooks/usePagamentos";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DollarSign, Loader2, Save, User, Truck, FileText, Check } from "lucide-react";

interface SaldoEditModalProps {
  pagamento: PagamentoComDetalhes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaldoEditModal({ pagamento, open, onOpenChange }: SaldoEditModalProps) {
  const [valorPago, setValorPago] = useState("");
  const [diarias, setDiarias] = useState("");
  const [chapas, setChapas] = useState("");
  const [adicionais, setAdicionais] = useState("");

  const updatePagamento = useUpdatePagamento();
  const confirmarCanhoto = useConfirmarCanhoto();
  const quitarSaldo = useQuitarSaldo();
  const { toast } = useToast();

  useEffect(() => {
    if (pagamento && open) {
      setValorPago(pagamento.valor_pago?.toString() || "");
      // Reset adicionais
      setDiarias("");
      setChapas("");
      setAdicionais("");
    }
  }, [pagamento, open]);

  const calculos = useMemo(() => {
    if (!pagamento) return { novoTotal: 0, saldoRestante: 0, percentualPago: 0 };
    
    const valorPagoNum = parseFloat(valorPago) || 0;
    const diariasNum = parseFloat(diarias) || 0;
    const chapasNum = parseFloat(chapas) || 0;
    const adicionaisNum = parseFloat(adicionais) || 0;
    
    const totalAdicionais = diariasNum + chapasNum + adicionaisNum;
    const novoTotal = pagamento.valor_total + totalAdicionais;
    const saldoRestante = novoTotal - valorPagoNum;
    const percentualPago = novoTotal > 0 ? (valorPagoNum / novoTotal) * 100 : 0;
    
    return { novoTotal, saldoRestante, percentualPago, totalAdicionais };
  }, [pagamento, valorPago, diarias, chapas, adicionais]);

  const handleSave = async () => {
    if (!pagamento) return;

    try {
      const valorPagoNum = parseFloat(valorPago) || 0;
      
      await updatePagamento.mutateAsync({
        id: pagamento.id,
        pagamento: {
          valor_pago: valorPagoNum,
          valor_total: calculos.novoTotal,
          saldo_restante: calculos.saldoRestante,
          percentual_pago: Math.round(calculos.percentualPago),
          status: calculos.saldoRestante <= 0 ? "pago" : "pago_parcial",
        },
      });
      
      toast({
        title: "Pagamento atualizado!",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmarCanhoto = async () => {
    if (!pagamento) return;

    try {
      await confirmarCanhoto.mutateAsync(pagamento.id);
      toast({
        title: "Canhoto confirmado!",
        description: "O recebimento do canhoto foi registrado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o canhoto.",
        variant: "destructive",
      });
    }
  };

  const handleQuitarSaldo = async () => {
    if (!pagamento) return;

    try {
      await quitarSaldo.mutateAsync(pagamento.id);
      toast({
        title: "Saldo quitado!",
        description: "O pagamento foi finalizado.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível quitar o saldo.",
        variant: "destructive",
      });
    }
  };

  const isLoading = updatePagamento.isPending || confirmarCanhoto.isPending || quitarSaldo.isPending;

  if (!pagamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            Editar Pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Info do motorista e carga */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Motorista</p>
              <p className="font-medium">{pagamento.motorista?.nome || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Carga</p>
              <p className="font-medium">{pagamento.carga?.nome || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Status do canhoto */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Canhoto</span>
          </div>
          {pagamento.canhoto_recebido ? (
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">Recebido</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConfirmarCanhoto}
              disabled={isLoading}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Confirmar Recebimento
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Valores principais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Original (R$)</Label>
              <Input
                value={pagamento.valor_total?.toFixed(2) || "0.00"}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Pago (R$)</Label>
              <Input
                type="number"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Adicionais */}
          <div className="p-4 rounded-lg bg-muted/50 border space-y-4">
            <h4 className="font-semibold text-sm">Acréscimos ao Pagamento</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Diárias (R$)</Label>
                <Input
                  type="number"
                  value={diarias}
                  onChange={(e) => setDiarias(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Chapas (R$)</Label>
                <Input
                  type="number"
                  value={chapas}
                  onChange={(e) => setChapas(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Adicionais (R$)</Label>
                <Input
                  type="number"
                  value={adicionais}
                  onChange={(e) => setAdicionais(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50 border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Novo Total</p>
              <p className="text-lg font-bold">
                R$ {calculos.novoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Saldo Restante</p>
              <p className={cn(
                "text-lg font-bold",
                calculos.saldoRestante > 0 ? "text-orange-400" : "text-green-400"
              )}>
                R$ {calculos.saldoRestante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">% Pago</p>
              <p className="text-lg font-bold text-primary">
                {Math.round(calculos.percentualPago)}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          {pagamento.canhoto_recebido && calculos.saldoRestante > 0 && (
            <Button
              onClick={handleQuitarSaldo}
              disabled={isLoading}
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Quitar Saldo
            </Button>
          )}
          {(!pagamento.canhoto_recebido || calculos.saldoRestante <= 0) && <div />}
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
