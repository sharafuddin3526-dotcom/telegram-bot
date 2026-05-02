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
   REPLY SYSTEM
========================= */

const pendingReply = {};

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
    const res = await ctx.telegram.getChatMember(METHOD_CHANNEL, ctx.from.id);
    return !(res.status === "left" || res.status === "kicked");
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
          { text: "⚙️ Method Channel", url: "https://t.me/Global_Method_Channel" },
          { text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }
        ],
        [
          { text: "🔄 Check Joined", callback_data: "check_join" }
        ]
      ]
    }
  };
}

/* =========================
   START
========================= */

bot.start(async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply("⚠️ Please join required channels first 🚀", joinUI());
  }

  ctx.reply("🌸 Bot started. Use /panel /start 🚀");
});

/* =========================
   CHECK JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ Not joined yet");

  await ctx.editMessageText("✅ Verified! You can use the bot 🚀");
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply(`🍊 Orange Carrier Panel 🍊
━━━━━━━━━━━━━━━

✉️ Email ➗
✅ Mariyaakter1028@gmail.com

🔐 Password ➗
↪️ Onetimeuse ✅

🌐 Panel ➗
👉 https://www.orangecarrier.com

🆘 Support ➗
👉 @Smart_Method_Owner

━━━━━━━━━━━━━━━`);
});

/* =========================
   BOARDCHAT (ADMIN)
========================= */

bot.command("boardchat", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("❌ Admin only command");

  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("❌ /boardchat message");

  await bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);
  ctx.reply("✅ Sent to group");
});

/* =========================
   BLOCK
========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("❌ Admin only");

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /block userID");

  const db = loadDB();
  if (!db.banned.includes(String(id))) db.banned.push(String(id));
  saveDB(db);

  ctx.reply(`⛔ Blocked ${id}`);
});

/* =========================
   UNBLOCK
========================= */

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("❌ Admin only");

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /unblock userID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply(`✅ Unblocked ${id}`);
});

/* =========================
   REPLY BUTTON
========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.answerCbQuery("❌ Not allowed");

  const userId = ctx.match[1];
  pendingReply[ADMIN_ID] = userId;

  ctx.reply("✍️ এখন reply লিখো...");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const id = ctx.from.id;

  if (isBanned(id)) return ctx.reply("⛔ Banned user");

  const ok = await isJoined(ctx);
  if (!ok) return ctx.reply("⚠️ Join first", joinUI());

  /* ADMIN REPLY MODE */
  if (id === ADMIN_ID && pendingReply[ADMIN_ID]) {
    const userId = pendingReply[ADMIN_ID];

    await ctx.telegram.sendMessage(userId, `💬 Admin Reply:\n\n${text}`);

    pendingReply[ADMIN_ID] = null;
    return ctx.reply("✅ Sent to user");
  }

  const user = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `📩 MESSAGE\n\n👤 ${user}\n🆔 ${id}\n\n💬 ${text}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💬 Reply", callback_data: `reply_${id}` }]
        ]
      }
    }
  );

  ctx.reply("📨 Sent to admin");
});

/* =========================
   RANDOM GROUP MSG
========================= */

const randomMessages = [
  "🚀 System Active",
  "💡 Learn daily",
  "🔥 Stay focused",
  "⚡ Bot running",
  "🌸 Keep growing"
];

setInterval(async () => {
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  await bot.telegram.sendMessage(GROUP_ID, msg);
}, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
