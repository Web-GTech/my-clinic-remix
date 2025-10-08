import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Clock } from "lucide-react";

interface QueueItem {
  id: string;
  queue_number: number;
  status: string;
  services: {
    clients: {
      full_name: string;
    };
  };
}

const PainelPublico = () => {
  const [currentQueue, setCurrentQueue] = useState<QueueItem | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue" },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueue = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: current } = await supabase
      .from("queue")
      .select(`*, services (clients (full_name))`)
      .eq("queue_date", today)
      .eq("status", "attending")
      .order("called_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: waiting } = await supabase
      .from("queue")
      .select(`*, services (clients (full_name))`)
      .eq("queue_date", today)
      .eq("status", "waiting")
      .order("queue_number")
      .limit(10);

    setCurrentQueue(current);
    setWaitingQueue(waiting || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Painel de Atendimento
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <p className="text-sm">
              Atualização em tempo real
            </p>
          </div>
        </div>

        {currentQueue ? (
          <Card className="border-2 border-primary shadow-2xl bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-12 text-center space-y-4">
              <p className="text-muted-foreground text-lg">Atendimento Atual</p>
              <div className="space-y-4">
                <div className="text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
                  {currentQueue.queue_number.toString().padStart(3, "0")}
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {currentQueue.services.clients.full_name}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-muted">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-xl">
                Aguardando próximo atendimento
              </p>
            </CardContent>
          </Card>
        )}

        {waitingQueue.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Aguardando</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {waitingQueue.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-all hover:scale-105"
                >
                  <CardContent className="p-6 text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      {item.queue_number.toString().padStart(3, "0")}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.services.clients.full_name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelPublico;
