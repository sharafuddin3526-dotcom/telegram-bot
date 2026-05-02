import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   METHOD CHANNEL (ONLY THIS REQUIRED)
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
   JOIN BUTTON MESSAGE
   ========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "⚙️ Join Method Channel",
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
      "⚠️ You must join Method Channel first to use this bot 🚀",
      joinUI()
    );
  }

  const name = ctx.from.first_name || "User";

  /* 🇧🇩 BANGLA MESSAGE */
  const bn = `
🌸 স্বাগতম ${name} 🤖

✅ আপনি এখন Smart Support Bot ব্যবহার করতে পারবেন।

📝 আপনার কোনো সমস্যা বা প্রশ্ন থাকলে এখানে লিখে পাঠান।
আমাদের এডমিন খুব দ্রুত রিপ্লাই দিবে ইনশাআল্লাহ।

━━━━━━━━━━━━━━━
❤️ ধন্যবাদ Smart Method Family ব্যবহার করার জন্য
`;

  /* 🇬🇧 ENGLISH MESSAGE */
  const en = `
🌸 Welcome ${name} 🤖

✅ You can now use Smart Support Bot.

📝 If you have any problem or question, just send message here.
Our admin will reply as soon as possible InshaAllah.

━━━━━━━━━━━━━━━
❤️ Thank you for using Smart Method Family
`;

  ctx.reply(bn);
  ctx.reply(en);
});

/* =========================
   CHECK JOIN BUTTON
   ========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not joined yet");
  }

  await ctx.editMessageText("✅ Verified! You can use the bot now 🚀");
});

/* =========================
   USER MESSAGE SYSTEM
   ========================= */

bot.on("text", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply(
      "⚠️ Please join Method Channel first 🚀",
      joinUI()
    );
  }

  const userMsg = ctx.message.text;
  const name =
    ctx.from.username
      ? `@${ctx.from.username}`
      : ctx.from.first_name;

  /* USER CONFIRMATION */
  ctx.reply(
    "📨 Your message has been sent to admin ✅\n⏳ Please wait for reply..."
  );

  /* SEND TO ADMIN */
  const adminMsg = `
📩 NEW USER MESSAGE

👤 User: ${name}
🆔 ID: ${ctx.chat.id}

💬 Message:
${userMsg}

━━━━━━━━━━━━━━━
⏳ Reply ASAP
`;

  ctx.telegram.sendMessage(ctx.chat.id, adminMsg);
});

/* ========================= */

bot.launch();
console.log("Bot running...");
