
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operador');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Enable RLS on all tables
ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carga_motorista_veiculo ENABLE ROW LEVEL SECURITY;

-- 6. Policies for cargas
CREATE POLICY "Auth users can read cargas" ON public.cargas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert cargas" ON public.cargas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update cargas" ON public.cargas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete cargas" ON public.cargas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Policies for financeiro_cargas
CREATE POLICY "Auth users can read financeiro" ON public.financeiro_cargas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert financeiro" ON public.financeiro_cargas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update financeiro" ON public.financeiro_cargas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete financeiro" ON public.financeiro_cargas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Policies for clientes
CREATE POLICY "Auth users can read clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update clientes" ON public.clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete clientes" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Policies for motoristas
CREATE POLICY "Auth users can read motoristas" ON public.motoristas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert motoristas" ON public.motoristas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update motoristas" ON public.motoristas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete motoristas" ON public.motoristas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Policies for veiculos
CREATE POLICY "Auth users can read veiculos" ON public.veiculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert veiculos" ON public.veiculos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update veiculos" ON public.veiculos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete veiculos" ON public.veiculos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Policies for pagamentos_motoristas
CREATE POLICY "Auth users can read pagamentos" ON public.pagamentos_motoristas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert pagamentos" ON public.pagamentos_motoristas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update pagamentos" ON public.pagamentos_motoristas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete pagamentos" ON public.pagamentos_motoristas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 12. Policies for carga_motorista_veiculo
CREATE POLICY "Auth users can read cmv" ON public.carga_motorista_veiculo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert cmv" ON public.carga_motorista_veiculo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update cmv" ON public.carga_motorista_veiculo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete cmv" ON public.carga_motorista_veiculo FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. Fix security definer view - recreate as SECURITY INVOKER
DROP VIEW IF EXISTS public.clientes_com_ultima_carga;
CREATE VIEW public.clientes_com_ultima_carga
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.nome,
  MAX(ca.data_carregamento) AS ultima_carga
FROM public.clientes c
LEFT JOIN public.cargas ca ON ca.cliente_id = c.id
GROUP BY c.id, c.nome;

-- 14. Auto-assign admin role to first user via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First user gets admin role, others get operador
  IF (SELECT COUNT(*) FROM auth.users) <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operador');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
