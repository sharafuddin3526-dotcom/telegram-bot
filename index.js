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
   SYSTEM
========================= */

const pendingReply = {};

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
   GLOBAL MIDDLEWARE
========================= */

async function checkAccess(ctx, next) {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.reply(
      "⚠️ Access Denied 🚫\n\nYou must join required channels 📢\n\n👉 Join first then click button 🔄",
      joinUI()
    );
  }

  return next();
}

bot.use(checkAccess);

/* =========================
   START
========================= */

bot.start(async (ctx) => {
  return ctx.reply(`🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 Commands:
🔹 /panel → Panel
🔹 /help → Help

🚀 Enjoy using bot`);
});

/* =========================
   CHECK JOIN
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) return ctx.answerCbQuery("❌ NOT JOINED");

  return ctx.editMessageText(`🎉 VERIFIED SUCCESSFUL 🚀

🌸 Access Granted 💎`);
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "copy_email" }],
        [{ text: "🔐 Copy Password", callback_data: "copy_pass" }],
        [{ text: "🌐 Panel Login", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }]
      ]
    }
  });
});

bot.action("copy_email", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("📧 Gmail:\n\nmariyaakter1028@gmail.com");
});

bot.action("copy_pass", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("🔐 Password:\n\nOnetimeuse");
});

/* =========================
   HELP SYSTEM
========================= */

bot.command("help", async (ctx) => {
  const user = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `📩 HELP REQUEST

👤 User: ${user}
🆔 ID: ${ctx.from.id}

🇧🇩 বাংলা:
একজন ইউজার সাহায্য চেয়েছে।

🇬🇧 English:
A user requested help via /help command.`
  );

  return ctx.reply(`🆘 Help request sent

🇧🇩 Admin আপনার সাথে যোগাযোগ করবে
🇬🇧 Admin will contact you soon`);
});

/* =========================
   BOARDCHAT
========================= */

bot.command("boardchat", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 ACCESS DENIED 🚫");

  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("❌ /boardchat message");

  await bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);
  ctx.reply("✅ Sent");
});

/* =========================
   BLOCK / UNBLOCK
========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 ACCESS DENIED 🚫");

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();
  db.banned.push(String(id));
  saveDB(db);

  ctx.reply(`⛔ Blocked ${id}`);
});

bot.command("unblock", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 ACCESS DENIED 🚫");

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();
  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply(`✅ Unblocked ${id}`);
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  if (isBanned(id)) return ctx.reply("⛔ Blocked");

  const text = ctx.message.text;

  if (id === ADMIN_ID && pendingReply[ADMIN_ID]) {
    const userId = pendingReply[ADMIN_ID];
    await ctx.telegram.sendMessage(userId, `💬 Reply:\n\n${text}`);
    pendingReply[ADMIN_ID] = null;
    return ctx.reply("✅ Sent");
  }

  const user = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `📩 MESSAGE

👤 ${user}
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

  ctx.reply("📨 Sent to admin");
});

/* =========================
   RANDOM MESSAGE
========================= */

const randomMessages = [
  "🌟 Stay strong, success is near 💪",
  "🚀 Keep grinding, don’t stop 🔥",
  "💡 Smart work always wins 🧠",
  "🌸 Stay positive, stay focused 😊",
  "⚡ System active 🚀",
  "📈 Growth is loading...",
  "💎 Small steps = Big success",
  "🔥 Never give up",
  "🌍 Global system connected",
  "🧠 Upgrade your mindset daily"
];

setInterval(async () => {
  try {
    const msg =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    const sent = await bot.telegram.sendMessage(
      GROUP_ID,
      `📢 RANDOM SMS\n\n${msg}`
    );

    setTimeout(async () => {
      try {
        await bot.telegram.deleteMessage(GROUP_ID, sent.message_id);
      } catch {}
    }, 420000);
  } catch {}
}, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
