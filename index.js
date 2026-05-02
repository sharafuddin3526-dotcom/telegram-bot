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
   DATABASE (BAN)
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
          }
        ],
        [
          {
            text: "📢 Main Channel",
            url: "https://t.me/+75BQ2Qw9UZI4OTM1M"
          }
        ]
      ]
    }
  };
}

/* =========================
   START (USER + ADMIN)
   ========================= */

bot.start(async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply("⚠️ Please join required channels first", joinUI());
  }

  ctx.reply("🌸 Bot started. You can use /panel or /start 🚀");
});

/* =========================
   PANEL (USER + ADMIN)
   ========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🖼 Coming soon this feature 🚀");
});

/* =========================
   BOARDCHAT (ADMIN ONLY)
   ========================= */

bot.command("boardchat", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ This command is only for Admin 👮‍♂️");
  }

  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("❌ Use /boardchat message");

  await bot.telegram.sendMessage(GROUP_ID, `📢 ADMIN BROADCAST:\n\n${msg}`);
  ctx.reply("✅ Message sent to group");
});

/* =========================
   BLOCK (ADMIN ONLY)
   ========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Only admin can use this command");
  }

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ Use /block userID");

  const db = loadDB();
  if (!db.banned.includes(id)) db.banned.push(id);
  saveDB(db);

  ctx.reply(`⛔ User ${id} blocked`);
});

/* =========================
   UNBLOCK (ADMIN ONLY)
   ========================= */

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Only admin can use this command");
  }

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ Use /unblock userID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== id);
  saveDB(db);

  ctx.reply(`✅ User ${id} unblocked`);
});

/* =========================
   MAIN MESSAGE HANDLER
   ========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const id = ctx.from.id;

  /* BAN CHECK */
  if (isBanned(id)) {
    return ctx.reply("⛔ You are banned from using this bot.");
  }

  const ok = await isJoined(ctx);
  if (!ok) return ctx.reply("⚠️ Join channel first", joinUI());

  /* IGNORE COMMANDS HERE */
  if (text.startsWith("/block") || text.startsWith("/unblock") || text.startsWith("/boardchat")) {
    return ctx.reply("❌ This command is only for Admin 👮‍♂️");
  }

  const user = ctx.from.username
    ? `@${ctx.from.username}`
    : ctx.from.first_name;

  /* SEND TO ADMIN */
  await ctx.telegram.sendMessage(ADMIN_ID, `
📩 NEW MESSAGE

👤 ${user}
🆔 ${id}

💬 ${text}
`);

  ctx.reply("📨 Sent to admin");
});

/* =========================
   RANDOM GROUP MESSAGE
   ========================= */

const randomMessages = [
  "🚀 System Active",
  "💡 Learn daily",
  "🔥 Stay focused",
  "📢 Update soon",
  "⚡ Bot running",
  "🌸 Keep growing"
];

setInterval(async () => {
  try {
    const msg =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    await bot.telegram.sendMessage(GROUP_ID, msg);
  } catch (e) {
    console.log("random error");
  }
}, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
