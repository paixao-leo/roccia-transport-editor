import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cliente, useUpdateCliente, useDeleteCliente } from "@/hooks/useClientes";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, Trash2, Save, Phone, Mail, CreditCard } from "lucide-react";

interface ClienteEditModalProps {
  cliente: Cliente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClienteEditModal({ cliente, open, onOpenChange }: ClienteEditModalProps) {
  const [nome, setNome] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();
  const { toast } = useToast();

  useEffect(() => {
    if (cliente && open) {
      setNome(cliente.nome || "");
      setCnpjCpf(cliente.cnpj_cpf || "");
      setTelefone(cliente.telefone || "");
      setEmail(cliente.email || "");
    }
  }, [cliente, open]);

  const handleSave = async () => {
    if (!cliente) return;

    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCliente.mutateAsync({
        id: cliente.id,
        cliente: {
          nome,
          cnpj_cpf: cnpjCpf || null,
          telefone: telefone || null,
          email: email || null,
        },
      });
      toast({
        title: "Cliente atualizado!",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!cliente) return;

    try {
      await deleteCliente.mutateAsync(cliente.id);
      toast({
        title: "Cliente excluído!",
        description: "O cliente foi removido do sistema.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cliente. Verifique se não há cargas vinculadas.",
        variant: "destructive",
      });
    }
  };

  const isLoading = updateCliente.isPending || deleteCliente.isPending;

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Building2 className="w-5 h-5" />
            Editar Cliente
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
              placeholder="Nome do cliente"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              CNPJ/CPF
            </Label>
            <Input
              value={cnpjCpf}
              onChange={(e) => setCnpjCpf(e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isLoading}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gradient-primary">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
