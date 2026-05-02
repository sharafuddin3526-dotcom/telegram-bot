import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   ONLY METHOD CHANNEL CHECK
   ========================= */

const METHOD_CHANNEL = "@Global_Method_Channel";

/* =========================
   CHECK JOIN (ONLY METHOD)
   ========================= */

async function isJoined(ctx) {
  try {
    const res = await ctx.telegram.getChatMember(
      METHOD_CHANNEL,
      ctx.chat.id
    );

    return !(res.status === "left" || res.status === "kicked");
  } catch {
    return false;
  }
}

/* =========================
   JOIN UI (MAIN + METHOD BUTTON)
   ========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📢 Main Channel (Visit)",
            url: "https://t.me/+75BQ2Qw9UZI4OTM1M"
          },
          {
            text: "⚙️ Method Channel (Must Join)",
            url: "https://t.me/Global_Method_Channel"
          }
        ],
        [
          {
            text: "🔄 Check Joined",
            callback_data: "check_join"
          }
        ]
      ]
    }
  };
}

/* =========================
   START
   ========================= */

bot.start(async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply(
      "⚠️ You must join Method Channel to use this bot 🚀",
      joinUI()
    );
  }

  ctx.reply("✅ Welcome! You can use the bot now 🚀");
});

/* =========================
   CHECK BUTTON
   ========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Method Channel not joined");
  }

  await ctx.editMessageText("✅ Verified! Welcome 🚀");
});

/* =========================
   BLOCK ALL IF NOT JOINED METHOD
   ========================= */

bot.use(async (ctx, next) => {
  if (!ctx.chat) return;

  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply(
      "⚠️ Please join Method Channel first 🚀",
      joinUI()
    );
  }

  return next();
});

/* ========================= */

bot.launch();
console.log("Bot running...");
