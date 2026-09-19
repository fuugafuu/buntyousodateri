alter table public.mofumori_pets alter column weight_g type numeric(9,2),alter column ideal_weight_g type numeric(9,2);
create or replace function public.mofumori_apply_species_defaults() returns trigger language plpgsql set search_path=public as $$
begin
  if new.species='beaver' then
    new.weight_g:=coalesce(nullif(new.weight_g,24.5),18000+random()*4000);new.ideal_weight_g:=20000;new.body_length_cm:=82+random()*10;new.wing_span_cm:=32+random()*8;
    new.frame:=greatest(new.frame,78);new.endurance:=greatest(new.endurance,62);new.balance:=greatest(new.balance,68);new.flight_power:=least(new.flight_power,18);new.beak_speed:=greatest(new.beak_speed,58);
  end if;return new;
end $$;
drop trigger if exists mofumori_species_defaults on public.mofumori_pets;
create trigger mofumori_species_defaults before insert on public.mofumori_pets for each row execute function public.mofumori_apply_species_defaults();
