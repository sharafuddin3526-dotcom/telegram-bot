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
        [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }],
        [{ text: "✅ Joined", callback_data: "check_join" }]
      ]
    }
  };
}

/* =========================
   SUPPORT
========================= */

const support = {};

/* =========================
   START (FULL YOUR TEXT)
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const userId = String(ctx.from.id);

  const joined = await isJoined(ctx);

  if (!joined) {
    return ctx.reply(
      "⚠️ Please join our channels first to use this bot 🚀",
      joinUI()
    );
  }

  if (!db.users[userId]) {
    db.users[userId] = { started: false };
  }

  if (!db.users[userId].started) {
    db.users[userId].started = true;
    saveDB(db);

    return ctx.reply(`🎉 Congratulations!

🇧🇩 আপনি এখন এই বট ব্যবহার করতে পারবেন।

🇬🇧 You can now use this bot freely.

📌 If you need help, type /help

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
  }

  return ctx.reply(`👋 Welcome back!

📌 /panel → Open Panel
📌 /help → Support`);
});

/* =========================
   CHECK JOIN
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });
  }

  await ctx.editMessageText(`🎉 Congratulations!

🇧🇩 আপনি এখন এই বট ব্যবহার করতে পারবেন।

🇬🇧 You can now use this bot freely.

📌 If you need help, type /help

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/`);
});

/* =========================
   PANEL
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Copy Password", callback_data: "pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", callback_data: "support" }]
      ]
    }
  });
});

bot.action("gmail", (ctx) => ctx.reply("📧 Gmail: mariyaakter1028@gmail.com"));
bot.action("pass", (ctx) => ctx.reply("🔐 Password: Onetimeuse"));

/* =========================
   HELP
========================= */

bot.command("help", (ctx) => {
  ctx.reply(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support button নিচে

🇧🇩 সাহায্যের জন্য Support এ ক্লিক করুন`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📩 Support", callback_data: "support" }]
      ]
    }
  });
});

/* =========================
   SUPPORT
========================= */

bot.action("support", (ctx) => {
  support[ctx.from.id] = true;
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text;

  if (isBanned(id)) return ctx.reply("⛔ Blocked");

  if (support[id]) {
    support[id] = false;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 SUPPORT MESSAGE

👤 ${ctx.from.first_name}
🆔 ${id}

💬 ${text}`
    );

    return ctx.reply("📩 Your message has been sent to Admin successfully");
  }
});

/* =========================
   RANDOM SMS (UNCHANGED STYLE)
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

  await bot.telegram.sendMessage(
    "-1003527248014",
    `📢 RANDOM SMS

${msg}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }],
          [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }]
        ]
      }
    }
  );
}, 120000);

/* ========================= */

bot.launch();
console.log("✅ BOT RUNNING");
