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
   DB SYSTEM
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

function isBanned(userId) {
  const db = loadDB();
  return db.banned.includes(String(userId));
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

  ctx.reply("🌸 Welcome! You can use the bot now 🚀");
});

/* =========================
   CHECK JOIN BUTTON
   ========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not joined yet");
  }

  await ctx.editMessageText("✅ Verified! You can use the bot now 🚀");
});

/* =========================
   ADMIN REPLY SYSTEM (FIXED)
   ========================= */

const pendingReply = {};

/* =========================
   MESSAGE HANDLER
   ========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  /* ignore commands */
  if (text.startsWith("/")) return;

  /* BAN CHECK */
  if (isBanned(userId)) {
    return ctx.reply("⛔ You are banned from using this bot.");
  }

  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply("⚠️ Join Method Channel first 🚀", joinUI());
  }

  /* ================= ADMIN REPLY MODE ================= */
  if (pendingReply[ADMIN_ID] === userId) {
    await ctx.telegram.sendMessage(userId, `
💬 Admin Reply:

${text}
`);

    pendingReply[ADMIN_ID] = null;
    return ctx.reply("✅ Reply sent to user");
  }

  const user =
    ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  /* SEND TO ADMIN */
  const adminMsg = `
📩 NEW USER MESSAGE

👤 User: ${user}
🆔 ID: ${userId}

💬 Message:
${text}
`;

  await ctx.telegram.sendMessage(ADMIN_ID, adminMsg, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💬 Reply",
            callback_data: `reply_${userId}`
          }
        ]
      ]
    }
  });

  ctx.reply("📨 Sent to admin, please wait...");
});

/* =========================
   REPLY BUTTON FIX
   ========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.answerCbQuery("❌ Not allowed");
  }

  const userId = ctx.match[1];
  pendingReply[ADMIN_ID] = userId;

  await ctx.reply("✍️ এখন reply message লিখো...");
});

/* =========================
   ADMIN COMMANDS
   ========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🚧 Coming soon this feature 🚀");
});

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /block userID");

  const db = loadDB();
  if (!db.banned.includes(id)) db.banned.push(id);
  saveDB(db);

  ctx.reply(`⛔ User ${id} banned`);
});

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /unblock userID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== id);
  saveDB(db);

  ctx.reply(`✅ User ${id} unbanned`);
});

bot.command("boardchat", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.reply("⚠️ This command is admin only 👮‍♂️");
});

/* ========================= */

bot.launch();
console.log("Bot running...");
