export async function registerWebhookIfConfigured() {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  const siteUrl = process.env["SITE_URL"];

  if (!token) {
    // nothing to do
    return;
  }

  if (!siteUrl) {
    console.warn("SITE_URL not set — skipping Telegram webhook registration");
    return;
  }

  const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const json = await res.json();
    if (!json || !json.ok) {
      console.warn("Failed to register Telegram webhook:", json);
    } else {
      console.info("Telegram webhook registered:", webhookUrl);
    }
  } catch (err) {
    console.warn("Error registering Telegram webhook:", err);
  }
}

export async function unregisterWebhookIfConfigured() {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      method: "POST",
    });
    const json = await res.json();
    if (!json || !json.ok) {
      console.warn("Failed to unregister Telegram webhook:", json);
    } else {
      console.info("Telegram webhook unregistered");
    }
  } catch (err) {
    console.warn("Error unregistering Telegram webhook:", err);
  }
}
