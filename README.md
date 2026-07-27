# PromptVault PH

PromptVault PH is a Next.js 16, Supabase, and Xendit subscription application. The launch catalog contains 13 prompts and one paid Founding plan at ₱99/month.

## Local development

Use Node.js 22 or newer.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase configuration, development uses a redacted seed catalog: premium prompt bodies remain locked.

Run all application checks with:

```bash
npm run check
npm run test:e2e
```

## Database

The database is defined by ordered files in `supabase/migrations`, with launch data in `supabase/seed.sql`.

```bash
supabase start
supabase db reset
supabase test db
```

Direct prompt-table reads are revoked from public roles. Clients load the catalog through `get_prompt_catalog()`, which returns `null` for premium bodies unless the caller has current access.

## Production configuration

Set every value below in Vercel Production:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
BILLING_ENABLED=true
XENDIT_SECRET_KEY
XENDIT_WEBHOOK_TOKEN
XENDIT_BUSINESS_ID
SUPPORT_EMAIL
CRON_SECRET
```

A production Vercel build is blocked when any required value is missing or the app URL is not HTTPS. Never expose the Supabase service role, Xendit key, callback token, or cron secret through `NEXT_PUBLIC_` variables.

## Supabase launch checklist

1. Apply migrations and seed the 13-prompt catalog.
2. Set the production Site URL and allow `/auth/callback` as a redirect URL.
3. Enable email confirmation and verify signup, PKCE confirmation, login, forgot-password, and reset-password flows.
4. Create the first administrator directly with the service role or SQL, then use the admin console for subsequent role changes.
5. Run `supabase test db` and confirm free users cannot read premium bodies, update roles/subscriptions, or submit paid prompt requests.

## Xendit launch checklist

1. Enable Subscriptions and at least one Philippine channel supporting merchant-initiated transactions.
2. Register `https://YOUR_DOMAIN/api/xendit/webhook` for Payment Session, Payments, Payment Token, and Recurring events.
3. Configure the exact `XENDIT_WEBHOOK_TOKEN` and business ID used by those callbacks.
4. In test mode, exercise initial payment, token activation, recurring-plan activation, successful renewal, three retry attempts, final failure, and cancellation.
5. Verify duplicate and delayed webhooks do not double-extend or shorten access.
6. Keep `BILLING_ENABLED=false` outside an approved/testable environment.

The daily Vercel cron calls `/api/cron/reconcile-subscriptions` to repair paid checkouts where token activation arrived but recurring-plan creation did not finish.

## Deployment

Deploy a Vercel preview, complete browser smoke tests, then promote to production. Acceptance requires:

- premium text absent from unauthenticated/free HTML and API responses;
- verified payment unlocks access;
- cancellation deactivates the Xendit plan while retaining paid-through access;
- no browser-visible secrets;
- `/api/health` returns 200 and `/api/ready` returns 200;
- clean application logs and all CI jobs passing.

Before launch, confirm the previous Vercel deployment is available in deployment history and test a rollback in the project environment.
