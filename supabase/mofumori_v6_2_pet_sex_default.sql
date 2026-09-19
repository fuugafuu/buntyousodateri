-- Mofumori v6.2: assign sex automatically to every new pet.
alter table public.mofumori_pets
  alter column sex set default (case when random()<0.5 then 'male'::text else 'female'::text end);
