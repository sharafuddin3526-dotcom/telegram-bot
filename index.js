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
const GROUP_ID = "-1003527248014";

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
        [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }],
        [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }],
        [{ text: "✅ Joined", callback_data: "check_join" }]
      ]
    }
  };
}

/* =========================
   STATE
========================= */

const support = {};
const adminReply = {};
const boardchatState = {};

/* =========================
   MIDDLEWARE
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return;

  const id = ctx.from.id;
  if (id === ADMIN_ID) return next();
  if (isBanned(id)) return ctx.reply("⛔ You are blocked 🚫");

  const text = ctx.message?.text;
  if (text?.startsWith("/start")) return next();

  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply("⚠️ Please join channels first 🚀", joinUI());
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
    return ctx.reply("⚠️ Please join channels first 🚀", joinUI());
  }

  if (!db.users[id]) {
    db.users[id] = { started: true };
    saveDB(db);

    return ctx.reply(`🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 You can use:
🔹 /start
🔹 /panel
🔹 /help

⚠️ Admin only: /block /unblock /boardchat`);
  }

  ctx.reply("👋 Welcome back!");
});

/* =========================
   JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);
  if (!ok) return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });

  return ctx.editMessageText(`🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 You can use:
🔹 /start
🔹 /panel
🔹 /help

⚠️ Admin only commands protected`);
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply(`🍊 ORANGE PANEL

📧 Gmail: Mariyaakter1028@gmail.com
🔐 Password: Onetimeuse
🌐 Login Panel: https://www.orangecarrier.com

👤 Support: t.me/Smart_Method_Owner`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

/* =========================
   HELP
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support / Help System Available

🇧🇩 সাহায্যের জন্য নিচের বাটন ব্যবহার করুন`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🆘 Help Support", callback_data: "help_support" }]
      ]
    }
  });
});

/* HELP SUPPORT */
bot.action("help_support", (ctx) => {
  support[ctx.from.id] = true;
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
});

/* =========================
   SUPPORT MESSAGE HANDLER
========================= */

bot.action("support", (ctx) => {
  support[ctx.from.id] = true;
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
});

/* =========================
   ADMIN BOARDCHAT
========================= */

bot.command("boardchat", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 Only admin can use this command");

  boardchatState[ADMIN_ID] = true;

  ctx.reply("📢 Please write message for Group & Users");
});

/* =========================
   BLOCK / UNBLOCK
========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 Only admin can use this command");

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned.push(String(id));
  saveDB(db);

  ctx.reply(`🚫 User Blocked Successfully ✅`);
});

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 Only admin can use this command");

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply(`🌸 User Unblocked Successfully 🎉`);
});

/* =========================
   ADMIN REPLY
========================= */

bot.action(/reply_(\d+)/, (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  adminReply[ADMIN_ID] = ctx.match[1];
  ctx.reply("💬 Please type reply message...");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (isBanned(id)) return;

  /* ADMIN REPLY */
  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    await ctx.telegram.sendMessage(adminReply[ADMIN_ID], `💬 Admin Reply:\n\n${ctx.message.text}`);
    adminReply[ADMIN_ID] = null;
    return ctx.reply("✅ Sent to user successfully");
  }

  /* BOARDCHAT */
  if (id === ADMIN_ID && boardchatState[ADMIN_ID]) {
    boardchatState[ADMIN_ID] = false;

    await ctx.telegram.sendMessage(GROUP_ID, `📢 ${ctx.message.text}`);
    return ctx.reply("📩 Message sent to group & users successfully 🚀");
  }

  /* SUPPORT USER */
  if (support[id]) {
    support[id] = false;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 HELP MESSAGE

👤 ${ctx.from.username || ctx.from.first_name}
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

    return ctx.reply("📩 Your message has been sent to Admin successfully");
  }
});

/* =========================
   RANDOM MESSAGE
========================= */

setInterval(async () => {
  const msg = "🌸 Stay active | 🚀 System running | 💎 Smart Method";

  const sent = await bot.telegram.sendMessage(GROUP_ID, `📢 RANDOM SMS\n\n${msg}`);

  setTimeout(() => {
    bot.telegram.deleteMessage(GROUP_ID, sent.message_id).catch(() => {});
  }, 600000);

}, 120000);

/* ========================= */

bot.launch();
console.log("✅ BOT RUNNING");
