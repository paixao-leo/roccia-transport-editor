// Interface expandida com todos os campos da planilha

export interface DadosMotorista {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  donoAnti?: string;
  proprietarioCarreta?: string;
  placaCavalo: string;
  placaCarreta: string;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipoChave: "telefone" | "cpf" | "cnpj" | "email" | "aleatoria";
  chavePix: string;
  nomeFavorecido: string;
}

export interface DadosCarga {
  mercadoria: string;
  peso: number;
  totalKm?: number;
  tipoCargaFrete: "dedicado" | "fracionado" | "lotacao";
  tipoVeiculo: string;
  numEixos: number;
}

export interface DadosFinanceiros {
  valorFreteCobrado: number; // Valor cobrado ao cliente
  valorFreteMotorista: number; // Frete ML (Total) - valor acordado com motorista
  comValePedagio: boolean;
  valorPedagio: number;
  freteTerceiro: number; // Frete para 3º
  percentualAdiantamento: number;
  valorAdiantamento: number;
  saldo: number;
  acrescimoSaldo: number;
}

export interface Impostos {
  percentualFederal: number; // Fixo 7%
  percentualIcms: number; // Ajustável
  percentualSeguradora: number;
  valorImpostosFederais: number;
  valorIcms: number;
  valorSeguro: number;
}

export interface CustosExtras {
  custoFixoRcv: number;
  custosGr: number;
  custosChapa: number;
  custosDiversos: number;
  comissaoAgente: number;
  percentualComissaoAgente: number;
}

export interface StatusDocumentos {
  cadastro: "ok" | "pendente";
  faturamento: string;
  finalizado: boolean;
  cartaFreteCiot: "em-aberto" | "emitido" | "finalizado";
  manifesto: "em-aberto" | "emitido" | "finalizado";
  numeroManifesto?: string;
}

export interface CargoCompleta {
  id: number;
  numCarga: number;
  dataCarga: string;
  
  // Rota
  origem: string;
  estadoOrigem: string;
  destino: string;
  estadoDestino: string;
  percurso: string; // Ex: SP>MG
  
  // Cliente
  clienteNome: string;
  responsavelTomador: string;
  
  // Motorista
  motorista: DadosMotorista;
  dadosBancarios: DadosBancarios;
  
  // Carga
  dadosCarga: DadosCarga;
  
  // Financeiro
  financeiro: DadosFinanceiros;
  impostos: Impostos;
  custosExtras: CustosExtras;
  
  // Status
  status: "em-transito" | "entregue" | "em-aberto";
  documentos: StatusDocumentos;
  
  // Calculados
  totalDespesas: number;
  lucro: number;
  percentualLucro: number;
  
  observacoes?: string;
}

// Função para calcular valores
export function calcularFinanceiroCarga(cargo: Partial<CargoCompleta>): {
  totalImpostos: number;
  totalDespesas: number;
  lucro: number;
  percentualLucro: number;
} {
  const valorCobrado = cargo.financeiro?.valorFreteCobrado || 0;
  const valorMotorista = cargo.financeiro?.valorFreteMotorista || 0;
  const freteTerceiro = cargo.financeiro?.freteTerceiro || 0;
  
  // Impostos
  const impostosFederais = valorCobrado * ((cargo.impostos?.percentualFederal || 7) / 100);
  const icms = valorCobrado * ((cargo.impostos?.percentualIcms || 12) / 100);
  const seguro = valorCobrado * ((cargo.impostos?.percentualSeguradora || 0.065) / 100);
  const totalImpostos = impostosFederais + icms + seguro;
  
  // Custos extras
  const custosExtras = (cargo.custosExtras?.custoFixoRcv || 0) +
    (cargo.custosExtras?.custosGr || 0) +
    (cargo.custosExtras?.custosChapa || 0) +
    (cargo.custosExtras?.custosDiversos || 0) +
    (cargo.custosExtras?.comissaoAgente || 0);
  
  // Total despesas
  const totalDespesas = valorMotorista + freteTerceiro + totalImpostos + custosExtras;
  
  // Lucro
  const lucro = valorCobrado - totalDespesas;
  const percentualLucro = valorCobrado > 0 ? (lucro / valorCobrado) * 100 : 0;
  
  return {
    totalImpostos,
    totalDespesas,
    lucro,
    percentualLucro,
  };
}

// Tipo simplificado para cards (compatível com versão anterior)
export interface Cargo {
  id: number;
  numCarga: number;
  dataCarga: string;
  origem: string;
  destino: string;
  motorista: string;
  clienteNome: string;
  peso: string;
  valor: number;
  status: "em-transito" | "entregue" | "em-aberto";
  observacoes?: string;
  // Referência para dados completos
  dadosCompletos?: CargoCompleta;
}

// Converter CargoCompleta para Cargo simplificado
export function toCargoSimples(cargo: CargoCompleta): Cargo {
  return {
    id: cargo.id,
    numCarga: cargo.numCarga,
    dataCarga: cargo.dataCarga,
    origem: `${cargo.origem} ${cargo.estadoOrigem}`,
    destino: `${cargo.destino} ${cargo.estadoDestino}`,
    motorista: cargo.motorista.nome,
    clienteNome: cargo.clienteNome,
    peso: `${cargo.dadosCarga.peso} TON`,
    valor: cargo.financeiro.valorFreteCobrado,
    status: cargo.status,
    observacoes: cargo.observacoes,
    dadosCompletos: cargo,
  };
}
