# WisperTalk — license storefront

Next.js 15 site at **wispertalk.com**. Sells WisperTalk lifetime licenses via Stripe, issues keys, enforces one-device-at-a-time, and ships an admin dashboard for sales tracking.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind v4 (token-driven theme in `globals.css`)
- Drizzle ORM + Postgres
- Stripe Checkout + webhooks
- Resend for transactional email
- jose for JWT (license device tokens + admin session)

## Local development

```powershell
cp .env.example .env.local
# fill in DATABASE_URL, STRIPE_*, RESEND_API_KEY, LICENSE_JWT_SECRET, ADMIN_PASSWORD, etc.
npm install
npm run db:push   # creates schema in your dev Postgres
npm run dev       # http://localhost:3001
```

For Stripe test webhooks during development:
```powershell
stripe listen --forward-to localhost:3001/api/webhook
# copy the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

## Production deploy — Coolify

The site runs on the Coolify host at `212.28.184.24` (Contabo VPS 2).

1. **Cloudflare DNS** — Add an A record `wispertalk.com → 212.28.184.24`, proxied (orange cloud).
2. **Postgres** — In Coolify, "+ New Resource → Postgres". Note the connection string.
3. **App project** — "+ New Resource → Application → Public Repository". Use `https://github.com/bensblueprints/whisper-talk-site`. Build pack: **Dockerfile**. Port: **3001**. Domain: `wispertalk.com` with HTTPS.
4. **Environment variables** in the Coolify app:
   - `DATABASE_URL` — from step 2
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
   - `RESEND_API_KEY`, `EMAIL_FROM`
   - `LICENSE_JWT_SECRET` — `openssl rand -base64 48`
   - `ADMIN_PASSWORD`, `ADMIN_COOKIE_SECRET`
   - `NEXT_PUBLIC_SITE_URL=https://wispertalk.com`
   - `NEXT_PUBLIC_DOWNLOAD_URL=https://github.com/bensblueprints/whisper-talk/releases/latest`
5. **Deploy** — first build takes ~3 min.
6. **Run migrations** — once the app is up, run `npm run db:migrate` from a Coolify exec terminal, or temporarily uncomment a one-shot init command.
7. **Stripe webhook** — in the Stripe dashboard, add endpoint `https://wispertalk.com/api/webhook` for events `checkout.session.completed` and `charge.refunded`. Copy the signing secret into Coolify env and redeploy.

## License flow

1. Customer clicks **Buy lifetime — $49** → `POST /api/checkout` → Stripe Checkout URL.
2. Stripe redirects to `/success?session_id=…` (license shown live as soon as the webhook fires).
3. `POST /api/webhook` (Stripe) handler verifies signature, generates `WT-XXXX-XXXX-XXXX-XXXX`, inserts row, emails the customer.
4. Customer opens the Windows app, pastes the key.
5. App calls `POST /api/license/activate { key, deviceId, deviceName }` — server binds the device fingerprint, returns a 7-day JWT.
6. App calls `POST /api/license/verify { key, deviceId }` weekly — extends the JWT or fails closed.
7. To move device: app calls `/activate` with `force: true` → server reassigns + emits `reassign` event.

Refunds via Stripe trigger `charge.refunded` → license set to `refunded`, device unbound automatically.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/success` | Post-purchase license reveal |
| `/account` | Email-based license lookup |
| `/download` | Download links |
| `/admin` (auth) | Sales + license dashboard |
| `/api/checkout` | POST — create Stripe Checkout session |
| `/api/webhook` | POST — Stripe webhook receiver |
| `/api/license/activate` | POST — bind license to device |
| `/api/license/verify` | POST — verify + refresh device token |
| `/api/license/deactivate` | POST — unbind device |
| `/api/license/status` | POST — list licenses by email |
| `/api/admin/login`, `/logout` | Admin session |

## Database tables

- `licenses` — key, email, stripe ids, amount, status, active_device_id
- `device_events` — activate / verify / reassign / deactivate audit trail
- `stripe_events` — raw event log for replay/debug
