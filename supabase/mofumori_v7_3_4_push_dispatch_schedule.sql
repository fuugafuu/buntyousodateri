-- Mofumori v7.3.4 background Push dispatcher
-- Token stays in Supabase Vault; no secret value is stored in this migration.

do $$
declare
  existing bigint;
begin
  select jobid into existing from cron.job where jobname='mofumori-push-dispatch' limit 1;
  if existing is not null then perform cron.unschedule(existing); end if;
end $$;

select cron.schedule(
  'mofumori-push-dispatch',
  '* * * * *',
  $cron$
    select net.http_post(
      url := 'https://buntyousodateri.vercel.app/api/push',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-mofumori-push-cron',
        (select decrypted_secret from vault.decrypted_secrets where name='mofumori_push_cron_token' limit 1)
      ),
      body := '{"action":"dispatch"}'::jsonb,
      timeout_milliseconds := 25000
    ) as request_id;
  $cron$
);
