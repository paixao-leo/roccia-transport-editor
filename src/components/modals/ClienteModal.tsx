import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCliente } from "@/hooks/useClientes";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2 } from "lucide-react";
import { z } from "zod";

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const clienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  cnpj_cpf: z.string().trim().max(20, "CNPJ/CPF muito longo").optional().or(z.literal("")),
  telefone: z.string().trim().max(20, "Telefone muito longo").optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").max(100, "Email muito longo").optional().or(z.literal("")),
});

export function ClienteModal({ open, onOpenChange }: ClienteModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj_cpf: "",
    telefone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCliente = useCreateCliente();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    // Validate
    const result = clienteSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createCliente.mutateAsync({
        nome: formData.nome.trim(),
        cnpj_cpf: formData.cnpj_cpf.trim() || null,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null,
      });

      toast({
        title: "Cliente cadastrado!",
        description: `${formData.nome} foi adicionado com sucesso.`,
      });

      // Reset form and close
      setFormData({ nome: "", cnpj_cpf: "", telefone: "", email: "" });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({ nome: "", cnpj_cpf: "", telefone: "", email: "" });
      setErrors({});
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Building2 className="w-5 h-5" />
            Novo Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Nome do cliente"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className={errors.nome ? "border-destructive" : ""}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>

          {/* CNPJ/CPF */}
          <div className="space-y-2">
            <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
            <Input
              id="cnpj_cpf"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj_cpf}
              onChange={(e) => handleChange("cnpj_cpf", e.target.value)}
              className={errors.cnpj_cpf ? "border-destructive" : ""}
            />
            {errors.cnpj_cpf && <p className="text-sm text-destructive">{errors.cnpj_cpf}</p>}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              className={errors.telefone ? "border-destructive" : ""}
            />
            {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.nome.trim() || createCliente.isPending}
            className="gradient-primary"
          >
            {createCliente.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Cliente"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
