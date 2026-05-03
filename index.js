import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";
import fs from "fs";

const bot = new Telegraf(BOT_TOKEN);

/* ================= CONFIG ================= */

const ADMIN_ID = 8136997138;
const METHOD_CHANNEL = "@Global_Method_Channel";
const GROUP_ID = "-1003527248014";
const DB_FILE = "./db.json";

/* ================= DB ================= */

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ banned: [], users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ================= JOIN CHECK ================= */

async function isJoined(ctx) {
  try {
    const res = await ctx.telegram.getChatMember(METHOD_CHANNEL, ctx.from.id);
    return ["member", "administrator", "creator"].includes(res.status);
  } catch {
    return false;
  }
}

/* ================= UI ================= */

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

const START_MSG = `🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 You can use the following commands:

🔹 /start → Start the bot
🔹 /panel → View panel (Email/Password/Link)
🔹 /help → Help menu (can be added later)

⚠️ Note:
❌ /block → Admin only
❌ /unblock → Admin only
❌ /boardchat → Admin only

💡 If you face any issue, contact the admin

🚀 Enjoy using the bot`;

/* ================= STATES ================= */

const boardchatState = {};

/* ================= MIDDLEWARE ================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return;

  const id = ctx.from.id;

  if (id === ADMIN_ID) return next();

  const text = ctx.message?.text;

  if (text?.startsWith("/start")) return next();

  const db = loadDB();
  if (db.banned.includes(String(id))) {
    return ctx.reply("⛔ You are blocked from using this bot");
  }

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply("⚠️ Please join channels first 🚀", joinUI());
  }

  return next();
});

/* ================= START ================= */

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
  }

  return ctx.reply(START_MSG);
});

/* ================= JOIN BUTTON FIX ================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });

  return ctx.editMessageText(START_MSG);
});

/* ================= BLOCK ================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("🚫 Only admin");

  const parts = ctx.message.text.split(" ");

  if (!parts[1]) {
    return ctx.reply("⚠️ Please provide a user ID\nExample: /block 123456");
  }

  const id = parts[1];

  const db = loadDB();
  if (!db.banned.includes(String(id))) db.banned.push(String(id));
  saveDB(db);

  ctx.reply("✅ Block successful");
});

/* ================= UNBLOCK ================= */

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("🚫 Only admin");

  const parts = ctx.message.text.split(" ");

  if (!parts[1]) {
    return ctx.reply("⚠️ Please provide a user ID\nExample: /unblock 123456");
  }

  const id = parts[1];

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply("✅ Unblock successful");
});

/* ================= BOARDCHAT ================= */

bot.command("boardchat", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("🚫 Only admin");

  boardchatState[ADMIN_ID] = true;

  ctx.reply("👉 Please write what you want to send");
});

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (boardchatState[ADMIN_ID] && id === ADMIN_ID) {
    const msg = ctx.message.text;
    boardchatState[ADMIN_ID] = false;

    await bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);

    return ctx.reply("📩 Message sent to group & users successfully");
  }
});

/* ================= BOT START ================= */

bot.launch();
console.log("✅ BOT RUNNING");
