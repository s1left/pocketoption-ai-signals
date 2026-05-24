#!/usr/bin/env node
const token = process.env.TELEGRAM_BOT_TOKEN;
const siteUrl = process.env.SITE_URL;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}
if (!siteUrl) {
  console.error('SITE_URL is not set');
  process.exit(1);
}

const webhookUrl = `${siteUrl.replace(/\/$/, '')}/api/telegram/webhook`;

(async () => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    if (!json.ok) process.exit(2);
  } catch (err) {
    console.error('Error registering webhook:', err);
    process.exit(3);
  }
})();
