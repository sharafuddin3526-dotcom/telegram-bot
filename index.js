import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";
import fs from "fs";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   CONFIG
========================= */

const ADMIN_ID = 8136997138;
const METHOD_CHANNEL = "@Global_Method_Channel";
const GROUP_ID = "-1003527248014";
const DB_FILE = "./db.json";

/* =========================
   DB
========================= */

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ banned: [], users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function isBanned(id) {
  return loadDB().banned.includes(String(id));
}

/* =========================
   JOIN CHECK
========================= */

async function isJoined(ctx) {
  try {
    const res = await ctx.telegram.getChatMember(METHOD_CHANNEL, ctx.from.id);
    return ["member", "administrator", "creator"].includes(res.status);
  } catch {
    return false;
  }
}

/* =========================
   UI
========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" },
          { text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }
        ],
        [{ text: "🔄 Check Joined", callback_data: "check_join" }]
      ]
    }
  };
}

function panelUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Copy Password", callback_data: "pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  };
}

function randomButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }],
        [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }]
      ]
    }
  };
}

/* =========================
   STATE
========================= */

const supportPending = {};
const adminReply = {};

/* =========================
   FIXED MIDDLEWARE
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();

  const id = ctx.from.id;
  const text = ctx.message?.text || "";

  if (id === ADMIN_ID) return next();
  if (isBanned(id)) return ctx.reply("⛔ Blocked");

  // IMPORTANT FIX: allow start ALWAYS
  if (text.startsWith("/start")) return next();

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(
      "⚠️ Join required channels first 🚫",
      joinUI()
    );
  }

  return next();
});

/* =========================
   START (FIXED 100%)
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const id = String(ctx.from.id);

  const joined = await isJoined(ctx);

  // ❌ NOT JOINED
  if (!joined) {
    return ctx.reply(
      "⚠️ Please join required channels first 🚀",
      joinUI()
    );
  }

  // FIRST TIME USER
  if (!db.users[id]) {
    db.users[id] = { joined: true };
    saveDB(db);

    return ctx.reply(`🎉 Congratulations! 🎉

🌸 Welcome to Bot!

📌 You can use:
🔹 /panel
🔹 /help

🇧🇩 বাংলা:
যেকোনো সাহায্য লাগলে /help লিখুন

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
  }

  // RETURN USER
  return ctx.reply(`🌸 Bot Started Successfully 🚀

👋 Welcome Back!

📌 Features:
🔹 /panel
🔹 /help
🔹 Support system active

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
});

/* =========================
   CHECK JOIN
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ Not joined", { show_alert: true });

  return ctx.editMessageText(`🌸 Bot Started Successfully 🚀

👉 Please /start again to unlock all features`);
});

/* =========================
   PANEL (FIXED BUTTONS)
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", panelUI());
});

bot.action("gmail", (ctx) => ctx.reply("📧 Gmail:\n\nmariyaakter1028@gmail.com"));
bot.action("pass", (ctx) => ctx.reply("🔐 Password:\n\nOnetimeuse"));

/* =========================
   HELP
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU 📌

🔹 /panel → Get Panel
🔹 Contact support below`);
});

/* =========================
   SUPPORT
========================= */

bot.action("contact_support", (ctx) => {
  supportPending[ctx.from.id] = true;
  ctx.reply("📩 Write your message now");
});

/* =========================
   ADMIN REPLY
========================= */

bot.action(/reply_(\d+)/, (ctx) => {
  adminReply[ADMIN_ID] = ctx.match[1];
  ctx.reply("✍️ Reply now");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text;

  if (isBanned(id)) return ctx.reply("⛔ Blocked");

  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    await ctx.telegram.sendMessage(adminReply[ADMIN_ID], `💬 Admin:\n${text}`);
    adminReply[ADMIN_ID] = null;
    return ctx.reply("Sent");
  }

  if (supportPending[id]) {
    supportPending[id] = false;

    return ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 SUPPORT\n\n👤 ${ctx.from.first_name}\n\n💬 ${text}`
    );
  }
});

/* =========================
   RANDOM MESSAGE (FIXED BUTTONS)
========================= */

const randomMessages = [
  "🌟 Stay strong 💪",
  "🚀 Keep grinding 🔥",
  "💡 Smart wins 🧠",
  "🌸 Stay positive 😊",
  "⚡ System active 🚀",
  "🔥 Hustle hard 💎",
  "📈 Growth 📊",
  "💬 Keep learning 💰",
  "🌍 Global 🌐",
  "🧠 Upgrade 📚",
  "💎 Success loading...",
  "🚀 Never quit 🔥",
  "🌸 Good vibes ✨",
  "⚙️ Running 🤖",
  "📢 Stay tuned 🔔",
  "💪 Work hard 🔥",
  "📌 Focus 🚀",
  "✨ Future 💎",
  "🌍 Journey 🚀",
  "📊 Money 💰"
];

setInterval(async () => {
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  const sent = await bot.telegram.sendMessage(
    GROUP_ID,
    `📢 RANDOM SMS\n\n${msg}`,
    randomButtons()
  );

  setTimeout(() => {
    bot.telegram.deleteMessage(GROUP_ID, sent.message_id).catch(() => {});
  }, 600000);

}, 120000);

/* ========================= */

bot.launch();
console.log("Bot Running...");
