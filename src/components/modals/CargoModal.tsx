import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Cargo } from "@/components/cargo/CargoCard";
import { Cliente } from "@/components/sections/Clientes";

interface CargoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (cargo: Omit<Cargo, "id" | "numCarga">) => void;
  clientes: Cliente[];
}

export function CargoModal({ open, onClose, onSave, clientes }: CargoModalProps) {
  const [formData, setFormData] = useState({
    dataCarga: new Date().toISOString().split("T")[0],
    origem: "",
    destino: "",
    motorista: "",
    clienteNome: "",
    peso: "",
    valor: "",
    status: "" as Cargo["status"] | "",
    observacoes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status) return;
    
    onSave({
      dataCarga: new Date(formData.dataCarga).toLocaleDateString("pt-BR"),
      origem: formData.origem,
      destino: formData.destino,
      motorista: formData.motorista,
      clienteNome: formData.clienteNome,
      peso: formData.peso + " TON",
      valor: parseFloat(formData.valor),
      status: formData.status as Cargo["status"],
      observacoes: formData.observacoes,
    });

    // Reset form
    setFormData({
      dataCarga: new Date().toISOString().split("T")[0],
      origem: "",
      destino: "",
      motorista: "",
      clienteNome: "",
      peso: "",
      valor: "",
      status: "",
      observacoes: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">Nova Carga</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-carga">Data da Carga</Label>
              <Input
                id="data-carga"
                type="date"
                value={formData.dataCarga}
                onChange={(e) => setFormData({ ...formData, dataCarga: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                placeholder="Ex: JAGUARIÚNA SP"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                placeholder="Ex: BARCARENA PA"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motorista">Motorista</Label>
              <Input
                id="motorista"
                value={formData.motorista}
                onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
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
              <Label htmlFor="peso">Peso (TON)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Cargo["status"] })}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em-transito">Em Trânsito</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="em-aberto">Em Aberto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary shadow-glow shadow-glow-hover">
            Salvar Carga
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
