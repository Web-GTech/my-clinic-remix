-- ============================================
-- FASE 1: CORREÇÃO CRÍTICA DE AUTENTICAÇÃO
-- ============================================

-- Função para criar role automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'recepcionista'); -- role padrão para novos usuários
  RETURN NEW;
END;
$$;

-- Trigger para executar a função após criação de usuário
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- ============================================
-- FASE 2: SISTEMA DE PRECIFICAÇÃO
-- ============================================

-- Tabela de Produtos/Procedimentos/Medicamentos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('procedure', 'medication', 'consultation', 'product')),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_products_type ON public.products(type);
CREATE INDEX idx_products_active ON public.products(active);

-- RLS para products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products"
ON public.products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage products"
ON public.products FOR ALL
TO authenticated
USING (true);

-- Tabela de Itens do Atendimento
CREATE TABLE public.service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_items_service ON public.service_items(service_id);
CREATE INDEX idx_service_items_product ON public.service_items(product_id);

-- RLS para service_items
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service items"
ON public.service_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage service items"
ON public.service_items FOR ALL
TO authenticated
USING (true);

-- Tabela de Pagamentos
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  paid_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_service ON public.payments(service_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- RLS para payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payments"
ON public.payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payments"
ON public.payments FOR ALL
TO authenticated
USING (true);

-- Modificar tabela services para incluir informações financeiras
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES auth.users(id);

CREATE INDEX idx_services_payment_status ON public.services(payment_status);
CREATE INDEX idx_services_date ON public.services(service_date);

-- ============================================
-- FASE 3: HISTÓRICO MÉDICO E CONTROLE
-- ============================================

-- Tabela de Procedimentos Realizados
CREATE TABLE public.client_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  product_id UUID REFERENCES public.products(id),
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  reactions TEXT,
  photos JSONB DEFAULT '[]',
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_procedures_client ON public.client_procedures(client_id);
CREATE INDEX idx_client_procedures_performed_at ON public.client_procedures(performed_at DESC);

-- RLS para client_procedures
ALTER TABLE public.client_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view client procedures"
ON public.client_procedures FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage client procedures"
ON public.client_procedures FOR ALL
TO authenticated
USING (true);

-- Tabela de Prontuário Médico
CREATE TABLE public.client_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type TEXT NOT NULL CHECK (record_type IN ('consultation', 'procedure', 'follow_up', 'emergency', 'evaluation')),
  complaints TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  observations TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_records_client ON public.client_medical_records(client_id);
CREATE INDEX idx_medical_records_date ON public.client_medical_records(record_date DESC);
CREATE INDEX idx_medical_records_type ON public.client_medical_records(record_type);

-- RLS para client_medical_records
ALTER TABLE public.client_medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view medical records"
ON public.client_medical_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage medical records"
ON public.client_medical_records FOR ALL
TO authenticated
USING (true);

-- Tabela de Histórico de Medicamentos
CREATE TABLE public.client_medications_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  product_id UUID REFERENCES public.products(id),
  medication_name TEXT NOT NULL,
  dosage TEXT,
  application_method TEXT,
  batch_number TEXT,
  expiry_date DATE,
  adverse_reactions TEXT,
  applied_by UUID NOT NULL REFERENCES auth.users(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medications_history_client ON public.client_medications_history(client_id);
CREATE INDEX idx_medications_history_applied_at ON public.client_medications_history(applied_at DESC);

-- RLS para client_medications_history
ALTER TABLE public.client_medications_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view medications history"
ON public.client_medications_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage medications history"
ON public.client_medications_history FOR ALL
TO authenticated
USING (true);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.client_medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();