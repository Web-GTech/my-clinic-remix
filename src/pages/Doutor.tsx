import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface Service {
  id: string;
  service_type: string;
  service_date: string;
  status: string;
  notes: string;
  clients: {
    full_name: string;
    phone: string;
    email: string;
  };
}

const Doutor = () => {
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
      .select("*, clients(full_name, phone, email)")
      .order("service_date", { ascending: false })
      .limit(20);

    setServices(data || []);
  };

  return (
    <DashboardLayout title="Painel do Médico">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Atendimentos</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.clients.full_name}</CardTitle>
                  <Badge>{service.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  📞 {service.clients.phone}
                </p>
                {service.clients.email && (
                  <p className="text-sm text-muted-foreground">
                    ✉️ {service.clients.email}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Procedimento: {service.service_type}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data: {new Date(service.service_date).toLocaleDateString("pt-BR")}
                </p>
                {service.notes && (
                  <p className="text-sm mt-2 p-2 bg-muted rounded">
                    Observações: {service.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {services.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum atendimento registrado
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Doutor;
