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
   STATES
========================= */

const support = {};
const adminReply = {};

/* =========================
   MIDDLEWARE (JOIN LOCK)
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
    return ctx.reply("⚠️ Please join our channels first 🚀", joinUI());
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
    return ctx.reply("⚠️ Please join our channels first 🚀", joinUI());
  }

  if (!db.users[id]) {
    db.users[id] = { started: true };
    saveDB(db);

    return ctx.reply(`🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 You can use the following commands:

🔹 /start → Start the bot  
🔹 /panel → View panel (Email/Password/Link)  
🔹 /help → Help menu  

⚠️ Note:
❌ /block → Admin only  
❌ /unblock → Admin only  
❌ /boardchat → Admin only  

💡 If you face any issue, contact the admin

🚀 Enjoy using the bot`);
  }

  ctx.reply("👋 Welcome back! 🚀");
});

/* =========================
   JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });

  return ctx.editMessageText(`🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 You can use the following commands:

🔹 /start → Start the bot  
🔹 /panel → View panel (Email/Password/Link)  
🔹 /help → Help menu  

⚠️ Note:
❌ /block → Admin only  
❌ /unblock → Admin only  
❌ /boardchat → Admin only  

💡 If you face any issue, contact the admin

🚀 Enjoy using the bot`);
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 ORANGE PANEL 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Password", callback_data: "pass" }],
        [{ text: "🌐 Login Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "⚙️ Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

bot.action("gmail", (ctx) => ctx.reply("📧 Gmail: Mariyaakter1028@gmail.com"));
bot.action("pass", (ctx) => ctx.reply("🔐 Password: Onetimeuse"));

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

bot.action("help_support", (ctx) => {
  support[ctx.from.id] = true;
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
});

/* =========================
   ADMIN ONLY CHECK
========================= */

function adminOnly(ctx) {
  if (ctx.from.id !== ADMIN_ID) {
    ctx.reply("🚫 Only admin can use this command");
    return false;
  }
  return true;
}

/* =========================
   BLOCK / UNBLOCK
========================= */

bot.command("block", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned.push(String(id));
  saveDB(db);

  ctx.reply("⛔ Block successful");
});

bot.command("unblock", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply("✅ Unblock successful");
});

/* =========================
   BOARDCHAT
========================= */

bot.command("boardchat", async (ctx) => {
  if (!adminOnly(ctx)) return;

  const msg = ctx.message.text.split(" ").slice(1).join(" ");

  await bot.telegram.sendMessage("-1003527248014", msg);

  ctx.reply("📩 Message sent to group & users successfully");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (isBanned(id)) return;

  if (support[id]) {
    support[id] = false;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 HELP MESSAGE

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

    return ctx.reply("📩 Your message has been sent to Admin successfully");
  }

  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    await ctx.telegram.sendMessage(
      adminReply[ADMIN_ID],
      `💬 Admin Reply:\n\n${ctx.message.text}`
    );

    adminReply[ADMIN_ID] = null;
    return;
  }
});

/* =========================
   RANDOM SMS
========================= */

const randomMessages = [
  "🌟 Stay strong 💪",
  "🚀 Keep grinding 🔥",
  "💡 Smart work wins 🧠",
  "🌸 Stay positive 😊",
  "⚡ System Active 🚀"
];

setInterval(async () => {
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  const sent = await bot.telegram.sendMessage(
    "-1003527248014",
    `📢 RANDOM SMS\n\n${msg}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }],
          [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }]
        ]
      }
    }
  );

  setTimeout(() => {
    bot.telegram.deleteMessage("-1003527248014", sent.message_id).catch(() => {});
  }, 600000);

}, 120000);

/* ========================= */

bot.launch();
console.log("✅ BOT RUNNING");
