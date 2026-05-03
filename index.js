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
   SUPPORT
========================= */

const support = {};
const adminReply = {};

/* =========================
   MIDDLEWARE (FIXED /start ISSUE)
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return;

  const id = ctx.from.id;

  if (id === ADMIN_ID) return next();
  if (isBanned(id)) return ctx.reply("⛔ You are blocked");

  const text = ctx.message?.text;

  // শুধু /start কে bypass
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
   START (FIXED LOGIC)
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const id = String(ctx.from.id);

  const joined = await isJoined(ctx);

  // NOT JOINED
  if (!joined) {
    return ctx.reply(
      "⚠️ Please join our channels first to use this bot 🚀",
      joinUI()
    );
  }

  // FIRST TIME START
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

  // SECOND START (NO RESPONSE AS YOU WANTED)
});

/* =========================
   JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });
  }

  await ctx.editMessageText(`🎉 Congratulations!

🇧🇩 আপনি এখন এই বট ব্যবহার করতে পারবেন।

🇬🇧 You can now use this bot freely.

📌 If you need help, type /help

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Copy Password", callback_data: "pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", callback_data: "support" }]
      ]
    }
  });
});

bot.action("gmail", (ctx) => ctx.reply("📧 Gmail: mariyaakter1028@gmail.com"));
bot.action("pass", (ctx) => ctx.reply("🔐 Password: Onetimeuse"));

/* =========================
   HELP (UNCHANGED MESSAGE)
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support button নিচে

🇧🇩 সাহায্যের জন্য Support এ ক্লিক করুন`);
});

/* =========================
   SUPPORT SYSTEM
========================= */

bot.action("support", (ctx) => {
  support[ctx.from.id] = true;
  ctx.reply("✍️ Write your message to send Admin 📩");
});

/* =========================
   ADMIN REPLY SYSTEM
========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const userId = ctx.match[1];
  adminReply[ADMIN_ID] = userId;

  ctx.reply("💬 Admin reply লিখুন এখন...");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (isBanned(id)) return;

  // admin reply
  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    const userId = adminReply[ADMIN_ID];
    await ctx.telegram.sendMessage(userId, `💬 Admin Reply:\n\n${ctx.message.text}`);
    adminReply[ADMIN_ID] = null;
    return;
  }

  // support message
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

    return ctx.reply("📩 Your message has been sent to admin");
  }
});

bot.launch();
console.log("✅ BOT RUNNING");
