import { Button } from "@/components/ui/button";
import { DollarSign, Check, FileText, Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePagamentosPendentes, useConfirmarCanhoto, useQuitarSaldo, PagamentoComDetalhes } from "@/hooks/usePagamentos";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Saldos() {
  const { data: pagamentos, isLoading } = usePagamentosPendentes();
  const confirmarCanhoto = useConfirmarCanhoto();
  const quitarSaldo = useQuitarSaldo();
  const { toast } = useToast();

  const handleConfirmarCanhoto = async (id: string) => {
    try {
      await confirmarCanhoto.mutateAsync(id);
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

  const handleQuitarSaldo = async (id: string) => {
    try {
      await quitarSaldo.mutateAsync(id);
      toast({
        title: "Saldo quitado!",
        description: "O pagamento foi finalizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível quitar o saldo.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">Gestão de Saldos</h2>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Pagamentos Pendentes</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (pagamentos?.length || 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum pagamento pendente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pagamentos?.map((pagamento) => (
            <div
              key={pagamento.id}
              className="cargo-card border-l-yellow-500"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">
                      {pagamento.motorista?.nome || "Motorista"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span>{pagamento.carga?.nome || "Carga"}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                  {pagamento.percentual_pago}% Pago
                </span>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-center">
                  <span className="text-xs text-muted-foreground">Valor Pago</span>
                  <p className="text-sm font-bold text-green-400">
                    R$ {pagamento.valor_pago?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg text-center">
                  <span className="text-xs text-muted-foreground">Saldo Restante</span>
                  <p className="text-sm font-bold text-orange-400">
                    R$ {pagamento.saldo_restante?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="p-2 bg-muted/50 rounded-lg text-center mb-4">
                <span className="text-xs text-muted-foreground">Valor Total</span>
                <p className="text-lg font-bold text-foreground">
                  R$ {pagamento.valor_total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Ações */}
              <div className="space-y-2">
                {!pagamento.canhoto_recebido ? (
                  <Button
                    onClick={() => handleConfirmarCanhoto(pagamento.id)}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    disabled={confirmarCanhoto.isPending}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Confirmar Canhoto
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-2 bg-green-500/20 rounded-lg text-green-400 text-sm">
                    <Check className="w-4 h-4" />
                    Canhoto Recebido
                  </div>
                )}

                {pagamento.canhoto_recebido && (
                  <Button
                    onClick={() => handleQuitarSaldo(pagamento.id)}
                    className="w-full gradient-primary"
                    disabled={quitarSaldo.isPending}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Quitar Saldo
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
