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
   DATABASE (BAN SYSTEM)
   ========================= */

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ banned: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function isBanned(id) {
  const db = loadDB();
  return db.banned.includes(String(id));
}

/* =========================
   JOIN CHECK
   ========================= */

async function isJoined(ctx) {
  try {
    const res = await ctx.telegram.getChatMember(
      METHOD_CHANNEL,
      ctx.from.id
    );

    return !(res.status === "left" || res.status === "kicked");
  } catch {
    return false;
  }
}

/* =========================
   JOIN BUTTON
   ========================= */

function joinUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "⚙️ Method Channel",
            url: "https://t.me/Global_Method_Channel"
          },
          {
            text: "📢 Main Channel",
            url: "https://t.me/+75BQ2Qw9UZI4OTM1M"
          }
        ],
        [
          {
            text: "🔄 Check Joined",
            callback_data: "check_join"
          }
        ]
      ]
    }
  };
}

/* =========================
   SPAM SYSTEM
   ========================= */

const spam = {};

/* =========================
   REPLY SYSTEM
   ========================= */

const pendingReply = {};

/* =========================
   START
   ========================= */

bot.start(async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply("⚠️ Join required channels first 🚀", joinUI());
  }

  ctx.reply("🌸 Welcome! You can use the bot now 🚀");
});

/* =========================
   CHECK JOIN BUTTON
   ========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ Not joined");

  ctx.editMessageText("✅ Verified! Bot unlocked 🚀");
});

/* =========================
   MESSAGE HANDLER
   ========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const id = ctx.from.id;

  /* BAN CHECK */
  if (isBanned(id)) {
    return ctx.reply("⛔ You are banned from this bot.");
  }

  /* SPAM CONTROL */
  spam[id] = (spam[id] || 0) + 1;

  if (spam[id] > 5) {
    return ctx.reply("⛔ Slow down! Too many messages.");
  }

  setTimeout(() => {
    spam[id] = 0;
  }, 10000);

  const ok = await isJoined(ctx);
  if (!ok) return ctx.reply("⚠️ Join Method Channel first 🚀", joinUI());

  /* ================= ADMIN REPLY ================= */

  if (id === ADMIN_ID && pendingReply[ADMIN_ID]) {
    const userId = pendingReply[ADMIN_ID];

    await ctx.telegram.sendMessage(userId, `
💬 Admin Reply:

${text}
`);

    pendingReply[ADMIN_ID] = null;
    return ctx.reply("✅ Sent to user");
  }

  /* ================= SMART AUTO REPLY ================= */

  const lower = text.toLowerCase();

  if (lower.includes("hi") || lower.includes("hello")) {
    return ctx.reply("👋 Hello! How can I help you?");
  }

  if (lower.includes("help")) {
    return ctx.reply("🆘 Write your problem, admin will reply soon.");
  }

  /* ================= SEND TO ADMIN ================= */

  const user = ctx.from.username
    ? `@${ctx.from.username}`
    : ctx.from.first_name;

  await ctx.telegram.sendMessage(ADMIN_ID, `
📩 NEW MESSAGE

👤 ${user}
🆔 ${id}

💬 ${text}
`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💬 Reply",
            callback_data: `reply_${id}`
          }
        ]
      ]
    }
  });

  ctx.reply("📨 Sent to admin");
});

/* =========================
   REPLY BUTTON
   ========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.answerCbQuery("❌ Not allowed");
  }

  const userId = ctx.match[1];

  pendingReply[ADMIN_ID] = userId;

  ctx.reply("✍️ Write your reply...");
});

/* =========================
   PANEL
   ========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🖼 Coming soon this feature 🚀");
});

/* =========================
   BOARDCHAT
   ========================= */

bot.command("boardchat", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Only admin can use this command.");
  }

  ctx.reply("👮 Board system active");
});

/* =========================
   BLOCK
   ========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Only admin can use this command.");
  }

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /block userID");

  const db = loadDB();
  if (!db.banned.includes(id)) db.banned.push(id);
  saveDB(db);

  ctx.reply(`⛔ User ${id} blocked`);
});

/* =========================
   UNBLOCK
   ========================= */

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Only admin can use this command.");
  }

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /unblock userID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== id);
  saveDB(db);

  ctx.reply(`✅ User ${id} unblocked`);
});

/* =========================
   RANDOM GROUP MESSAGE
   ========================= */

const randomMessages = [
  "🚀 Smart Bot Active",
  "💡 Learn daily!",
  "🔥 Stay connected",
  "📢 Updates coming soon",
  "⚡ System running",
  "🌸 Keep learning",
  "💬 Support online",
  "🚀 Never stop"
];

setInterval(async () => {
  try {
    const msg =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    await bot.telegram.sendMessage(GROUP_ID, msg);
  } catch (e) {
    console.log("Random error ignored");
  }
}, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
