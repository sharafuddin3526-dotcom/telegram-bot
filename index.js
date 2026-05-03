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
🔹 /panel → View panel
🔹 /help → Help menu

⚠️ Admin Commands:
❌ /block
❌ /unblock
❌ /boardchat
❌ /alluser

🚀 Enjoy using the bot`;

/* ================= STATES ================= */

const boardchatState = {};

/* ================= MIDDLEWARE ================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return;

  const id = ctx.from.id;
  const text = ctx.message?.text;

  if (id === ADMIN_ID || text?.startsWith("/start")) return next();

  const db = loadDB();
  if (db.banned.includes(String(id))) {
    return ctx.reply("⛔ You are blocked");
  }

  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply("⚠️ Join channels first", joinUI());
  }

  return next();
});

/* ================= START ================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const id = String(ctx.from.id);

  if (!db.users[id]) {
    db.users[id] = {
      username: ctx.from.username || "NoUsername"
    };
    saveDB(db);
  }

  return ctx.reply(START_MSG);
});

/* ================= HELP ================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support / Help System Available

🇧🇩 সাহায্যের জন্য নিচের বাটন ব্যবহার করুন`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🆘 Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

/* ================= PANEL ================= */

bot.command("panel", (ctx) => {
  ctx.reply("📊 Panel Access:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Password", callback_data: "pass" }],
        [{ text: "🌐 Login Panel", url: "https://www.orangecarrier.com/" }],
        [{ text: "👤 Support ID", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

bot.action("gmail", (ctx) => {
  ctx.reply("📧 Gmail: Mariyaakter1028@gmail.com");
});

bot.action("pass", (ctx) => {
  ctx.reply("🔐 Password: Onetimeuse");
});

/* ================= BLOCK ================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("⚠️ Give user ID");

  const db = loadDB();
  db.banned.push(String(id));
  saveDB(db);

  ctx.reply("✅ Block successful");
});

/* ================= UNBLOCK ================= */

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("⚠️ Give user ID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply("✅ Unblock successful");
});

/* ================= BOARDCHAT ================= */

bot.command("boardchat", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  boardchatState[ADMIN_ID] = true;
  ctx.reply("👉 Please write what you want to send");
});

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (boardchatState[ADMIN_ID] && id === ADMIN_ID) {
    const msg = ctx.message.text;
    boardchatState[ADMIN_ID] = false;

    const db = loadDB();

    // group
    await bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);

    // users
    for (let userId of Object.keys(db.users)) {
      try {
        await bot.telegram.sendMessage(userId, `📢 ${msg}`);
      } catch {}
    }

    return ctx.reply("📩 Message sent to group & users successfully");
  }
});

/* ================= ALL USER ================= */

bot.command("alluser", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const db = loadDB();
  const users = Object.entries(db.users);

  let text = `👥 Total Users: ${users.length}\n\n`;

  users.forEach((u, i) => {
    text += `${i + 1}. ${u[1].username} (${u[0]})\n`;
  });

  ctx.reply(text);
});

/* ================= BOT START ================= */

bot.launch();
console.log("✅ BOT RUNNING");
