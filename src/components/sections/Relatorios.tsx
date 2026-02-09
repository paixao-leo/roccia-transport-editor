import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  PiggyBank,
  Receipt,
} from "lucide-react";
import {
  useRelatorioFaturamento,
  useResumoFinanceiro,
  useFaturamentoPorCliente,
  GranularidadeRelatorio,
} from "@/hooks/useRelatoriosFinanceiros";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--primary))",
  },
  lucro: {
    label: "Lucro",
    color: "hsl(var(--chart-2))",
  },
  despesas: {
    label: "Despesas",
    color: "hsl(var(--chart-3))",
  },
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatCardRelatorio({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className={`text-xs flex items-center gap-1 ${
                trend === "up" ? "text-green-500" : 
                trend === "down" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {trend === "up" && <TrendingUp className="w-3 h-3" />}
                {trend === "down" && <TrendingDown className="w-3 h-3" />}
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Relatorios() {
  const [granularidade, setGranularidade] = useState<GranularidadeRelatorio>("mensal");
  
  const { data: dadosFaturamento, isLoading: loadingFaturamento } = useRelatorioFaturamento(granularidade);
  const { data: resumo, isLoading: loadingResumo } = useResumoFinanceiro(granularidade);
  const { data: clientesData, isLoading: loadingClientes } = useFaturamentoPorCliente();

  const granularidadeLabels: Record<GranularidadeRelatorio, string> = {
    diario: "Diário",
    semanal: "Semanal",
    mensal: "Mensal",
  };

  return (
    <section className="animate-slide-in space-y-6">
      {/* Header */}
      <div className="section-header mb-6">
        <h2 className="text-2xl font-bold text-primary">Relatórios Financeiros</h2>
        <Tabs value={granularidade} onValueChange={(v) => setGranularidade(v as GranularidadeRelatorio)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="diario">Diário</TabsTrigger>
            <TabsTrigger value="semanal">Semanal</TabsTrigger>
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingResumo ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <StatCardRelatorio
              title="Faturamento Total"
              value={formatCurrency(resumo?.totalFaturamento || 0)}
              subtitle={`${granularidadeLabels[granularidade]}`}
              icon={<DollarSign className="w-5 h-5" />}
              trend="neutral"
            />
            <StatCardRelatorio
              title="Lucro Total"
              value={formatCurrency(resumo?.totalLucro || 0)}
              subtitle={`Margem: ${(resumo?.margemLucro || 0).toFixed(1)}%`}
              icon={<PiggyBank className="w-5 h-5" />}
              trend={resumo?.margemLucro && resumo.margemLucro > 15 ? "up" : "down"}
            />
            <StatCardRelatorio
              title="Total Despesas"
              value={formatCurrency(resumo?.totalDespesas || 0)}
              icon={<Receipt className="w-5 h-5" />}
              trend="neutral"
            />
            <StatCardRelatorio
              title="Cargas no Período"
              value={String(resumo?.quantidadeCargas || 0)}
              icon={<Truck className="w-5 h-5" />}
              trend="neutral"
            />
          </>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Faturamento e Lucro */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Faturamento vs Lucro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingFaturamento ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={dadosFaturamento}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    } 
                  />
                  <Bar 
                    dataKey="faturamento" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Faturamento"
                  />
                  <Bar 
                    dataKey="lucro" 
                    fill="hsl(var(--chart-2))" 
                    radius={[4, 4, 0, 0]}
                    name="Lucro"
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Tendência */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Evolução do Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingFaturamento ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={dadosFaturamento}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    } 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="faturamento" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Faturamento"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lucro" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
                    name="Lucro"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card className="bg-card border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Faturamento por Cliente (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingClientes ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={clientesData}
                      dataKey="faturamento"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ nome, percent }) => `${nome.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {clientesData?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent 
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      } 
                    />
                  </PieChart>
                </ChartContainer>

                <div className="space-y-3">
                  {clientesData?.map((cliente, index) => (
                    <div key={cliente.nome} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-foreground text-sm">{cliente.nome}</p>
                          <p className="text-xs text-muted-foreground">{cliente.cargas} cargas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          {formatCurrency(cliente.faturamento)}
                        </p>
                        <p className="text-xs text-green-500">
                          Lucro: {formatCurrency(cliente.lucro)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
