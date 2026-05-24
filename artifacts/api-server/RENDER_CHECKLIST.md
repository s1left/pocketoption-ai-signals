# Render Deployment Checklist

Minimal steps to deploy `api-server` on Render and register Telegram webhook.

- Set environment variables in Render service:
  - `PORT` (Render will set this automatically)
  - `TELEGRAM_BOT_TOKEN` — bot token
  - `TELEGRAM_ADMIN_ID` — admin Telegram id (optional but recommended)
  - `SITE_URL` — https://your-domain (used for webhook registration and links)
  - Mongo connection vars (if using MongoDB): `MONGO_URI` or relevant secrets

- Build & start commands (Render service settings):
  - Build Command: `pnpm install && pnpm run build`
  - Start Command: `pnpm run start`

- Webhook registration:
  - If `SITE_URL` and `TELEGRAM_BOT_TOKEN` are set, the server will attempt to auto-register the webhook on startup.
  - Or run manually in the server shell:
    - `pnpm run register-webhook` (requires `TELEGRAM_BOT_TOKEN` and `SITE_URL` env vars)
    - `pnpm run unregister-webhook` to remove

- Security & notes:
  - Ensure `SITE_URL` uses HTTPS (Render provides HTTPS by default).
  - For local testing, use `ngrok` to expose `localhost` and set `SITE_URL` accordingly.
  - `expiresAt` uses milliseconds since epoch; value `-1` means forever.
