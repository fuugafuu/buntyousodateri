-- Mofumori v7.3.0
-- Multi-generation breeding, inherited game genetics, eggs, chicks and family trees.

alter table public.mofumori_pets
  add column if not exists father_id uuid,
  add column if not exists mother_id uuid,
  add column if not exists generation smallint not null default 0,
  add column if not exists life_stage text not null default 'adult',
  add column if not exists genetics jsonb not null default '{}'::jsonb,
  add column if not exists phenotype jsonb not null default '{}'::jsonb,
  add column if not exists laid_at timestamptz,
  add column if not exists hatch_at timestamptz,
  add column if not exists hatched_at timestamptz,
  add column if not exists adult_earliest_at timestamptz,
  add column if not exists adult_latest_at timestamptz,
  add column if not exists adult_at timestamptz,
  add column if not exists growth_points integer not null default 0,
  add column if not exists bred_at timestamptz;

do $$
begin
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_father_id_fkey') then
    alter table public.mofumori_pets add constraint mofumori_pets_father_id_fkey foreign key(father_id) references public.mofumori_pets(id) on delete set null;
  end if;
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_mother_id_fkey') then
    alter table public.mofumori_pets add constraint mofumori_pets_mother_id_fkey foreign key(mother_id) references public.mofumori_pets(id) on delete set null;
  end if;
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_generation_check') then
    alter table public.mofumori_pets add constraint mofumori_pets_generation_check check (generation between 0 and 100);
  end if;
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_life_stage_check') then
    alter table public.mofumori_pets add constraint mofumori_pets_life_stage_check check (life_stage in ('egg','chick','adult'));
  end if;
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_growth_points_check') then
    alter table public.mofumori_pets add constraint mofumori_pets_growth_points_check check (growth_points between 0 and 100000);
  end if;
end $$;

alter table public.mofumori_pets drop constraint if exists mofumori_pets_source_check;
alter table public.mofumori_pets add constraint mofumori_pets_source_check check (source in ('starter','legacy','gacha','reward','bred'));
create index if not exists mofumori_pets_father_idx on public.mofumori_pets(father_id) where father_id is not null;
create index if not exists mofumori_pets_mother_idx on public.mofumori_pets(mother_id) where mother_id is not null;
create index if not exists mofumori_pets_owner_generation_idx on public.mofumori_pets(owner_key,generation,obtained_at desc);

create table if not exists public.mofumori_breeding_jobs(
  id uuid primary key default gen_random_uuid(),
  owner_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  male_pet_id uuid not null references public.mofumori_pets(id) on delete cascade,
  female_pet_id uuid not null references public.mofumori_pets(id) on delete cascade,
  status text not null default 'running' check(status in ('running','completed','cancelled')),
  started_at timestamptz not null default now(),
  completes_at timestamptz not null,
  egg_pet_id uuid references public.mofumori_pets(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check(male_pet_id<>female_pet_id)
);
alter table public.mofumori_breeding_jobs enable row level security;
revoke all on table public.mofumori_breeding_jobs from public,anon,authenticated;
grant all on table public.mofumori_breeding_jobs to service_role;
create index if not exists mofumori_breeding_owner_status_idx on public.mofumori_breeding_jobs(owner_key,status,completes_at);
create index if not exists mofumori_breeding_egg_idx on public.mofumori_breeding_jobs(egg_pet_id) where egg_pet_id is not null;
create unique index if not exists mofumori_breeding_male_running_uidx on public.mofumori_breeding_jobs(male_pet_id) where status='running';
create unique index if not exists mofumori_breeding_female_running_uidx on public.mofumori_breeding_jobs(female_pet_id) where status='running';

create table if not exists public.mofumori_lifecycle_events(
  id uuid primary key default gen_random_uuid(),
  owner_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  pet_id uuid not null references public.mofumori_pets(id) on delete cascade,
  event_type text not null check(event_type in ('egg_laid','hatched','adult')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  unique(pet_id,event_type)
);
alter table public.mofumori_lifecycle_events enable row level security;
revoke all on table public.mofumori_lifecycle_events from public,anon,authenticated;
grant all on table public.mofumori_lifecycle_events to service_role;
create index if not exists mofumori_lifecycle_owner_pending_idx on public.mofumori_lifecycle_events(owner_key,created_at) where seen_at is null;

CREATE OR REPLACE FUNCTION public.mofumori_ack_lifecycle_event(p_owner text, p_event uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  update public.mofumori_lifecycle_events
  set seen_at=coalesce(seen_at,now())
  where id=p_event and owner_key=p_owner
  returning true
$function$;
revoke execute on function public.mofumori_ack_lifecycle_event(text,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_ack_lifecycle_event(text,uuid) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_advance_lifecycle(p_owner text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  r public.mofumori_pets%rowtype;
  hatched integer:=0;
  adults integer:=0;
begin
  for r in
    select * from public.mofumori_pets
    where owner_key=p_owner and life_stage='egg' and hatch_at is not null and hatch_at<=now()
    for update
  loop
    update public.mofumori_pets
    set life_stage='chick',hatched_at=coalesce(hatched_at,now()),stats_updated_at=now()
    where id=r.id;
    insert into public.mofumori_lifecycle_events(owner_key,pet_id,event_type,payload)
    values(p_owner,r.id,'hatched',jsonb_build_object('generation',r.generation,'phenotype',r.phenotype))
    on conflict(pet_id,event_type) do nothing;
    hatched:=hatched+1;
  end loop;

  for r in
    select * from public.mofumori_pets
    where owner_key=p_owner and life_stage='chick'
      and (
        (adult_earliest_at is not null and adult_earliest_at<=now() and growth_points>=6)
        or (adult_latest_at is not null and adult_latest_at<=now())
      )
    for update
  loop
    update public.mofumori_pets
    set life_stage='adult',adult_at=coalesce(adult_at,now()),stats_updated_at=now()
    where id=r.id;
    insert into public.mofumori_lifecycle_events(owner_key,pet_id,event_type,payload)
    values(p_owner,r.id,'adult',jsonb_build_object('generation',r.generation,'phenotype',r.phenotype))
    on conflict(pet_id,event_type) do nothing;
    adults:=adults+1;
  end loop;

  return jsonb_build_object('hatched',hatched,'adults',adults);
end
$function$;
revoke execute on function public.mofumori_advance_lifecycle(text) from public,anon,authenticated;
grant execute on function public.mofumori_advance_lifecycle(text) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_determine_pet_sex(p_owner text, p_pet uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.mofumori_pets%rowtype;
begin
  select * into r from public.mofumori_pets where id=p_pet and owner_key=p_owner for update;
  if r.id is null then raise exception 'pet_forbidden'; end if;
  if r.life_stage<>'adult' then raise exception 'sex_requires_adult'; end if;
  if not r.sex_known then
    update public.mofumori_pets
    set sex_known=true,sex_determined_at=now()
    where id=r.id returning * into r;
  end if;
  return jsonb_build_object('id',r.id,'sex',r.sex,'sexKnown',r.sex_known,'sexDeterminedAt',r.sex_determined_at);
end
$function$;
revoke execute on function public.mofumori_determine_pet_sex(text,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_determine_pet_sex(text,uuid) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_finish_breeding(p_owner text, p_job uuid, p_species text, p_name text, p_rarity text, p_rank integer, p_sex text, p_genetics jsonb, p_phenotype jsonb, p_stats jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  j public.mofumori_breeding_jobs%rowtype;
  m public.mofumori_pets%rowtype;
  f public.mofumori_pets%rowtype;
  child public.mofumori_pets%rowtype;
  hatch_mins integer;
  adult_min_hours integer;
  adult_max_hours integer;
begin
  select * into j from public.mofumori_breeding_jobs where id=p_job and owner_key=p_owner for update;
  if j.id is null then raise exception 'job_missing'; end if;
  if j.status='completed' and j.egg_pet_id is not null then
    select * into child from public.mofumori_pets where id=j.egg_pet_id;
    return to_jsonb(child);
  end if;
  if j.status<>'running' then raise exception 'job_not_running'; end if;
  if j.completes_at>now() then raise exception 'job_not_ready'; end if;

  select * into m from public.mofumori_pets where id=j.male_pet_id and owner_key=p_owner for update;
  select * into f from public.mofumori_pets where id=j.female_pet_id and owner_key=p_owner for update;
  if m.id is null or f.id is null then raise exception 'parent_missing'; end if;

  hatch_mins:=120+floor(random()*481)::integer;
  adult_min_hours:=6+floor(random()*7)::integer;
  adult_max_hours:=18+floor(random()*7)::integer;

  insert into public.mofumori_pets(
    owner_key,species,rarity,rank,name,source,
    father_id,mother_id,generation,life_stage,genetics,phenotype,
    laid_at,hatch_at,adult_earliest_at,adult_latest_at,bred_at,
    sex,sex_known,sex_determined_at,
    appetite,frame,metabolism,temperament,curiosity,sociability,
    endurance,agility,flight_power,focus,beak_speed,balance,
    weight_g,ideal_weight_g,body_length_cm,wing_span_cm,fitness
  ) values(
    p_owner,p_species,p_rarity,greatest(1,least(5,p_rank::smallint)),left(p_name,12),'bred',
    m.id,f.id,greatest(m.generation,f.generation)+1,'egg',coalesce(p_genetics,'{}'::jsonb),coalesce(p_phenotype,'{}'::jsonb),
    now(),now()+make_interval(mins=>hatch_mins),
    now()+make_interval(mins=>hatch_mins)+make_interval(hours=>adult_min_hours),
    now()+make_interval(mins=>hatch_mins)+make_interval(hours=>adult_max_hours),now(),
    case when p_sex='female' then 'female' else 'male' end,false,null,
    greatest(1,least(100,coalesce((p_stats->>'appetite')::numeric,50))),
    greatest(1,least(100,coalesce((p_stats->>'frame')::numeric,50))),
    greatest(1,least(100,coalesce((p_stats->>'metabolism')::numeric,50))),
    greatest(1,least(100,coalesce((p_stats->>'temperament')::numeric,50))),
    greatest(1,least(100,coalesce((p_stats->>'curiosity')::numeric,50))),
    greatest(1,least(100,coalesce((p_stats->>'sociability')::numeric,50))),
    greatest(1,least(120,coalesce((p_stats->>'endurance')::numeric,50))),
    greatest(1,least(120,coalesce((p_stats->>'agility')::numeric,50))),
    greatest(1,least(120,coalesce((p_stats->>'flightPower')::numeric,50))),
    greatest(1,least(120,coalesce((p_stats->>'focus')::numeric,50))),
    greatest(1,least(120,coalesce((p_stats->>'beakSpeed')::numeric,50))),
    greatest(1,least(120,coalesce((p_stats->>'balance')::numeric,50))),
    greatest(1,coalesce((p_stats->>'weightG')::numeric,24.5)),
    greatest(1,coalesce((p_stats->>'idealWeightG')::numeric,24.5)),
    greatest(1,coalesce((p_stats->>'bodyLengthCm')::numeric,14)),
    greatest(1,coalesce((p_stats->>'wingSpanCm')::numeric,22)),
    greatest(1,least(120,coalesce((p_stats->>'fitness')::numeric,50)))
  ) returning * into child;

  update public.mofumori_breeding_jobs
  set status='completed',egg_pet_id=child.id,completed_at=now()
  where id=j.id;

  insert into public.mofumori_lifecycle_events(owner_key,pet_id,event_type,payload)
  values(p_owner,child.id,'egg_laid',jsonb_build_object(
    'jobId',j.id,'fatherId',m.id,'motherId',f.id,'hatchAt',child.hatch_at,
    'generation',child.generation,'phenotype',child.phenotype
  ))
  on conflict(pet_id,event_type) do nothing;

  return to_jsonb(child);
end
$function$;
revoke execute on function public.mofumori_finish_breeding(text,uuid,text,text,text,integer,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.mofumori_finish_breeding(text,uuid,text,text,text,integer,text,jsonb,jsonb,jsonb) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_fuse_pets(p_owner text, p_target uuid, p_materials uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  t public.mofumori_pets%rowtype;
  material_count integer;
  valid_count integer;
  new_level integer;
begin
  material_count:=coalesce(array_length(p_materials,1),0);
  if material_count<1 or material_count>20 then raise exception 'invalid_material_count'; end if;
  if p_target=any(p_materials) then raise exception 'target_in_materials'; end if;
  if (select count(distinct x) from unnest(p_materials)x)<>material_count then raise exception 'duplicate_material'; end if;

  select * into t from public.mofumori_pets where id=p_target and owner_key=p_owner for update;
  if t.id is null then raise exception 'target_missing'; end if;
  if t.life_stage<>'adult' then raise exception 'target_not_adult'; end if;
  if t.custom_named then raise exception 'target_protected'; end if;
  if t.fusion_level+material_count>20 then raise exception 'fusion_level_max'; end if;

  if exists(select 1 from public.mofumori_breeding_jobs b where b.status='running' and (b.male_pet_id=p_target or b.female_pet_id=p_target))
    or exists(select 1 from public.mofumori_arena_matches m where m.status in ('ready','running') and m.expires_at>now() and (m.pet1_id=p_target or m.pet2_id=p_target))
    or exists(select 1 from public.mofumori_visits v where v.ended_at is null and v.expires_at>now() and v.pet_id=p_target)
  then raise exception 'target_busy'; end if;

  select count(*) into valid_count
  from public.mofumori_pets p
  where p.owner_key=p_owner and p.id=any(p_materials) and p.id<>p_target and p.species=t.species
    and p.life_stage='adult' and p.custom_named=false and p.fusion_level=0
    and not exists(select 1 from public.mofumori_pets child where child.father_id=p.id or child.mother_id=p.id)
    and not exists(select 1 from public.mofumori_profiles pr where pr.user_key=p_owner and pr.active_pet_id=p.id)
    and not exists(select 1 from public.mofumori_visits v where v.ended_at is null and v.expires_at>now() and v.pet_id=p.id)
    and not exists(select 1 from public.mofumori_arena_matches m where m.status in ('ready','running') and m.expires_at>now() and (m.pet1_id=p.id or m.pet2_id=p.id))
    and not exists(select 1 from public.mofumori_breeding_jobs b where b.status='running' and (b.male_pet_id=p.id or b.female_pet_id=p.id));
  if valid_count<>material_count then raise exception 'material_invalid_or_protected'; end if;

  perform 1 from public.mofumori_pets p where p.owner_key=p_owner and p.id=any(p_materials) for update;
  new_level:=t.fusion_level+material_count;
  update public.mofumori_pets
  set fusion_level=new_level,fusion_count=fusion_count+material_count,fused_at=now(),
      endurance=least(120,endurance+2.5*material_count),agility=least(120,agility+2.5*material_count),
      flight_power=least(120,flight_power+2.5*material_count),focus=least(120,focus+2.5*material_count),
      beak_speed=least(120,beak_speed+2.5*material_count),balance=least(120,balance+2.5*material_count),
      fitness=least(120,fitness+2.5*material_count),stats_updated_at=now()
  where id=p_target and owner_key=p_owner;
  delete from public.mofumori_pets where owner_key=p_owner and id=any(p_materials);
  select * into t from public.mofumori_pets where id=p_target;
  return jsonb_build_object('targetId',t.id,'species',t.species,'fusionLevel',t.fusion_level,'fusionCount',t.fusion_count,'consumed',material_count,'statGain',2.5*material_count);
end
$function$;
revoke execute on function public.mofumori_fuse_pets(text,uuid,uuid[]) from public,anon,authenticated;
grant execute on function public.mofumori_fuse_pets(text,uuid,uuid[]) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_record_pet_care(p_owner text, p_pet uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  r public.mofumori_pets%rowtype;
  old_count integer;
  new_count integer;
  delta numeric;
  growth_gain integer:=0;
begin
  if p_action not in ('feed','treat','play','train','sing','bath','pet','sleep') then raise exception 'invalid_care_action'; end if;
  select * into r from public.mofumori_pets where id=p_pet and owner_key=p_owner for update;
  if r.id is null then raise exception 'pet_forbidden'; end if;
  if r.life_stage='egg' then raise exception 'egg_cannot_care'; end if;

  old_count:=coalesce((r.care_counters->>p_action)::integer,0);
  new_count:=old_count+1;
  delta:=case p_action
    when 'feed' then greatest(0.018,r.ideal_weight_g*0.00045)
    when 'treat' then greatest(0.055,r.ideal_weight_g*0.0011)
    when 'play' then -greatest(0.018,r.ideal_weight_g*0.00035)
    when 'train' then -greatest(0.012,r.ideal_weight_g*0.00028)
    else 0 end;
  growth_gain:=case when r.life_stage='chick' then
    case p_action when 'feed' then 2 when 'play' then 2 when 'train' then 2 else 1 end
  else 0 end;

  update public.mofumori_pets set
    care_counters=jsonb_set(care_counters,array[p_action],to_jsonb(new_count),true),
    appetite=greatest(1,least(100,appetite+case p_action when 'feed' then .05 when 'treat' then .16 when 'play' then -.02 else 0 end)),
    temperament=greatest(1,least(100,temperament+case p_action when 'pet' then .08 when 'bath' then .04 when 'sleep' then .03 else 0 end)),
    curiosity=greatest(1,least(100,curiosity+case p_action when 'play' then .07 when 'train' then .05 else 0 end)),
    sociability=greatest(1,least(100,sociability+case p_action when 'pet' then .08 when 'sing' then .09 when 'play' then .04 else 0 end)),
    endurance=greatest(1,least(120,endurance+case p_action when 'train' then .18 when 'play' then .11 when 'sleep' then .07 else 0 end)),
    agility=greatest(1,least(120,agility+case p_action when 'play' then .18 when 'train' then .09 else 0 end)),
    flight_power=greatest(1,least(120,flight_power+case p_action when 'train' then .20 when 'play' then .06 else 0 end)),
    focus=greatest(1,least(120,focus+case p_action when 'train' then .16 when 'sing' then .10 when 'sleep' then .04 else 0 end)),
    beak_speed=greatest(1,least(120,beak_speed+case p_action when 'feed' then .05 when 'treat' then .03 else 0 end)),
    balance=greatest(1,least(120,balance+case p_action when 'play' then .12 when 'train' then .12 else 0 end)),
    fitness=greatest(1,least(120,fitness+case p_action when 'train' then .13 when 'play' then .10 when 'sleep' then .07 when 'treat' then -.12 else 0 end)),
    weight_g=greatest(ideal_weight_g*.6,least(ideal_weight_g*1.5,weight_g+delta)),
    growth_points=least(100000,growth_points+growth_gain),
    last_care_at=now(),stats_updated_at=now()
  where id=p_pet returning * into r;

  if r.life_stage='chick' and (
      (r.adult_earliest_at is not null and r.adult_earliest_at<=now() and r.growth_points>=6)
      or (r.adult_latest_at is not null and r.adult_latest_at<=now())
    ) then
    update public.mofumori_pets set life_stage='adult',adult_at=coalesce(adult_at,now()),stats_updated_at=now()
    where id=r.id returning * into r;
    insert into public.mofumori_lifecycle_events(owner_key,pet_id,event_type,payload)
    values(p_owner,r.id,'adult',jsonb_build_object('generation',r.generation,'phenotype',r.phenotype))
    on conflict(pet_id,event_type) do nothing;
  end if;

  return jsonb_build_object(
    'id',r.id,'lifeStage',r.life_stage,'growthPoints',r.growth_points,
    'appetite',r.appetite,'frame',r.frame,'metabolism',r.metabolism,'temperament',r.temperament,
    'curiosity',r.curiosity,'sociability',r.sociability,'endurance',r.endurance,'agility',r.agility,
    'flightPower',r.flight_power,'focus',r.focus,'beakSpeed',r.beak_speed,'balance',r.balance,
    'weightG',r.weight_g,'idealWeightG',r.ideal_weight_g,'bodyLengthCm',r.body_length_cm,'wingSpanCm',r.wing_span_cm,
    'fitness',r.fitness,'careCounters',r.care_counters,'rating',r.arena_rating,
    'wins',r.arena_wins,'losses',r.arena_losses,'draws',r.arena_draws
  );
end
$function$;
revoke execute on function public.mofumori_record_pet_care(text,uuid,text) from public,anon,authenticated;
grant execute on function public.mofumori_record_pet_care(text,uuid,text) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_start_breeding(p_owner text, p_male uuid, p_female uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  m public.mofumori_pets%rowtype;
  f public.mofumori_pets%rowtype;
  j public.mofumori_breeding_jobs%rowtype;
  mins integer;
  compatible boolean:=false;
begin
  if p_male is null or p_female is null or p_male=p_female then raise exception 'invalid_pair'; end if;

  select * into m from public.mofumori_pets where id=p_male and owner_key=p_owner for update;
  select * into f from public.mofumori_pets where id=p_female and owner_key=p_owner for update;
  if m.id is null or f.id is null then raise exception 'pet_forbidden'; end if;
  if m.life_stage<>'adult' or f.life_stage<>'adult' then raise exception 'not_adult'; end if;
  if not m.sex_known or m.sex<>'male' or not f.sex_known or f.sex<>'female' then raise exception 'sex_mismatch'; end if;

  compatible := (
    (m.species like 'buncho_%' and f.species like 'buncho_%')
    or
    (m.species=f.species and m.species in ('canary','inko_green','inko_blue','finch_zebra','lovebird','cockatiel','owl','penguin'))
  );
  if not compatible then raise exception 'species_incompatible'; end if;

  if m.id in (f.father_id,f.mother_id) or f.id in (m.father_id,m.mother_id) then raise exception 'close_relation'; end if;
  if (m.father_id is not null and m.father_id in (f.father_id,f.mother_id))
     or (m.mother_id is not null and m.mother_id in (f.father_id,f.mother_id))
  then raise exception 'close_relation'; end if;

  if exists(select 1 from public.mofumori_breeding_jobs b where b.status='running' and (b.male_pet_id in (m.id,f.id) or b.female_pet_id in (m.id,f.id)))
  then raise exception 'breeding_busy'; end if;

  if exists(select 1 from public.mofumori_visits v where v.ended_at is null and v.expires_at>now() and v.pet_id in (m.id,f.id))
  then raise exception 'pet_busy'; end if;
  if exists(select 1 from public.mofumori_arena_queue q where q.expires_at>now() and q.pet_id in (m.id,f.id))
  then raise exception 'pet_busy'; end if;
  if exists(select 1 from public.mofumori_arena_matches a where a.status in ('ready','running') and a.expires_at>now() and (a.pet1_id in (m.id,f.id) or a.pet2_id in (m.id,f.id)))
  then raise exception 'pet_busy'; end if;

  mins:=180+floor(random()*1261)::integer;
  insert into public.mofumori_breeding_jobs(owner_key,male_pet_id,female_pet_id,completes_at)
  values(p_owner,m.id,f.id,now()+make_interval(mins=>mins))
  returning * into j;

  return jsonb_build_object(
    'id',j.id,'malePetId',j.male_pet_id,'femalePetId',j.female_pet_id,
    'status',j.status,'startedAt',j.started_at,'completesAt',j.completes_at,
    'durationMinutes',mins
  );
end
$function$;
revoke execute on function public.mofumori_start_breeding(text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_start_breeding(text,uuid,uuid) to service_role;

CREATE OR REPLACE FUNCTION public.mofumori_start_visit(p_visitor text, p_host text, p_pet uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare visit_row public.mofumori_visits%rowtype;
begin
  if p_visitor=p_host then raise exception 'invalid_host'; end if;
  if not exists(select 1 from public.mofumori_friendships where owner_key=p_visitor and friend_key=p_host)
    then raise exception 'not_friends'; end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_visitor and life_stage='adult')
    then raise exception 'pet_forbidden'; end if;
  if exists(select 1 from public.mofumori_breeding_jobs b where b.status='running' and (b.male_pet_id=p_pet or b.female_pet_id=p_pet))
    then raise exception 'pet_busy'; end if;
  update public.mofumori_visits set ended_at=now() where pet_id=p_pet and ended_at is null and expires_at<=now();
  if exists(select 1 from public.mofumori_visits where pet_id=p_pet and ended_at is null and expires_at>now())
    then raise exception 'pet_busy'; end if;
  insert into public.mofumori_visits(host_key,visitor_key,pet_id)
  values(p_host,p_visitor,p_pet) returning * into visit_row;
  return to_jsonb(visit_row);
end
$function$;
revoke execute on function public.mofumori_start_visit(text,text,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_start_visit(text,text,uuid) to service_role;

