import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   CONFIG
   ========================= */

const ADMIN_ID = 8136997138;
const METHOD_CHANNEL = "@Global_Method_Channel";
const GROUP_ID = "-1003527248014";

/* =========================
   RANDOM MESSAGES (30)
   ========================= */

const randomMessages = [
  "🚀 Stay active with Smart Method!",
  "💡 Learn something new today!",
  "🔥 Smart Support Bot is running smoothly!",
  "📢 Stay connected with updates!",
  "⚡ Auto system working perfectly!",
  "🤖 Smart Method Bot is live 24/7!",
  "🌸 Stay positive and keep learning!",
  "📊 Growth comes with consistency!",
  "💬 Don’t forget to check updates!",
  "🔔 New features coming soon!",
  "💎 Success is built step by step!",
  "🚀 Keep pushing forward!",
  "📈 Your progress matters!",
  "🧠 Improve your skills daily!",
  "🔥 Stay focused and win!",
  "🌐 Connected with Smart System!",
  "📢 Important updates coming!",
  "⚙️ System running smooth!",
  "💡 Think smart, work smart!",
  "🚀 Never give up!",
  "📊 Keep tracking your progress!",
  "💬 Support is always here!",
  "🔐 Secure system active!",
  "🌸 Stay motivated always!",
  "⚡ Fast response system active!",
  "📢 Smart Method family online!",
  "🚀 Daily learning mode ON!",
  "💎 Build your future now!",
  "🧠 Upgrade your mindset!",
  "🔥 You are doing great!"
];

/* =========================
   CHECK JOIN
   ========================= */

async function isJoined(ctx) {
  try {
    const res = await ctx.telegram.getChatMember(
      METHOD_CHANNEL,
      ctx.from.id
    );

    return !(res.status === "left" || res.status === "kicked");
  } catch {
    return false;
  }
}

/* =========================
   JOIN BUTTON UI
   ========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "⚙️ Method Channel",
            url: "https://t.me/Global_Method_Channel"
          },
          {
            text: "📢 Main Channel",
            url: "https://t.me/+75BQ2Qw9UZI4OTM1M"
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
   START COMMAND
   ========================= */

bot.start(async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply(
      "⚠️ Please join required channels first 🚀",
      joinUI()
    );
  }

  const name = ctx.from.first_name || "User";

  ctx.reply(`🌸 Welcome ${name} 🤖

✅ You can now use the bot.
📝 Send your message, admin will reply soon.`);
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
   USER MESSAGE HANDLER
   ========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  // ❌ ignore commands
  if (text.startsWith("/")) return;

  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply("⚠️ Join Method Channel first 🚀", joinUI());
  }

  const user =
    ctx.from.username
      ? `@${ctx.from.username}`
      : ctx.from.first_name;

  ctx.reply("📨 Sent to admin, please wait...");

  const adminMsg = `
📩 NEW USER MESSAGE

👤 User: ${user}
🆔 ID: ${ctx.from.id}

💬 Message:
${text}

━━━━━━━━━━━━━━━
`;

  ctx.telegram.sendMessage(ADMIN_ID, adminMsg);
});

/* =========================
   RANDOM MESSAGE SYSTEM
   ========================= */

async function sendRandom() {
  try {
    const msg =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    await bot.telegram.sendMessage(GROUP_ID, msg);

    console.log("Auto sent:", msg);
  } catch (err) {
    console.log("Random error:", err.message);
  }
}

setInterval(sendRandom, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
