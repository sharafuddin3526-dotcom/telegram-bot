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
        [
          { text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }
        ],
        [
          { text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }
        ],
        [
          { text: "✅ Joined", callback_data: "check_join" }
        ]
      ]
    }
  };
}

/* =========================
   SUPPORT
========================= */

const supportPending = {};
const adminReply = {};

/* =========================
   START FIXED (MAIN FIX)
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const userId = String(ctx.from.id);

  const joined = await isJoined(ctx);

  // ❌ NOT JOINED
  if (!joined) {
    return ctx.reply(
      "⚠️ Please join our channels first to use this bot 🚀",
      joinUI()
    );
  }

  // first time user
  if (!db.users[userId]) {
    db.users[userId] = { started: false };
  }

  // first time start after join
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

  // second time start
  ctx.reply(`👋 Welcome back!

📌 Available:
• /panel → Get Panel
• /help → Support

🚀 Smart System Active`);
});

/* =========================
   CHECK JOIN
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ Not Joined", { show_alert: true });
  }

  await ctx.editMessageText(
    "🎉 Congratulations!

🇧🇩 আপনি এখন এই বট ব্যবহার করতে পারবেন।

🇬🇧 You can now use this bot freely.

📌 If you need help, type /help

🌐 Website:
https://mdshahavuddinm904.github.io/Smart-Method-Owner/"
  );
});

/* =========================
   PANEL (FULL BUTTONS)
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Copy Password", callback_data: "pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", callback_data: "support_btn" }]
      ]
    }
  });
});

bot.action("gmail", (ctx) => ctx.reply("📧 Gmail: Mariyaakter1028@gmail.com"));
bot.action("pass", (ctx) => ctx.reply("🔐 Password: 123456"));

/* =========================
   HELP
========================= */

bot.command("help", (ctx) => {
  ctx.reply(
`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Contact Support below

🇧🇩 সাহায্য লাগলে Support এ ক্লিক করুন`
  , {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📩 Support", callback_data: "support_btn" }]
      ]
    }
  });
});

/* =========================
   SUPPORT SYSTEM
========================= */

bot.action("support_btn", (ctx) => {
  supportPending[ctx.from.id] = true;

  ctx.reply("✍️ Write your issue! This will be sent to the admin 📩");
});

/* =========================
   ADMIN REPLY
========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const userId = ctx.match[1];
  adminReply[ADMIN_ID] = userId;

  ctx.reply("👉 Dear Admin, please type your reply message here...");
});

/* =========================
   BLOCK SYSTEM (FIXED)
========================= */

function adminMsg(ctx) {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 You don’t have permission to use this command.");
  }
  return true;
}

bot.command("block", (ctx) => {
  if (!adminMsg(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  if (!db.banned.includes(id)) db.banned.push(id);
  saveDB(db);

  ctx.reply(`⛔ User Blocked Successful: ${id}`);
});

bot.command("unblock", (ctx) => {
  if (!adminMsg(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  const db = loadDB();

  db.banned = db.banned.filter(u => u !== id);
  saveDB(db);

  ctx.reply(`✅ User Unblocked Successful: ${id}`);
});

bot.command("boardchat", (ctx) => {
  if (!adminMsg(ctx)) return;

  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  bot.telegram.sendMessage("-1003527248014", msg);
  ctx.reply("👉Your message has been successfully sent to the group and users📩🚀");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text;

  if (isBanned(id)) return ctx.reply("⛔ Blocked user Successful");

  // admin reply to user
  if (id === ADMIN_ID && adminReply[ADMIN_ID]) {
    const userId = adminReply[ADMIN_ID];
    await ctx.telegram.sendMessage(userId, "💬 Admin: " + text);
    adminReply[ADMIN_ID] = null;
    return;
  }

  // user support message
  if (supportPending[id]) {
    supportPending[id] = false;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 SUPPORT\n\n👤 ${ctx.from.first_name}\n🆔 ${id}\n\n💬 ${text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💬 Reply", callback_data: `reply_${id}` }]
          ]
        }
      }
    );

    return ctx.reply("Your message has been delivered to the admin successfully 📩");
  }
});

/* =========================
   RANDOM SMS + BUTTONS
========================= */

const randomMessages = [
  "🌟 Stay strong 💪",
  "🚀 Keep grinding 🔥",
  "💡 Smart work wins 🧠",
  "🌸 Stay positive 😊",
  "⚡ System Active 🚀",
  "💎 Success loading...",
  "📈 Growth mindset",
  "🔥 Never give up",
  "🌍 Global system active",
  "🧠 Think smart",
  "💰 Money mindset",
  "🚀 Keep pushing",
  "🌸 Positive vibes",
  "⚙️ System online",
  "📢 Update incoming",
  "💪 Hard work wins",
  "✨ Believe yourself",
  "📊 Focus mode",
  "🌟 New journey",
  "🚀 Level up"
];

function randomButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }],
        [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }]
      ]
    }
  };
}

setInterval(async () => {
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  const sent = await bot.telegram.sendMessage(
    "-1003527248014",
    "📢 RANDOM SMS\n\n" + msg,
    randomButtons()
  );

  setTimeout(() => {
    bot.telegram.deleteMessage("-1003527248014", sent.message_id).catch(() => {});
  }, 600000);

}, 120000);

/* ========================= */

bot.launch();
console.log("✅ BOT RUNNING");
