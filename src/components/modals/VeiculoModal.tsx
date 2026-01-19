import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Veiculo, useCreateVeiculo, useUpdateVeiculo, useDeleteVeiculo, TIPOS_VEICULO } from "@/hooks/useVeiculos";
import { useToast } from "@/hooks/use-toast";
import { Truck, Loader2, Trash2, Save, Plus } from "lucide-react";

interface VeiculoModalProps {
  veiculo?: Veiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
}

export function VeiculoModal({ veiculo, open, onOpenChange, mode = "create" }: VeiculoModalProps) {
  const [tipo, setTipo] = useState("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [placaCarreta1, setPlacaCarreta1] = useState("");
  const [placaCarreta2, setPlacaCarreta2] = useState("");

  const createVeiculo = useCreateVeiculo();
  const updateVeiculo = useUpdateVeiculo();
  const deleteVeiculo = useDeleteVeiculo();
  const { toast } = useToast();

  const isEditMode = mode === "edit" && veiculo;

  useEffect(() => {
    if (isEditMode && open) {
      setTipo(veiculo.tipo || "");
      setPlacaVeiculo(veiculo.placa_veiculo || "");
      setPlacaCarreta1(veiculo.placa_carreta_1 || "");
      setPlacaCarreta2(veiculo.placa_carreta_2 || "");
    } else if (!open) {
      setTipo("");
      setPlacaVeiculo("");
      setPlacaCarreta1("");
      setPlacaCarreta2("");
    }
  }, [veiculo, open, isEditMode]);

  const handleSave = async () => {
    if (!tipo || !placaVeiculo.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe o tipo e a placa do veículo.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode) {
        await updateVeiculo.mutateAsync({
          id: veiculo.id,
          veiculo: {
            tipo,
            placa_veiculo: placaVeiculo.toUpperCase(),
            placa_carreta_1: placaCarreta1?.toUpperCase() || null,
            placa_carreta_2: placaCarreta2?.toUpperCase() || null,
          },
        });
        toast({
          title: "Veículo atualizado!",
          description: "As alterações foram salvas.",
        });
      } else {
        await createVeiculo.mutateAsync({
          tipo,
          placa_veiculo: placaVeiculo.toUpperCase(),
          placa_carreta_1: placaCarreta1?.toUpperCase() || null,
          placa_carreta_2: placaCarreta2?.toUpperCase() || null,
        });
        toast({
          title: "Veículo cadastrado!",
          description: `${placaVeiculo} foi adicionado ao sistema.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o veículo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    try {
      await deleteVeiculo.mutateAsync(veiculo.id);
      toast({
        title: "Veículo excluído!",
        description: "O veículo foi removido do sistema.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o veículo.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createVeiculo.isPending || updateVeiculo.isPending || deleteVeiculo.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Truck className="w-5 h-5" />
            {isEditMode ? `Editar Veículo` : "Novo Veículo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Tipo <span className="text-destructive">*</span>
            </Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_VEICULO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
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
              value={placaVeiculo}
              onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
              placeholder="ABC-1234"
            />
          </div>

          <div className="space-y-2">
            <Label>Placa Carreta 1</Label>
            <Input
              value={placaCarreta1}
              onChange={(e) => setPlacaCarreta1(e.target.value.toUpperCase())}
              placeholder="ABC-1234"
            />
          </div>

          <div className="space-y-2">
            <Label>Placa Carreta 2</Label>
            <Input
              value={placaCarreta2}
              onChange={(e) => setPlacaCarreta2(e.target.value.toUpperCase())}
              placeholder="ABC-1234"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          {isEditMode ? (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={handleSave} disabled={isLoading} className="gradient-primary">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : isEditMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
