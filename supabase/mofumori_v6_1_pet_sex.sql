-- Mofumori v6.1: immutable biological sex + player-visible determination state.

alter table public.mofumori_pets
  add column if not exists sex text check (sex in ('male','female')),
  add column if not exists sex_known boolean not null default false,
  add column if not exists sex_determined_at timestamptz;

update public.mofumori_pets
set sex=case when random()<0.5 then 'male' else 'female' end
where sex is null;

alter table public.mofumori_pets alter column sex set not null;

create or replace function public.mofumori_determine_pet_sex(p_owner text,p_pet uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.mofumori_pets%rowtype;
begin
  select * into r from public.mofumori_pets where id=p_pet and owner_key=p_owner for update;
  if r.id is null then raise exception 'pet_forbidden'; end if;
  if not r.sex_known then
    update public.mofumori_pets set sex_known=true,sex_determined_at=now()
    where id=r.id returning * into r;
  end if;
  return jsonb_build_object('id',r.id,'sex',r.sex,'sexKnown',r.sex_known,'sexDeterminedAt',r.sex_determined_at);
end $$;

revoke all on function public.mofumori_determine_pet_sex(text,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_determine_pet_sex(text,uuid) to service_role;
