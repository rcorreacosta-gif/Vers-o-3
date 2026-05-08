export type Inputs = {
  valorVenda: number;
  totalParcelas: number;
  parcelasAntecipadas: number;
  primeiroVencimento: Date;
  percentualRepasse: number; // 0..1
};

export type BoletoResult = {
  valorParcelaBoleto: number;
  valorTotalBoleto: number;
  valorAntecipado: number;
  custoLojista: number;
  acrescimoNecessarioAntecipado: number;
  acrescimoTotalNaVenda: number;
  recebimentoImediato: number;
  totalPagoCliente: number;
  totalRecebidoLojista: number;
};

export type CartaoResult = {
  valorAntecipado: number;
  mdr: number;
  antecipacao: number;
  custoTotalCartao: number;
  recebimentoImediato: number;
  totalPagoCliente: number;
  totalRecebidoLojista: number;
  valorParcelaCartao: number;
};

const TAXA_BOLETO_MES = 0.05;
const MDR_CARTAO = 0.03;
const ANTEC_CARTAO_MES = 0.03;

function prazoMedioMeses(qtdParcelas: number) {
  // média simples 30,60,...
  let s = 0;
  for (let i = 1; i <= qtdParcelas; i++) s += i * 30;
  return s / qtdParcelas / 30;
}

export function calcularBoleto(i: Inputs): BoletoResult {
  const valorParcelaOriginal = i.valorVenda / i.totalParcelas;
  const valorOriginalAntecipado = valorParcelaOriginal * i.parcelasAntecipadas;
  const prazoMeses = prazoMedioMeses(i.parcelasAntecipadas);
  const taxaMensalBoleto = TAXA_BOLETO_MES / (1 - TAXA_BOLETO_MES);
  const taxaTotalBoleto = taxaMensalBoleto * prazoMeses;
  const valorBrutoNecessarioAntecipado =
    valorOriginalAntecipado / (1 - taxaTotalBoleto);
  const acrescimoNecessarioAntecipado =
    valorBrutoNecessarioAntecipado - valorOriginalAntecipado;
  const acrescimoTotalNaVenda =
    acrescimoNecessarioAntecipado * (i.totalParcelas / i.parcelasAntecipadas);
  const acrescimoAplicado = acrescimoTotalNaVenda * i.percentualRepasse;
  const valorTotalBoleto = i.valorVenda + acrescimoAplicado;
  const valorParcelaBoleto = valorTotalBoleto / i.totalParcelas;
  const valorAntecipado = valorParcelaBoleto * i.parcelasAntecipadas;
  const custoLojista =
    acrescimoNecessarioAntecipado -
    acrescimoNecessarioAntecipado * i.percentualRepasse;
  const recebimentoImediato = valorAntecipado - custoLojista;
  const totalPagoCliente = valorTotalBoleto;
  const totalRecebidoLojista = i.valorVenda - custoLojista;

  return {
    valorParcelaBoleto,
    valorTotalBoleto,
    valorAntecipado,
    custoLojista,
    acrescimoNecessarioAntecipado,
    acrescimoTotalNaVenda,
    recebimentoImediato,
    totalPagoCliente,
    totalRecebidoLojista,
  };
}

export function calcularCartao(i: Inputs): CartaoResult {
  const valorAntecipado = i.valorVenda;
  const prazoMeses = prazoMedioMeses(i.totalParcelas);
  const mdr = i.valorVenda * MDR_CARTAO;
  const antecipacao = i.valorVenda * ANTEC_CARTAO_MES * prazoMeses;
  const custoTotalCartao = mdr + antecipacao;
  const recebimentoImediato = i.valorVenda - custoTotalCartao;
  return {
    valorAntecipado,
    mdr,
    antecipacao,
    custoTotalCartao,
    recebimentoImediato,
    totalPagoCliente: i.valorVenda,
    totalRecebidoLojista: i.valorVenda - custoTotalCartao,
    valorParcelaCartao: i.valorVenda / i.totalParcelas,
  };
}

export function brl(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString("pt-BR");
}
