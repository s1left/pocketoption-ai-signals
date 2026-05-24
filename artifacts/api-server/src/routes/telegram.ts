import { Router, type IRouter } from "express";
import { User } from "../models/User";

const router: IRouter = Router();

const TELEGRAM_BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"];
const TELEGRAM_ADMIN_ID = process.env["TELEGRAM_ADMIN_ID"];

const DURATION_LABELS: Record<string, string> = {
  "5h": "5 часов",
  "15h": "15 часов",
  "24h": "24 часа",
  "15d": "15 дней",
  "30d": "30 дней",
  "life": "Бессрочно",
};

const DURATION_MS: Record<string, number> = {
  "5h": 5 * 3600000,
  "15h": 15 * 3600000,
  "24h": 24 * 3600000,
  "15d": 15 * 86400000,
  "30d": 30 * 86400000,
  "life": -1,
};

async function tgApi(method: string, body: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

function getAdminKeyboard(userId: string) {
  return {
    inline_keyboard: [
      [
        { text: "5ч", callback_data: `sel:${userId}:5h` },
        { text: "15ч", callback_data: `sel:${userId}:15h` },
        { text: "24ч", callback_data: `sel:${userId}:24h` },
      ],
      [
        { text: "15д", callback_data: `sel:${userId}:15d` },
        { text: "30д", callback_data: `sel:${userId}:30d` },
        { text: "LIFE", callback_data: `sel:${userId}:life` },
      ],
      [{ text: "❌ Отклонить", callback_data: `decline:${userId}` }],
    ],
  };
}

router.post("/telegram/webhook", async (req, res) => {
  const body = req.body;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["host"];
  const siteUrl = `${protocol}://${host}`;

  try {
    if (body.message && body.message.text === "/start") {
      const from = body.message.from;
      const userId = from.id.toString();
      const username = from.username || from.first_name;
      const isAdmin = userId === TELEGRAM_ADMIN_ID;

      let user = await User.findOne({ telegramId: userId });
      if (!user) {
        user = await User.create({
          telegramId: userId,
          username: username,
          hasAccess: isAdmin,
          status: isAdmin ? "active" : "pending",
          createdAt: Date.now(),
        });
      }

      if (isAdmin) {
        await tgApi("sendMessage", {
          chat_id: userId,
          text: `👋 Добро пожаловать, Админ!\n\n<a href="${siteUrl}">Перейти на сайт</a>`,
          parse_mode: "HTML",
        });
      } else {
        await tgApi("sendMessage", {
          chat_id: userId,
          text: "⏳ Ваша заявка отправлена. Ожидайте активации.",
        });

        if (TELEGRAM_ADMIN_ID) {
          await tgApi("sendMessage", {
            chat_id: TELEGRAM_ADMIN_ID,
            text: `🆕 Новый запрос\n👤 ${from.first_name} ${from.last_name || ""}\n🆔 ${userId}\n@${from.username || "n/a"}`,
            reply_markup: getAdminKeyboard(userId),
          });
        }
      }
    } else if (body.callback_query) {
      const cb = body.callback_query;
      const data = cb.data as string;
      const [action, userId, duration] = data.split(":");

      if (action === "sel") {
        await tgApi("editMessageText", {
          chat_id: cb.message.chat.id,
          message_id: cb.message.message_id,
          text: `${cb.message.text}\n\nВыбрано: ${DURATION_LABELS[duration]}`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Подтвердить", callback_data: `approve:${userId}:${duration}` },
                { text: "↩️ Назад", callback_data: `back:${userId}` },
              ],
            ],
          },
        });
      } else if (action === "approve") {
        const ms = DURATION_MS[duration];
        const expiresAt = ms === -1 ? -1 : Date.now() + ms;

        await User.findOneAndUpdate(
          { telegramId: userId },
          { hasAccess: true, status: "active", expiresAt }
        );

        await tgApi("answerCallbackQuery", { callback_query_id: cb.id });
        await tgApi("editMessageText", {
          chat_id: cb.message.chat.id,
          message_id: cb.message.message_id,
          text: `${cb.message.text}\n\n✅ Активировано: ${DURATION_LABELS[duration]}`,
        });

        await tgApi("sendMessage", {
          chat_id: userId,
          text: `✅ Доступ активирован! Срок: ${DURATION_LABELS[duration]}\n\nВойти: ${siteUrl}/login?id=${userId}`,
          reply_markup: {
            inline_keyboard: [[{ text: "Войти", url: `${siteUrl}/login?id=${userId}` }]],
          },
          parse_mode: "HTML",
        });
      } else if (action === "decline") {
        await User.findOneAndUpdate(
          { telegramId: userId },
          { hasAccess: false, status: "blocked" }
        );

        await tgApi("answerCallbackQuery", { callback_query_id: cb.id });
        await tgApi("editMessageText", {
          chat_id: cb.message.chat.id,
          message_id: cb.message.message_id,
          text: `${cb.message.text}\n\n❌ Отклонено`,
        });

        await tgApi("sendMessage", {
          chat_id: userId,
          text: "❌ Ваш запрос отклонён.",
        });
      } else if (action === "back") {
        await tgApi("editMessageText", {
          chat_id: cb.message.chat.id,
          message_id: cb.message.message_id,
          text: cb.message.text.split("\n\nВыбрано:")[0],
          reply_markup: getAdminKeyboard(userId),
        });
      }
    }
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
  }

  res.sendStatus(200);
});

router.get("/telegram/register-webhook", async (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["host"];
  const siteUrl = `${protocol}://${host}`;
  const webhookUrl = `${siteUrl}/api/telegram/webhook`;

  const result = await tgApi("setWebhook", { url: webhookUrl });
  res.json(result);
});

export default router;
