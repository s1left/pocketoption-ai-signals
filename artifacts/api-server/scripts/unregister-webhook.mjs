#!/usr/bin/env node
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      method: 'POST',
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    if (!json.ok) process.exit(2);
  } catch (err) {
    console.error('Error unregistering webhook:', err);
    process.exit(3);
  }
})();
