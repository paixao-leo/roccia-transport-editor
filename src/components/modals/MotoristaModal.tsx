import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Motorista, useCreateMotorista, useUpdateMotorista, useDeleteMotorista } from "@/hooks/useMotoristas";
import { useToast } from "@/hooks/use-toast";
import { User, Loader2, Trash2, Save, Plus } from "lucide-react";

interface MotoristaModalProps {
  motorista?: Motorista | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
}

export function MotoristaModal({ motorista, open, onOpenChange, mode = "create" }: MotoristaModalProps) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [donoAntt, setDonoAntt] = useState("");

  const createMotorista = useCreateMotorista();
  const updateMotorista = useUpdateMotorista();
  const deleteMotorista = useDeleteMotorista();
  const { toast } = useToast();

  const isEditMode = mode === "edit" && motorista;

  useEffect(() => {
    if (isEditMode && open) {
      setNome(motorista.nome || "");
      setCpf(motorista.cpf || "");
      setTelefone(motorista.telefone || "");
      setDonoAntt(motorista.dono_antt || "");
    } else if (!open) {
      setNome("");
      setCpf("");
      setTelefone("");
      setDonoAntt("");
    }
  }, [motorista, open, isEditMode]);

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do motorista.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode) {
        await updateMotorista.mutateAsync({
          id: motorista.id,
          motorista: {
            nome,
            cpf: cpf || null,
            telefone: telefone || null,
            dono_antt: donoAntt || null,
          },
        });
        toast({
          title: "Motorista atualizado!",
          description: "As alterações foram salvas.",
        });
      } else {
        await createMotorista.mutateAsync({
          nome,
          cpf: cpf || null,
          telefone: telefone || null,
          dono_antt: donoAntt || null,
        });
        toast({
          title: "Motorista cadastrado!",
          description: `${nome} foi adicionado ao sistema.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o motorista.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    try {
      await deleteMotorista.mutateAsync(motorista.id);
      toast({
        title: "Motorista excluído!",
        description: "O motorista foi removido do sistema.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o motorista.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMotorista.isPending || updateMotorista.isPending || deleteMotorista.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            {isEditMode ? `Editar Motorista` : "Novo Motorista"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do motorista"
            />
          </div>

          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label>Dono ANTT</Label>
            <Input
              value={donoAntt}
              onChange={(e) => setDonoAntt(e.target.value)}
              placeholder="Nome do proprietário"
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
