import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Receipt, CreditCard, TrendingDown, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  brl,
  calcularBoleto,
  calcularCartao,
  addMonths,
  fmtDate,
  type Inputs,
} from "@/lib/simulador";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boleto vs Cartão — Quanto sobra da sua venda?" },
      {
        name: "description",
        content:
          "Simulador simples para pequenos empresários compararem boleto parcelado e cartão de crédito.",
      },
    ],
  }),
  component: Index,
});

const PARCELAS = [1, 2, 3, 4, 5, 6];
const ANTECIPAR = [1, 2, 3];
const REPASSES = [0, 0.2, 0.3, 0.5, 0.7, 1];

function Index() {
  const [valorVenda, setValorVenda] = React.useState<number>(1000);
  const [totalParcelas, setTotalParcelas] = React.useState(3);
  const [parcelasAntecipadas, setParcelasAntecipadas] = React.useState(1);
  const [primeiroVencimento, setPrimeiroVencimento] = React.useState<Date>(
    () => {
      const d = new Date(2026, 0, 1);
      return addMonths(d, 1);
    },
  );
  React.useEffect(() => {
    setPrimeiroVencimento(addMonths(new Date(), 1));
  }, []);
  const [percentualRepasse, setPercentualRepasse] = React.useState(1);

  React.useEffect(() => {
    if (parcelasAntecipadas > totalParcelas) setParcelasAntecipadas(totalParcelas);
  }, [totalParcelas, parcelasAntecipadas]);

  const inputs: Inputs = {
    valorVenda,
    totalParcelas,
    parcelasAntecipadas: Math.min(parcelasAntecipadas, totalParcelas),
    primeiroVencimento,
    percentualRepasse,
  };

  const boleto = calcularBoleto(inputs);
  const cartao = calcularCartao(inputs);

  const diff = boleto.totalRecebidoLojista - cartao.totalRecebidoLojista;
  const melhor: "boleto" | "cartao" | "empate" =
    diff > 0.5 ? "boleto" : diff < -0.5 ? "cartao" : "empate";

  return (
    <div className="min-h-screen bg-background">
      <header
        className="px-4 pt-10 pb-6 border-b border-border/50"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
            <Sparkles className="h-3 w-3" />
            Simulador
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Boleto <span className="text-muted-foreground/60 font-light">vs</span>{" "}
            Cartão
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Veja na hora quanto sobra da sua venda em cada forma de pagamento.
          </p>
        </div>
      </header>

      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <Tabs defaultValue="sim" className="w-full">
          <div className="sticky top-0 z-10 -mx-4 px-4 pt-4 pb-2 bg-background/85 backdrop-blur-md">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted rounded-xl">
              <TabsTrigger value="sim" className="text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:shadow-sm">
                Simulador
              </TabsTrigger>
              <TabsTrigger value="bol" className="text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:shadow-sm">
                Boleto
              </TabsTrigger>
              <TabsTrigger value="car" className="text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:shadow-sm">
                Cartão
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sim" className="mt-4 space-y-5">
            <Card className="p-5 space-y-6 border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="space-y-2">
                <Label htmlFor="valor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Valor da venda
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-medium">
                    R$
                  </span>
                  <Input
                    id="valor"
                    type="text"
                    inputMode="numeric"
                    value={
                      valorVenda
                        ? valorVenda.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0,00"
                    }
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setValorVenda(digits ? Number(digits) / 100 : 0);
                    }}
                    className="pl-12 text-2xl font-bold h-14 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parcelamento
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {PARCELAS.map((p) => (
                    <PillButton
                      key={p}
                      active={totalParcelas === p}
                      onClick={() => setTotalParcelas(p)}
                    >
                      {p}x
                    </PillButton>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Antecipar no boleto
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {ANTECIPAR.map((p) => {
                    const disabled = p > totalParcelas;
                    return (
                      <PillButton
                        key={p}
                        active={parcelasAntecipadas === p}
                        disabled={disabled}
                        onClick={() => setParcelasAntecipadas(p)}
                      >
                        {p} {p === 1 ? "parcela" : "parcelas"}
                      </PillButton>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Primeiro vencimento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-medium h-12 rounded-xl border-border/60"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(primeiroVencimento, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={primeiroVencimento}
                      onSelect={(d) => d && setPrimeiroVencimento(d)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Repassar das taxas para o cliente
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {REPASSES.map((r) => (
                    <PillButton
                      key={r}
                      active={percentualRepasse === r}
                      onClick={() => setPercentualRepasse(r)}
                    >
                      {Math.round(r * 100)}%
                    </PillButton>
                  ))}
                </div>
              </div>
            </Card>

            <div className="text-center pt-2">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Quanto sobra da sua venda?
              </h2>
            </div>

            <Card
              className="p-5 text-center border-2 border-dashed border-border/70 bg-muted/30"
            >
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Valor da venda
              </div>
              <div className="text-4xl font-bold tracking-tight mt-1.5 tabular-nums">
                {brl(valorVenda)}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                tone="boleto"
                icon={<Receipt className="h-5 w-5" />}
                label="Boleto"
                value={boleto.totalRecebidoLojista}
                hint="Você escolhe quantas parcelas antecipar."
                winner={melhor === "boleto"}
              />
              <ResultCard
                tone="cartao"
                icon={<CreditCard className="h-5 w-5" />}
                label="Cartão"
                value={cartao.totalRecebidoLojista}
                hint="A maquininha antecipa toda a venda."
                winner={melhor === "cartao"}
              />
            </div>

            {melhor !== "empate" && (
              <div
                className={cn(
                  "rounded-xl border p-3.5 flex items-center justify-center gap-2 text-sm font-semibold",
                  melhor === "boleto"
                    ? "bg-boleto-soft border-boleto/30 text-boleto-foreground"
                    : "bg-cartao-soft border-cartao/30 text-cartao-foreground",
                )}
              >
                <ArrowRight className="h-4 w-4" />
                <span>
                  Diferença de{" "}
                  <span className="tabular-nums font-bold">{brl(Math.abs(diff))}</span>{" "}
                  no {melhor}
                </span>
              </div>
            )}

            <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-boleto-soft flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-boleto-foreground" />
                </div>
                <p className="text-sm leading-relaxed pt-1.5">
                  No <span className="font-semibold text-boleto-foreground">boleto</span>, o cliente ajuda a pagar os custos financeiros.
                </p>
              </div>
              <div className="h-px bg-border/60" />
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-cartao-soft flex items-center justify-center shrink-0">
                  <TrendingDown className="h-4 w-4 text-cartao-foreground" />
                </div>
                <p className="text-sm leading-relaxed pt-1.5">
                  No <span className="font-semibold text-cartao-foreground">cartão</span>, as taxas saem do seu bolso.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bol" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Valor da venda" value={brl(valorVenda)} highlight="boleto" />
              <MiniCard label="Parcelas" value={`${totalParcelas}x`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Cliente paga" value={brl(boleto.totalPagoCliente)} />
              <MiniCard label="Você recebe no final" value={brl(boleto.totalRecebidoLojista)} highlight="boleto" />
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1 pt-1">
              <p>
                Você antecipou <span className="font-semibold text-foreground">{inputs.parcelasAntecipadas}</span> de <span className="font-semibold text-foreground">{totalParcelas}</span> parcelas.
              </p>
              <p>
                Você repassou <span className="font-semibold text-foreground">{Math.round(percentualRepasse * 100)}%</span> dos custos ao cliente.
              </p>
            </div>

            <div className="rounded-2xl bg-boleto-soft border border-boleto/20 p-4 text-sm text-boleto-foreground text-center font-medium flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 shrink-0" />
              No boleto, o cliente ajuda a pagar os custos financeiros.
            </div>

            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Repasse para o cliente
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {REPASSES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPercentualRepasse(r)}
                    className={cn(
                      "h-10 rounded-lg border text-xs font-semibold transition-all",
                      "bg-card border-border text-muted-foreground hover:border-boleto/40",
                      percentualRepasse === r &&
                        "bg-boleto-soft border-boleto/50 text-boleto-foreground shadow-sm",
                    )}
                  >
                    {Math.round(r * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <ParcelasTabela
              total={totalParcelas}
              valor={boleto.valorParcelaBoleto}
              primeiro={primeiroVencimento}
              antecipadas={inputs.parcelasAntecipadas}
              modo="boleto"
            />
          </TabsContent>

          <TabsContent value="car" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Valor da venda" value={brl(valorVenda)} highlight="cartao" />
              <MiniCard label="Parcelas" value={`${totalParcelas}x`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="Cliente paga" value={brl(cartao.totalPagoCliente)} />
              <MiniCard label="Você recebe no final" value={brl(cartao.totalRecebidoLojista)} highlight="cartao" />
            </div>

            <p className="text-xs text-center text-muted-foreground pt-1">
              A maquininha antecipou automaticamente todas as parcelas.
            </p>

            <div className="rounded-2xl bg-cartao-soft border border-cartao/30 p-4 text-sm text-cartao-foreground text-center font-medium flex items-center justify-center gap-2">
              <TrendingDown className="h-4 w-4 shrink-0" />
              No cartão, as taxas saem do seu bolso.
            </div>

            <ParcelasTabela
              total={totalParcelas}
              valor={cartao.valorParcelaCartao}
              primeiro={primeiroVencimento}
              antecipadas={totalParcelas}
              modo="cartao"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PillButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-11 rounded-xl border text-sm font-semibold transition-all",
        "bg-card border-border text-foreground hover:border-primary/40",
        active &&
          "bg-primary text-primary-foreground border-primary shadow-sm",
        disabled && "opacity-30 cursor-not-allowed hover:border-border",
      )}
    >
      {children}
    </button>
  );
}

function ResultCard({
  tone,
  icon,
  label,
  value,
  hint,
  winner,
}: {
  tone: "boleto" | "cartao";
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  winner?: boolean;
}) {
  const isBoleto = tone === "boleto";
  return (
    <Card
      className={cn(
        "p-5 border-2 relative transition-all",
        isBoleto
          ? "bg-boleto-soft border-boleto/30"
          : "bg-cartao-soft border-cartao/30",
        winner && "ring-2 ring-offset-2 ring-offset-background",
        winner && isBoleto && "ring-boleto/60",
        winner && !isBoleto && "ring-cartao/60",
      )}
      style={winner ? { boxShadow: "var(--shadow-card)" } : undefined}
    >
      {winner && (
        <div
          className={cn(
            "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white",
            isBoleto ? "bg-boleto" : "bg-cartao",
          )}
        >
          Melhor
        </div>
      )}
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-semibold",
          isBoleto ? "text-boleto-foreground" : "text-cartao-foreground",
        )}
      >
        {icon}
        {label}
      </div>
      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Você recebe</div>
        <div
          className={cn(
            "text-2xl sm:text-3xl font-bold tracking-tight tabular-nums mt-0.5",
            isBoleto ? "text-boleto-foreground" : "text-cartao-foreground",
          )}
        >
          {brl(value)}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{hint}</p>
    </Card>
  );
}

function HeroCompare({
  valorVenda,
  recebeFinal,
  tone,
}: {
  valorVenda: number;
  recebeFinal: number;
  tone: "boleto" | "cartao";
}) {
  const isBoleto = tone === "boleto";
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-4 text-center bg-muted/40 border-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Valor da venda
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
          {brl(valorVenda)}
        </div>
      </Card>
      <Card
        className={cn(
          "p-4 text-center border-2",
          isBoleto
            ? "bg-boleto-soft border-boleto/40"
            : "bg-cartao-soft border-cartao/40",
        )}
      >
        <div
          className={cn(
            "text-[11px] uppercase tracking-wider font-semibold",
            isBoleto ? "text-boleto-foreground/70" : "text-cartao-foreground/70",
          )}
        >
          Você recebe no final
        </div>
        <div
          className={cn(
            "text-xl sm:text-2xl font-bold tracking-tight mt-1",
            isBoleto ? "text-boleto-foreground" : "text-cartao-foreground",
          )}
        >
          {brl(recebeFinal)}
        </div>
      </Card>
    </div>
  );
}

function MiniCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "boleto" | "cartao";
}) {
  return (
    <Card
      className={cn(
        "p-4 transition-all",
        highlight === "boleto" && "bg-boleto-soft border-boleto/30",
        highlight === "cartao" && "bg-cartao-soft border-cartao/30",
        !highlight && "border-border/60",
      )}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div
        className={cn(
          "text-lg sm:text-xl font-bold mt-1 tabular-nums",
          highlight === "boleto" && "text-boleto-foreground",
          highlight === "cartao" && "text-cartao-foreground",
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function ParcelasTabela({
  total,
  valor,
  primeiro,
  antecipadas,
  modo,
}: {
  total: number;
  valor: number;
  primeiro: Date;
  antecipadas: number;
  modo: "boleto" | "cartao";
}) {
  const rows = Array.from({ length: total }, (_, i) => {
    const venc = addMonths(primeiro, i);
    const isAntec = i < antecipadas;
    return { i: i + 1, venc, isAntec };
  });

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b bg-muted/30">
        <div>#</div>
        <div>Vencimento</div>
        <div className="text-right">Valor</div>
        <div className="text-right">Status</div>
      </div>
      {rows.map((r, idx) => (
        <div
          key={r.i}
          className={cn(
            "grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-3 text-sm items-center border-b last:border-b-0",
            idx % 2 === 1 && "bg-muted/20",
          )}
        >
          <div className="font-semibold tabular-nums w-5 text-muted-foreground">{r.i}</div>
          <div className="text-foreground/80 tabular-nums">{fmtDate(r.venc)}</div>
          <div className="text-right font-semibold tabular-nums">{brl(valor)}</div>
          <div className="text-right">
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full whitespace-nowrap",
                r.isAntec
                  ? modo === "boleto"
                    ? "bg-boleto text-white"
                    : "bg-cartao text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {r.isAntec ? "Antecipada" : "Normal"}
            </span>
          </div>
        </div>
      ))}
    </Card>
  );
}
