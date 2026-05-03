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

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⚙️ Method Channel", url: "https://t.me/Global_Method_Channel" },
          { text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }
        ],
        [{ text: "🔄 Check Joined", callback_data: "check_join" }]
      ]
    }
  };
}

/* =========================
   GLOBAL MIDDLEWARE
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  const userId = ctx.from.id;

  // Admin এর জন্য কোনো চেক নেই
  if (userId === ADMIN_ID) return next();

  if (isBanned(userId)) {
    return ctx.reply("⛔ You are blocked.");
  }

  const joined = await isJoined(ctx);
  if (!joined) {
    // শুধু /start ছাড়া সব কমান্ডে জয়েন করতে বলবে
    if (ctx.message?.text?.startsWith('/start')) return next();
    
    return ctx.reply("⚠️ You must join our channel first to use commands!", joinUI());
  }

  return next();
});

/* =========================
   START
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const userId = String(ctx.from.id);

  if (!db.users[userId]) db.users[userId] = { joined: false };

  const isUserJoined = await isJoined(ctx);

  if (!isUserJoined) {
    return ctx.reply("⚠️ Please join the required channels first!", joinUI());
  }

  if (!db.users[userId].joined) {
    db.users[userId].joined = true;
    saveDB(db);

    return ctx.reply(`🎉 **Congratulations!**\n\n🌸 You are now verified!\n🚀 Use /panel and /help`);
  }

  ctx.reply(`🌸 Welcome back!\n\nUse /panel or /help`);
});

/* =========================
   CHECK JOIN
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);
  if (!ok) return ctx.answerCbQuery("❌ NOT JOINED", { show_alert: true });

  const db = loadDB();
  const userId = String(ctx.from.id);
  db.users[userId] = { joined: true };
  saveDB(db);

  await ctx.editMessageText(`✅ Successfully Joined!\n\nNow type /start again.`);
});

/* =========================
   USER COMMANDS
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 **Help Menu**\n\n• /panel - Orange Carrier Panel\n• Send any message for admin support`);
});

bot.command("panel", (ctx) => {
  ctx.reply("🍊 **Orange Carrier Panel** 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "send_email" }],
        [{ text: "🔐 Copy Password", callback_data: "send_pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

/* =========================
   ADMIN COMMANDS
========================= */

bot.command(["block", "unblock", "boardchat"], (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ This command is only for Admin.");
  }

  const command = ctx.message.text.split(" ")[0];

  if (command === "/block") {
    const id = ctx.message.text.split(" ")[1];
    if (!id) return ctx.reply("Usage: /block <user_id>");
    
    const db = loadDB();
    if (!db.banned.includes(id)) db.banned.push(id);
    saveDB(db);
    ctx.reply(`⛔ User ${id} has been blocked.`);
  } 
  else if (command === "/unblock") {
    const id = ctx.message.text.split(" ")[1];
    if (!id) return ctx.reply("Usage: /unblock <user_id>");
    
    const db = loadDB();
    db.banned = db.banned.filter(u => u !== id);
    saveDB(db);
    ctx.reply(`✅ User ${id} has been unblocked.`);
  } 
  else if (command === "/boardchat") {
    const msg = ctx.message.text.split(" ").slice(1).join(" ");
    if (!msg) return ctx.reply("Usage: /boardchat <message>");
    
    bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);
    ctx.reply("✅ Message sent to group.");
  }
});

/* =========================
   BUTTON ACTIONS
========================= */

bot.action("send_email", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("📧 Gmail:\n\nmariyaakter1028@gmail.com");
});

bot.action("send_pass", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("🔐 Password:\n\nOnetimeuse");
});

/* =========================
   RANDOM MESSAGE (7 মিনিট)
========================= */

const randomMessages = [
  "🌟 Stay strong 💪", "🚀 Keep grinding 🔥", "💡 Smart work wins 🧠",
  "🌸 Stay positive 😊", "⚡ System is active"
];

setInterval(async () => {
  try {
    const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const sent = await bot.telegram.sendMessage(GROUP_ID, `📢 RANDOM SMS\n\n${msg}`);

    setTimeout(() => {
      bot.telegram.deleteMessage(GROUP_ID, sent.message_id).catch(() => {});
    }, 420000); // 7 minutes
  } catch {}
}, 120000);

/* ========================= */

bot.launch();
console.log("✅ Bot running...");
