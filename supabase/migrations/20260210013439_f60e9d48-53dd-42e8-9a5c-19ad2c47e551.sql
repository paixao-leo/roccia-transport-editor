
ALTER TABLE public.cargas
ADD COLUMN classificada boolean NOT NULL DEFAULT false,
ADD COLUMN tipo_frete text NOT NULL DEFAULT 'dedicado';
