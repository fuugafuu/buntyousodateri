alter table public.mofumori_pets alter column weight_g type numeric(9,2),alter column ideal_weight_g type numeric(9,2);
create or replace function public.mofumori_apply_species_defaults() returns trigger language plpgsql set search_path=public as $$
begin
  if new.species='beaver' then
    if new.weight_g is null or new.weight_g<1000 then new.weight_g:=18000+random()*4000; end if;
    if new.ideal_weight_g is null or new.ideal_weight_g<1000 then new.ideal_weight_g:=20000; end if;
    new.body_length_cm:=case when new.body_length_cm is null or new.body_length_cm<50 then 82+random()*10 else new.body_length_cm end;
    new.wing_span_cm:=case when new.wing_span_cm is null or new.wing_span_cm>60 then 32+random()*8 else new.wing_span_cm end;
    new.frame:=greatest(coalesce(new.frame,0),78);new.endurance:=greatest(coalesce(new.endurance,0),62);new.balance:=greatest(coalesce(new.balance,0),68);new.flight_power:=least(coalesce(new.flight_power,18),18);new.beak_speed:=greatest(coalesce(new.beak_speed,0),58);
  end if;return new;
end $$;
drop trigger if exists mofumori_species_defaults on public.mofumori_pets;
create trigger mofumori_species_defaults before insert on public.mofumori_pets for each row execute function public.mofumori_apply_species_defaults();
