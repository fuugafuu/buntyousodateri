# Supabase / Vercel setup for Mofumori v5

The production database is already created and migrations v4, v5, and v5.1 have been applied.

## Vercel environment variables

Set these in the Vercel project `buntyousodateri`.

- `SUPABASE_URL`
  - `https://ctteohttbcohzlouaxpo.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`
  - Copy the **service role / secret key** from the Supabase project API settings.
  - Treat this as a server-only secret. Never commit it to GitHub and never expose it to browser JavaScript.

Apply the variables to at least **Production** and **Preview**, then redeploy.

## Health check

After redeploying:

`GET /api/health`

Expected:

```json
{
  "ok": true,
  "version": "5.0.0",
  "cloudConfigured": true,
  "schemaReady": true,
  "localModeAvailable": true
}
```

## Database migrations

For a fresh database, apply in this order:

1. `supabase/mofumori_v4.sql`
2. `supabase/mofumori_v5.sql`
3. `supabase/mofumori_v5_1_rewards.sql`

The browser does not receive the service-role key. Online pet ownership, gacha awards, friend requests, visits, and privileged mutations are handled through server APIs.
