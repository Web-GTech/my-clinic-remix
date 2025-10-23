import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, ShoppingCart, FileText } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";

interface FinancialData {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  totalServices: number;
  servicesByType: Record<string, { count: number; revenue: number }>;
  topProducts: Array<{ name: string; type: string; quantity: number; revenue: number }>;
}

const Financeiro = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    totalServices: 0,
    servicesByType: {},
    topProducts: [],
  });

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const getDateRange = () => {
    const today = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'week':
        start.setDate(today.getDate() - 7);
        return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'month':
        start.setMonth(today.getMonth() - 1);
        return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      default:
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
    }
  };

  const fetchFinancialData = async () => {
    const { start, end } = getDateRange();

    // Buscar serviços concluídos no período
    const { data: services } = await supabase
      .from("services")
      .select(`
        *,
        items:service_items(
          quantity,
          subtotal,
          unit_price,
          product:products(name, type, cost)
        )
      `)
      .eq("status", "completed")
      .gte("service_date", start)
      .lte("service_date", end);

    if (!services) return;

    let totalRevenue = 0;
    let totalCost = 0;
    const servicesByType: Record<string, { count: number; revenue: number }> = {};
    const productsSummary: Record<string, { name: string; type: string; quantity: number; revenue: number }> = {};

    services.forEach((service) => {
      totalRevenue += service.total_amount || 0;

      if (service.items) {
        service.items.forEach((item: any) => {
          const cost = (item.product?.cost || 0) * item.quantity;
          totalCost += cost;

          // Agrupar por tipo de serviço
          const type = item.product?.type || 'other';
          if (!servicesByType[type]) {
            servicesByType[type] = { count: 0, revenue: 0 };
          }
          servicesByType[type].count += item.quantity;
          servicesByType[type].revenue += item.subtotal;

          // Top produtos
          const productName = item.product?.name || 'Desconhecido';
          if (!productsSummary[productName]) {
            productsSummary[productName] = {
              name: productName,
              type: item.product?.type || 'other',
              quantity: 0,
              revenue: 0,
            };
          }
          productsSummary[productName].quantity += item.quantity;
          productsSummary[productName].revenue += item.subtotal;
        });
      }
    });

    const topProducts = Object.values(productsSummary)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    setFinancialData({
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost,
      totalServices: services.length,
      servicesByType,
      topProducts,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPeriodLabel = () => {
    const labels = {
      today: 'Hoje',
      week: 'Últimos 7 dias',
      month: 'Último mês',
      year: 'Último ano',
    };
    return labels[period];
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      procedure: "Procedimentos",
      medication: "Medicamentos",
      consultation: "Consultas",
      product: "Produtos",
      other: "Outros",
    };
    return types[type] || type;
  };

  const profitMargin = financialData.totalRevenue > 0
    ? ((financialData.profit / financialData.totalRevenue) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout title="Relatórios Financeiros">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Faturamento Total"
            value={formatCurrency(financialData.totalRevenue)}
            icon={DollarSign}
            description={getPeriodLabel()}
          />
          <MetricCard
            title="Lucro Líquido"
            value={formatCurrency(financialData.profit)}
            icon={TrendingUp}
            description={`Margem: ${profitMargin}%`}
          />
          <MetricCard
            title="Custos Totais"
            value={formatCurrency(financialData.totalCost)}
            icon={ShoppingCart}
            description="Custos dos produtos"
          />
          <MetricCard
            title="Total de Serviços"
            value={financialData.totalServices}
            icon={FileText}
            description="Atendimentos concluídos"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Serviços por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(financialData.servicesByType).map(([type, data]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.count} itens
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 bg-muted rounded-full h-2 mr-4">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(data.revenue / financialData.totalRevenue) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(data.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produtos/Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.topProducts.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} vendas
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Executivo - {getPeriodLabel()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Receita Bruta</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialData.totalRevenue)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">(-) Custos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialData.totalCost)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">(=) Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(financialData.profit)}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Margem de Lucro</span>
                <span className="text-lg font-bold">{profitMargin}%</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Ticket Médio</span>
                <span className="text-lg font-bold">
                  {formatCurrency(
                    financialData.totalServices > 0
                      ? financialData.totalRevenue / financialData.totalServices
                      : 0
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Imprimir Relatório
          </Button>
          <Button>Exportar para Excel</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Financeiro;