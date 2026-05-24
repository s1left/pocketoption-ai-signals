import app from "./app";
import { logger } from "./lib/logger";
import { connectMongo } from "./lib/mongodb";
import { registerWebhookIfConfigured } from "./lib/telegram";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Start server immediately so health checks pass
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  // Attempt to register Telegram webhook when SITE_URL and TELEGRAM_BOT_TOKEN are provided
  registerWebhookIfConfigured().catch((err) => {
    logger.warn({ err }, "Failed to auto-register Telegram webhook");
  });
});

// Connect to MongoDB in background (non-blocking)
connectMongo().catch((err) => {
  logger.error({ err }, "Failed to connect to MongoDB — check Atlas IP whitelist (allow 0.0.0.0/0)");
});
