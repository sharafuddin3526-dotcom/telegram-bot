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

🚀 Enjoy using the bot`;

/* ================= STATES ================= */

const supportState = {};
const adminReply = {};
const boardchatState = {};

/* ================= MIDDLEWARE ================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return;

  const id = ctx.from.id;
  const text = ctx.message?.text;

  // Admin bypass
  if (id === ADMIN_ID) return next();

  // Allow /start but enforce join inside handler
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
  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply("⚠️ Please join channels first 🚀", joinUI());
  }

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

/* ================= JOIN BUTTON ================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);
  if (!ok) return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });

  return ctx.editMessageText(START_MSG);
});

/* ================= HELP + SUPPORT ================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support / Help System Available

🇧🇩 সাহায্যের জন্য নিচের বাটন ব্যবহার করুন`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🆘 Support", callback_data: "support_msg" }]
      ]
    }
  });
});

bot.action("support_msg", (ctx) => {
  supportState[ctx.from.id] = true;
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
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

/* ================= ADMIN COMMAND GUARD ================= */

function adminOnly(ctx) {
  if (ctx.from.id !== ADMIN_ID) {
    ctx.reply("🚫 This command is only available for admin users.");
    return false;
  }
  return true;
}

/* ================= BLOCK ================= */

bot.command("block", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("⚠️ Please provide a user ID");

  const db = loadDB();
  if (!db.banned.includes(String(id))) db.banned.push(String(id));
  saveDB(db);

  ctx.reply("✅ Block successful");
});

/* ================= UNBLOCK ================= */

bot.command("unblock", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("⚠️ Please provide a user ID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply("✅ Unblock successful");
});

/* ================= BOARDCHAT ================= */

bot.command("boardchat", (ctx) => {
  if (!adminOnly(ctx)) return;

  boardchatState[ADMIN_ID] = true;
  ctx.reply("👉 Please write what you want to send");
});

/* ================= ALL USER ================= */

bot.command("alluser", (ctx) => {
  if (!adminOnly(ctx)) return;

  const db = loadDB();
  const users = Object.entries(db.users);

  let text = `👥 Total Users: ${users.length}\n\n`;

  users.forEach((u, i) => {
    text += `${i + 1}. ${u[1].username} (${u[0]})\n`;
  });

  ctx.reply(text);
});

/* ================= TEXT HANDLER ================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text;

  // BOARDCHAT
  if (boardchatState[ADMIN_ID] && id === ADMIN_ID) {
    boardchatState[ADMIN_ID] = false;

    const db = loadDB();

    await bot.telegram.sendMessage(GROUP_ID, `📢 ${text}`);

    for (let uid of Object.keys(db.users)) {
      try {
        await bot.telegram.sendMessage(uid, `📢 ${text}`);
      } catch {}
    }

    return ctx.reply("📩 Message sent to group & users successfully");
  }

  // ADMIN REPLY
  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    const target = adminReply[ADMIN_ID];
    adminReply[ADMIN_ID] = null;

    await ctx.telegram.sendMessage(target, `💬 Admin Reply:\n\n${text}`);
    return ctx.reply("📩 Your message sent successfully");
  }

  // USER SUPPORT MESSAGE
  if (supportState[id]) {
    supportState[id] = false;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 USER MESSAGE

👤 ${ctx.from.first_name}
🆔 ${id}

💬 ${text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💬 Reply", callback_data: `reply_${id}` }]
          ]
        }
      }
    );

    return ctx.reply("📩 Your message sent successfully");
  }
});

/* ================= ADMIN REPLY BUTTON ================= */

bot.action(/reply_(\d+)/, (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  adminReply[ADMIN_ID] = ctx.match[1];
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
});

/* ================= BOT START ================= */

bot.launch();
console.log("✅ BOT RUNNING");
