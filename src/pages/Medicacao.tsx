import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";

interface Service {
  id: string;
  service_type: string;
  service_date: string;
  status: string;
  clients: {
    full_name: string;
  };
}

const Medicacao = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices();

    const channel = supabase
      .channel("services-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*, clients(full_name)")
      .eq("status", "scheduled")
      .order("service_date", { ascending: true })
      .order("service_time", { ascending: true });

    setServices(data || []);
  };

  return (
    <DashboardLayout title="Medicação">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Atendimentos Pendentes</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{service.clients.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Procedimento: {service.service_type}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data: {new Date(service.service_date).toLocaleDateString("pt-BR")}
                </p>
                <Badge variant="outline">{service.status}</Badge>
              </CardContent>
            </Card>
          ))}

          {services.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum atendimento pendente no momento
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Medicacao;
