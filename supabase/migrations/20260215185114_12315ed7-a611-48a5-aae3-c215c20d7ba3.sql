
-- Fix search_path on existing functions
CREATE OR REPLACE FUNCTION public.calcular_financeiro()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.valor_seguro := NEW.valor_mercadoria * (NEW.percentual_seguro / 100);
  NEW.total_despesas := COALESCE(NEW.frete_terceiro,0) + COALESCE(NEW.impostos,0) + COALESCE(NEW.valor_seguro,0) + COALESCE(NEW.custos_extras,0);
  NEW.lucro := NEW.faturamento - NEW.total_despesas;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.gerar_pagamento_motorista()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'em_transito' AND OLD.status IS DISTINCT FROM 'em_transito' THEN
    INSERT INTO pagamentos_motoristas (carga_id, motorista_id, valor_total, percentual_pago, valor_pago, saldo_restante, status)
    SELECT NEW.id, cmv.motorista_id, f.frete_terceiro, 70, f.frete_terceiro * 0.7, f.frete_terceiro * 0.3, 'pago_parcial'
    FROM carga_motorista_veiculo cmv
    JOIN financeiro_cargas f ON f.carga_id = NEW.id
    WHERE cmv.carga_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;
