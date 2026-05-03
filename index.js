import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";
import fs from "fs";

const bot = new Telegraf(BOT_TOKEN);

/* =========================
   CONFIG
========================= */

const ADMIN_ID = 8136997138;
const METHOD_CHANNEL = "@Global_Method_Channel";
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
   JOIN UI
========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }],
        [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }],
        [{ text: "✅ Joined", callback_data: "check_join" }]
      ]
    }
  };
}

/* =========================
   SUPPORT + ADMIN SYSTEM
========================= */

const support = {};
const adminReply = {};

/* =========================
   MIDDLEWARE
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return;

  const id = ctx.from.id;

  if (id === ADMIN_ID) return next();
  if (isBanned(id)) return ctx.reply("⛔ You are blocked");

  const text = ctx.message?.text;

  if (text?.startsWith("/start")) return next();

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(
      "⚠️ Please join our channels first to use this bot 🚀",
      joinUI()
    );
  }

  return next();
});

/* =========================
   START
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const id = String(ctx.from.id);

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(
      "⚠️ Please join our channels first to use this bot 🚀",
      joinUI()
    );
  }

  if (!db.users[id]) {
    db.users[id] = { started: true };
    saveDB(db);

    return ctx.reply(`🎉 Congratulations!

🇧🇩 আপনি এখন এই বট ব্যবহার করতে পারবেন।

🇬🇧 You can now use this bot freely.

📌 If you need help, type /help

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
  }
});

/* =========================
   JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });

  return ctx.editMessageText(`🎉 Congratulations!

🇧🇩 আপনি এখন এই বট ব্যবহার করতে পারবেন।

🇬🇧 You can now use this bot freely.

📌 If you need help, type /help

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
});

/* =========================
   PANEL (FIXED SUPPORT LINK)
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Copy Password", callback_data: "pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

bot.action("gmail", (ctx) => ctx.reply("📧 Gmail: mariyaakter1028@gmail.com"));
bot.action("pass", (ctx) => ctx.reply("🔐 Password: Onetimeuse"));

/* =========================
   HELP
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support button নিচে

🇧🇩 সাহায্যের জন্য Support এ ক্লিক করুন`);
});

/* =========================
   ADMIN ONLY CHECK
========================= */

function adminOnly(ctx) {
  if (ctx.from.id !== ADMIN_ID) {
    ctx.reply("🚫 Permission denied — Only admin can use this command.");
    return false;
  }
  return true;
}

/* =========================
   BLOCK / UNBLOCK / BOARDCHAT (FIXED)
========================= */

bot.command("block", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned.push(String(id));
  saveDB(db);

  ctx.reply(`⛔ User blocked: ${id}`);
});

bot.command("unblock", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply(`✅ User unblocked: ${id}`);
});

bot.command("boardchat", async (ctx) => {
  if (!adminOnly(ctx)) return;

  const msg = ctx.message.text.split(" ").slice(1).join(" ");

  await bot.telegram.sendMessage("-1003527248014", `📢 ${msg}`);

  ctx.reply("📩 Message sent to group & users successfully 🚀");
});

/* =========================
   SUPPORT SYSTEM
========================= */

bot.action("support", (ctx) => {
  support[ctx.from.id] = true;
  ctx.reply("✍️ Send your message to admin 📩");
});

/* =========================
   ADMIN REPLY
========================= */

bot.action(/reply_(\d+)/, (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const userId = ctx.match[1];
  adminReply[ADMIN_ID] = userId;

  ctx.reply("💬 Type your reply now...");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (isBanned(id)) return;

  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    await ctx.telegram.sendMessage(adminReply[ADMIN_ID], `💬 Admin Reply:\n\n${ctx.message.text}`);
    adminReply[ADMIN_ID] = null;
    return;
  }

  if (support[id]) {
    support[id] = false;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 SUPPORT MESSAGE

👤 ${ctx.from.first_name}
🆔 ${id}

💬 ${ctx.message.text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💬 Reply", callback_data: `reply_${id}` }]
          ]
        }
      }
    );

    return ctx.reply("📩 Sent to admin successfully");
  }
});

/* =========================
   RANDOM MESSAGE + BUTTON FIXED
========================= */

const randomMessages = [
  "🌟 Stay strong 💪",
  "🚀 Keep grinding 🔥",
  "💡 Smart work wins 🧠",
  "🌸 Stay positive 😊",
  "⚡ System Active 🚀",
  "💎 Success loading...",
  "📈 Growth mindset",
  "🔥 Never give up",
  "🌍 Global system active",
  "🧠 Think smart"
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
      "-1003527248014",
      `📢 RANDOM SMS\n\n${msg}`,
      randomButtons()
    );

    setTimeout(() => {
      bot.telegram.deleteMessage("-1003527248014", sent.message_id).catch(() => {});
    }, 600000);

  } catch {}
}, 120000);

/* ========================= */

bot.launch();
console.log("✅ BOT RUNNING");
