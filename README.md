This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway

Production is hosted on [Railway](https://railway.app). Build/start commands and the
healthcheck path are pinned in `railway.json`; the full list of required environment
variables is in `.env.example`.

### One-time setup

1. **Create the service** — New Project → Deploy from GitHub repo → select this repo.
   Railway auto-detects Next.js (Nixpacks) and reads `railway.json` for build/start.
2. **Environment variables** — In the service's **Variables** tab, add every var from
   `.env.example` with real values. (Copy the block from `.env.example` as a starting point.)
3. **Deploy** — Railway builds and starts on `npm run start`, binding to the injected `$PORT`.
   Note the generated `*.up.railway.app` URL.
4. **Custom domain** — Settings → Networking → Custom Domain → add `eryxhardware.com`,
   then create the CNAME it shows at your DNS provider.

### External services to repoint at the new domain

These live outside this repo and must be updated manually after the domain is live:

- **Supabase** → Authentication → URL Configuration: set **Site URL** to
  `https://eryxhardware.com` and add redirect URLs `https://eryxhardware.com/auth/callback`
  and `https://eryxhardware.com/reset-password`.
- **Google Cloud Console** (OAuth client): add `https://eryxhardware.com/auth/callback`
  to Authorized redirect URIs.
- **Razorpay** dashboard: point the webhook at
  `https://eryxhardware.com/api/webhooks/razorpay` (same `RAZORPAY_WEBHOOK_SECRET`).

The order-release sweep runs in Supabase **pg_cron**, so no scheduler needs configuring
on Railway.
