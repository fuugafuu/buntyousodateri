alter table public.mofumori_pets drop constraint if exists mofumori_pets_species_check;
alter table public.mofumori_pets add constraint mofumori_pets_species_check
check (species = any(array[
  'buncho_sakura'::text,'buncho_white'::text,'buncho_cinnamon'::text,'buncho_silver'::text,
  'canary'::text,'inko_green'::text,'inko_blue'::text,'buncho_pied'::text,'buncho_black'::text,
  'finch_zebra'::text,'lovebird'::text,'cockatiel'::text,'owl'::text,'cat'::text,'fox'::text,
  'penguin'::text,'beaver'::text,'fuga'::text
]));
