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
   DATABASE
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
   JOIN UI
========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" },
          { text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }
        ],
        [{ text: "✅ Check Joined", callback_data: "check_join" }]
      ]
    }
  };
}

/* =========================
   SUPPORT UI
========================= */

function supportUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📩 Contact Support", callback_data: "contact_support" }]
      ]
    }
  };
}

/* =========================
   GLOBAL MIDDLEWARE (FIXED)
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();

  const userId = ctx.from.id;

  if (userId === ADMIN_ID) return next();

  if (isBanned(userId)) {
    return ctx.reply("⛔ You are blocked.");
  }

  const text = ctx.message?.text || "";

  // IMPORTANT FIX: /start always allowed
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
   START COMMAND (FIXED)
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const userId = String(ctx.from.id);

  if (!db.users[userId]) {
    db.users[userId] = { joined: false };
    saveDB(db);
  }

  const joined = await isJoined(ctx);

  // ❌ NOT JOINED
  if (!joined) {
    return ctx.reply(
      "⚠️ Please join required channels first 🚀\n\nThen click Check Joined ✅",
      joinUI()
    );
  }

  // ✅ FIRST TIME AFTER JOIN
  if (!db.users[userId].joined) {
    db.users[userId].joined = true;
    saveDB(db);

    return ctx.reply(`🎉 Congratulations! 🎉

🌸 You can now use this bot!

📌 If you need help: /help

🔹 /panel → Orange Carrier Panel 🍊

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
  }

  // ✅ RETURNING USER
  return ctx.reply(`🌸 Bot Started Successfully 🚀

👋 Welcome Back!

📌 You can now use all features:
🔹 /panel
🔹 /help

🇧🇩 বাংলা:
যদি কোনো সাহায্য প্রয়োজন হয় তাহলে /help command send করুন

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
});

/* =========================
   CHECK JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });
  }

  return ctx.editMessageText(`🌸 Bot Started Successfully 🚀

Please /start again to unlock all features ✅`);
});

/* =========================
   HELP
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU 📌

🔹 /panel → Get Panel Access 🍊
🔹 Contact Support below`, supportUI());
});

/* =========================
   SUPPORT SYSTEM
========================= */

const support = {};

bot.action("contact_support", (ctx) => {
  support[ctx.from.id] = true;

  return ctx.reply(`📩 Write your message now
Admin will receive it soon ✅`);
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "email" }],
        [{ text: "🔐 Copy Password", callback_data: "pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }]
      ]
    }
  });
});

bot.action("email", (ctx) => {
  ctx.reply("📧 Gmail:\n\nmariyaakter1028@gmail.com");
});

bot.action("pass", (ctx) => {
  ctx.reply("🔐 Password:\n\nOnetimeuse");
});

/* =========================
   ADMIN SYSTEM
========================= */

const adminOnly = (ctx) => ctx.from.id === ADMIN_ID;

bot.command("block", (ctx) => {
  if (!adminOnly(ctx)) return ctx.reply("❌ Admin only");

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  if (!db.banned.includes(id)) db.banned.push(id);
  saveDB(db);

  ctx.reply(`⛔ Blocked ${id}`);
});

bot.command("unblock", (ctx) => {
  if (!adminOnly(ctx)) return ctx.reply("❌ Admin only");

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned = db.banned.filter(u => u !== id);
  saveDB(db);

  ctx.reply(`✅ Unblocked ${id}`);
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (isBanned(id)) return ctx.reply("⛔ Blocked");

  const text = ctx.message.text;

  if (support[id] && id !== ADMIN_ID) {
    support[id] = false;

    return ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 SUPPORT\n\n👤 ${ctx.from.first_name}\n🆔 ${id}\n\n💬 ${text}`
    );
  }
});

/* =========================
   RANDOM MESSAGE (20 + BUTTONS)
========================= */

const randomMessages = [
  "🌟 Stay strong 💪",
  "🚀 Keep grinding 🔥",
  "💡 Smart work wins 🧠",
  "🌸 Stay positive 😊",
  "⚡ System active 🚀",
  "🔥 Hustle hard 💎",
  "📈 Growth matters 📊",
  "💬 Keep learning 💰",
  "🌍 Global system 🌐",
  "🧠 Upgrade mindset 📚",
  "💎 Success loading...",
  "🚀 Never quit 🔥",
  "🌸 Good vibes ✨",
  "⚙️ System running 🤖",
  "📢 Stay tuned 🔔",
  "💪 Work hard 🔥",
  "📌 Stay focused 🚀",
  "✨ Future bright 💎",
  "🌍 Journey success 🚀",
  "📊 Money mindset 💰"
];

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

setInterval(async () => {
  try {
    const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];

    const sent = await bot.telegram.sendMessage(
      GROUP_ID,
      `📢 RANDOM SMS\n\n${msg}`,
      randomButtons()
    );

    setTimeout(() => {
      bot.telegram.deleteMessage(GROUP_ID, sent.message_id).catch(() => {});
    }, 600000);

  } catch {}
}, 120000);

/* ========================= */

bot.launch();
console.log("Bot Running...");
