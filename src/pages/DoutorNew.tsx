import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface DailySummary {
  totalRevenue: number;
  totalServices: number;
  totalClients: number;
  avgTicket: number;
}

interface Service {
  id: string;
  service_date: string;
  service_time: string;
  total_amount: number;
  payment_status: string;
  status: string;
  client: {
    id: string;
    full_name: string;
    phone: string;
  };
  items: Array<{
    product: {
      name: string;
      type: string;
    };
    quantity: number;
    subtotal: number;
  }>;
}

const DoutorNew = () => {
  const navigate = useNavigate();
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    totalRevenue: 0,
    totalServices: 0,
    totalClients: 0,
    avgTicket: 0,
  });
  const [todayServices, setTodayServices] = useState<Service[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    // Buscar resumo do dia
    const { data: servicesData } = await supabase
      .from("services")
      .select("total_amount, client_id, payment_status")
      .eq("service_date", selectedDate)
      .eq("status", "completed");

    if (servicesData) {
      const uniqueClients = new Set(servicesData.map(s => s.client_id));
      const total = servicesData.reduce((sum, s) => sum + (s.total_amount || 0), 0);

      setDailySummary({
        totalRevenue: total,
        totalServices: servicesData.length,
        totalClients: uniqueClients.size,
        avgTicket: servicesData.length > 0 ? total / servicesData.length : 0,
      });
    }

    // Buscar serviços de hoje
    const { data: todayData } = await supabase
      .from("services")
      .select(`
        *,
        client:clients(id, full_name, phone),
        items:service_items(
          quantity,
          subtotal,
          product:products(name, type)
        )
      `)
      .eq("service_date", selectedDate)
      .order("service_time", { ascending: true });

    setTodayServices(todayData || []);

    // Buscar serviços recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentData } = await supabase
      .from("services")
      .select(`
        *,
        client:clients(id, full_name, phone),
        items:service_items(
          quantity,
          subtotal,
          product:products(name, type)
        )
      `)
      .gte("service_date", sevenDaysAgo.toISOString().split('T')[0])
      .order("service_date", { ascending: false })
      .order("service_time", { ascending: false })
      .limit(20);

    setRecentServices(recentData || []);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      scheduled: { label: "Agendado", variant: "outline" },
      in_progress: { label: "Em Andamento", variant: "default" },
      completed: { label: "Concluído", variant: "secondary" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-700" },
      partial: { label: "Parcial", className: "bg-blue-500/10 text-blue-700" },
      completed: { label: "Pago", className: "bg-green-500/10 text-green-700" },
      cancelled: { label: "Cancelado", className: "bg-red-500/10 text-red-700" },
    };
    const config = statusMap[status] || { label: status, className: "bg-muted text-muted-foreground" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Painel do Médico">
      <div className="space-y-6">
        {/* Métricas do Dia */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
            <Button variant="outline" onClick={() => navigate("/financeiro")}>
              Ver Relatório Completo
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Faturamento do Dia"
            value={formatCurrency(dailySummary.totalRevenue)}
            icon={DollarSign}
            description={`${dailySummary.totalServices} atendimentos`}
          />
          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(dailySummary.avgTicket)}
            icon={TrendingUp}
            description="Valor médio por atendimento"
          />
          <MetricCard
            title="Clientes Atendidos"
            value={dailySummary.totalClients}
            icon={Users}
            description="Clientes únicos"
          />
          <MetricCard
            title="Total de Atendimentos"
            value={dailySummary.totalServices}
            icon={Calendar}
            description="Serviços realizados"
          />
        </div>

        {/* Tabs de Atendimentos */}
        <Tabs defaultValue="hoje" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hoje">Atendimentos de Hoje</TabsTrigger>
            <TabsTrigger value="recentes">Últimos 7 Dias</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-4">
            {todayServices.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum atendimento agendado para hoje
                </CardContent>
              </Card>
            ) : (
              todayServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {service.client.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          📞 {service.client.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          🕐 {service.service_time}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(service.status)}
                        {getPaymentBadge(service.payment_status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/cliente/${service.client.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Cliente
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.items && service.items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Itens do Atendimento:</p>
                        <div className="space-y-1">
                          {service.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.product.name}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-green-600">
                            {formatCurrency(service.total_amount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recentes" className="space-y-4">
            {recentServices.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum atendimento nos últimos 7 dias
                </CardContent>
              </Card>
            ) : (
              recentServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {service.client.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          📅 {new Date(service.service_date).toLocaleDateString("pt-BR")} às {service.service_time}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(service.status)}
                        {getPaymentBadge(service.payment_status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/cliente/${service.client.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Cliente
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.items && service.items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Itens:</p>
                        <div className="space-y-1">
                          {service.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.product.name}
                              </span>
                              <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-green-600">
                            {formatCurrency(service.total_amount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DoutorNew;