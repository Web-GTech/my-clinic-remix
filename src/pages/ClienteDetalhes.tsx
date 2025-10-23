import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, DollarSign, FileText, Pill, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  allergies: string | null;
  medical_history: string | null;
}

interface FinancialSummary {
  total_spent: number;
  total_services: number;
  avg_ticket: number;
  pending_amount: number;
}

interface Procedure {
  id: string;
  performed_at: string;
  product: { name: string; type: string } | null;
  notes: string | null;
  reactions: string | null;
  performed_by: string;
}

interface Medication {
  id: string;
  applied_at: string;
  medication_name: string;
  dosage: string | null;
  batch_number: string | null;
  adverse_reactions: string | null;
  applied_by: string;
}

interface MedicalRecord {
  id: string;
  record_date: string;
  record_type: string;
  complaints: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  observations: string | null;
  created_by: string;
}

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    if (!id) return;

    // Buscar dados do cliente
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    setClient(clientData);

    // Buscar resumo financeiro
    const { data: servicesData } = await supabase
      .from("services")
      .select("total_amount, payment_status")
      .eq("client_id", id);

    if (servicesData) {
      const total = servicesData.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const pending = servicesData
        .filter(s => s.payment_status === 'pending')
        .reduce((sum, s) => sum + (s.total_amount || 0), 0);

      setFinancialSummary({
        total_spent: total,
        total_services: servicesData.length,
        avg_ticket: servicesData.length > 0 ? total / servicesData.length : 0,
        pending_amount: pending,
      });
    }

    // Buscar procedimentos
    const { data: proceduresData } = await supabase
      .from("client_procedures")
      .select(`
        *,
        product:products(name, type)
      `)
      .eq("client_id", id)
      .order("performed_at", { ascending: false });

    setProcedures(proceduresData || []);

    // Buscar medicamentos
    const { data: medicationsData } = await supabase
      .from("client_medications_history")
      .select("*")
      .eq("client_id", id)
      .order("applied_at", { ascending: false });

    setMedications(medicationsData || []);

    // Buscar prontuários
    const { data: recordsData } = await supabase
      .from("client_medical_records")
      .select("*")
      .eq("client_id", id)
      .order("record_date", { ascending: false });

    setMedicalRecords(recordsData || []);
  };

  if (!client) {
    return (
      <DashboardLayout title="Carregando...">
        <div>Carregando dados do cliente...</div>
      </DashboardLayout>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const getRecordTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      consultation: "Consulta",
      procedure: "Procedimento",
      follow_up: "Retorno",
      emergency: "Emergência",
      evaluation: "Avaliação",
    };
    return types[type] || type;
  };

  return (
    <DashboardLayout title={client.full_name}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{client.full_name}</h2>
        </div>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">
              <User className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="financeiro">
              <DollarSign className="h-4 w-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="procedimentos">
              <Stethoscope className="h-4 w-4 mr-2" />
              Procedimentos
            </TabsTrigger>
            <TabsTrigger value="medicamentos">
              <Pill className="h-4 w-4 mr-2" />
              Medicamentos
            </TabsTrigger>
            <TabsTrigger value="prontuario">
              <FileText className="h-4 w-4 mr-2" />
              Prontuário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                  {client.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  )}
                  {client.birth_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium">{formatDate(client.birth_date)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {client.allergies && (
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-600">⚠️ Alergias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{client.allergies}</p>
                </CardContent>
              </Card>
            )}

            {client.medical_history && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Médico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{client.medical_history}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            {financialSummary && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Gasto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {financialSummary.total_spent.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total de Atendimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{financialSummary.total_services}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {financialSummary.avg_ticket.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pendências</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${financialSummary.pending_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      R$ {financialSummary.pending_amount.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="procedimentos" className="space-y-4">
            {procedures.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum procedimento registrado
                </CardContent>
              </Card>
            ) : (
              procedures.map((proc) => (
                <Card key={proc.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{proc.product?.name || "Procedimento"}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(proc.performed_at)}
                        </p>
                      </div>
                      {proc.product && (
                        <Badge>{proc.product.type}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {proc.notes && (
                      <div>
                        <p className="text-sm font-medium">Observações:</p>
                        <p className="text-sm text-muted-foreground">{proc.notes}</p>
                      </div>
                    )}
                    {proc.reactions && (
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm font-medium text-yellow-800">Reações:</p>
                        <p className="text-sm text-yellow-700">{proc.reactions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="medicamentos" className="space-y-4">
            {medications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum medicamento registrado
                </CardContent>
              </Card>
            ) : (
              medications.map((med) => (
                <Card key={med.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{med.medication_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(med.applied_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {med.dosage && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Dosagem:</span> {med.dosage}
                      </p>
                    )}
                    {med.batch_number && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Lote:</span> {med.batch_number}
                      </p>
                    )}
                    {med.adverse_reactions && (
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-sm font-medium text-red-800">Reações Adversas:</p>
                        <p className="text-sm text-red-700">{med.adverse_reactions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="prontuario" className="space-y-4">
            {medicalRecords.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum registro no prontuário
                </CardContent>
              </Card>
            ) : (
              medicalRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{getRecordTypeLabel(record.record_type)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(record.record_date)}
                        </p>
                      </div>
                      <Badge>{record.record_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {record.complaints && (
                      <div>
                        <p className="text-sm font-medium">Queixas:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {record.complaints}
                        </p>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div>
                        <p className="text-sm font-medium">Diagnóstico:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {record.diagnosis}
                        </p>
                      </div>
                    )}
                    {record.treatment_plan && (
                      <div>
                        <p className="text-sm font-medium">Plano de Tratamento:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {record.treatment_plan}
                        </p>
                      </div>
                    )}
                    {record.observations && (
                      <div>
                        <p className="text-sm font-medium">Observações:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {record.observations}
                        </p>
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

export default ClienteDetalhes;