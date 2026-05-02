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
    fs.writeFileSync(DB_FILE, JSON.stringify({ banned: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function isBanned(value) {
  const db = loadDB();
  return db.banned.includes(String(value));
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
   CHECK JOIN
   ========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not joined yet");
  }

  await ctx.editMessageText("✅ Verified! You can use the bot now 🚀");
});

/* =========================
   REPLY SYSTEM
   ========================= */

const pendingReply = {};

/* =========================
   MAIN MESSAGE HANDLER
   ========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  /* ignore commands except reply flow */
  if (text.startsWith("/")) return;

  /* BAN CHECK */
  if (isBanned(userId) || isBanned(ctx.from.username)) {
    return ctx.reply("⛔ You are banned from using this bot.");
  }

  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply("⚠️ Join Method Channel first 🚀", joinUI());
  }

  /* ================= ADMIN REPLY FLOW ================= */

  if (userId === ADMIN_ID && pendingReply[ADMIN_ID]) {
    const targetUser = pendingReply[ADMIN_ID];

    await ctx.telegram.sendMessage(targetUser, `
💬 Admin Reply:

${text}
`);

    pendingReply[ADMIN_ID] = null;

    return ctx.reply("✅ Reply sent successfully");
  }

  const user =
    ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  /* SEND TO ADMIN */
  await ctx.telegram.sendMessage(ADMIN_ID, `
📩 NEW USER MESSAGE

👤 User: ${user}
🆔 ID: ${userId}

💬 Message:
${text}
`, {
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
   REPLY BUTTON
   ========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.answerCbQuery("❌ Not allowed");
  }

  const userId = ctx.match[1];

  pendingReply[ADMIN_ID] = userId;

  await ctx.reply("✍️ এখন reply লিখো...");
});

/* =========================
   PANEL (ALL USERS)
   ========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🖼 This feature coming soon 🚀");
});

/* =========================
   BLOCK SYSTEM
   ========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ This command is only for Admin 👮‍♂️");
  }

  const input = ctx.message.text.split(" ")[1];

  if (!input) return ctx.reply("❌ Use: /block userID or @username");

  const db = loadDB();
  if (!db.banned.includes(input)) {
    db.banned.push(input);
  }
  saveDB(db);

  ctx.reply(`⛔ User ${input} blocked`);
});

/* =========================
   UNBLOCK SYSTEM
   ========================= */

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ This command is only for Admin 👮‍♂️");
  }

  const input = ctx.message.text.split(" ")[1];

  if (!input) return ctx.reply("❌ Use: /unblock userID or @username");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== input);
  saveDB(db);

  ctx.reply(`✅ User ${input} unblocked`);
});

/* =========================
   BOARDCHAT (ADMIN ONLY INFO)
   ========================= */

bot.command("boardchat", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ This command is only for Admin 👮‍♂️");
  }

  ctx.reply("⚠️ Admin command active 👮‍♂️");
});

/* =========================
   WRONG COMMAND WARNING
   ========================= */

bot.on("text", (ctx) => {
  if (ctx.message.text.startsWith("/")) {
    const cmd = ctx.message.text.split(" ")[0];

    const allowed = ["/start", "/panel", "/block", "/unblock", "/boardchat"];

    if (!allowed.includes(cmd)) {
      return ctx.reply("❌ This command is not available or only for Admin 👮‍♂️");
    }
  }
});

/* ========================= */

bot.launch();
console.log("Bot running...");
