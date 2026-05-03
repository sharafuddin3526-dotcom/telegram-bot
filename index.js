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
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ banned: [], users: {} }, null, 2)
    );
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
          {
            text: "⚙️ Global Channel",
            url: "https://t.me/Global_Method_Channel",
          },
          {
            text: "📢 Main Channel",
            url: "https://t.me/+75BQ2Qw9UZI4OTM1",
          },
        ],
        [{ text: "✅ Check Joined", callback_data: "check_join" }],
      ],
    },
  };
}

/* =========================
   SUPPORT UI
========================= */

function supportUI() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📩 Contact Support", callback_data: "contact_support" }],
      ],
    },
  };
}

/* =========================
   RANDOM BUTTON UI
========================= */

function randomButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📢 Main Channel",
            url: "https://t.me/+75BQ2Qw9UZI4OTM1",
          },
        ],
        [
          {
            text: "⚙️ Global Channel",
            url: "https://t.me/Global_Method_Channel",
          },
        ],
      ],
    },
  };
}

/* =========================
   SUPPORT REPLY SYSTEM
========================= */

const supportPending = {};

/* =========================
   GLOBAL MIDDLEWARE (FIXED)
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();

  const userId = ctx.from.id;

  // Admin always allowed
  if (userId === ADMIN_ID) return next();

  // banned check
  if (isBanned(userId)) {
    return ctx.reply("⛔ You are blocked.");
  }

  // Get message text safely
  const text = ctx.message?.text || "";

  // Allow /start always
  if (text.startsWith("/start")) {
    return next();
  }

  // Join check for all other commands/messages
  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply(
      "⚠️ Access Denied 🚫\n\nYou must join required channels before using this bot 📢\n\n👉 Join now and click Check Joined ✅",
      joinUI()
    );
  }

  return next();
});

/* =========================
   START COMMAND (100% FIXED)
========================= */

bot.command("start", async (ctx) => {
  const db = loadDB();
  const userId = String(ctx.from.id);

  if (!db.users[userId]) {
    db.users[userId] = { joined: false };
    saveDB(db);
  }

  const joined = await isJoined(ctx);

  // If not joined
  if (!joined) {
    return ctx.reply(
      "⚠️ Please join required channels first 🚀\n\n📢 Join then click Check Joined ✅",
      joinUI()
    );
  }

  // If already verified before
  if (db.users[userId].joined === true) {
    return ctx.reply(`🌸 Bot Started Successfully 🚀

✅ Welcome Back!

━━━━━━━━━━━━━━━
🎉 Congratulations!
You can now use this bot without any restriction ✅

📌 Available Features:
🔹 /panel → Get Orange Carrier Panel Access 🍊
🔹 /help → Support System 📩
🔹 Auto Random Updates in Group ⚡

━━━━━━━━━━━━━━━
🇧🇩 বাংলা:
আপনি এখন বটটি সম্পূর্ণভাবে ব্যবহার করতে পারবেন ✅

📌 যদি কোনো সাহায্য প্রয়োজন হয় তাহলে /help command send করুন

━━━━━━━━━━━━━━━
🌐 My Personal Website:
👉 https://mdshahavuddinm904.github.io/Smart-Method-Owner/ 🌍✨

📌 এমন বট বানাতে চাইলে অবশ্যই আমাদের Support এ মেসেজ দিবেন 📩🔥`);
  }

  // First time verified after joining
  db.users[userId].joined = true;
  saveDB(db);

  return ctx.reply(`🎉 Congratulations! 🎉

✅ আপনি এখন বটটি ব্যবহার করতে পারবেন!

📌 যদি কোনো সাহায্য প্রয়োজন হয় তাহলে /help command send করুন

🔹 /panel → To get Orange Carrier Panel Access 🚀

🌐 Website:
👉 https://mdshahavuddinm904.github.io/Smart-Method-Owner/ 🌍✨`);
});

/* =========================
   CHECK JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ You have not joined yet!", { show_alert: true });
  }

  await ctx.editMessageText(
    "🌸 Bot Started Successfully 🚀\n\nPlease /start again to unlock all feature"
  );
});

/* =========================
   HELP COMMAND
========================= */

bot.command("help", (ctx) => {
  ctx.reply(
    `📌 HELP MENU 📌

🔹 Free Panel লাগলে /panel command send করুন
🔹 Support লাগলে নিচের বাটনে ক্লিক করুন

⚡ Smart Method System Active 🚀`,
    supportUI()
  );
});

/* =========================
   CONTACT SUPPORT BUTTON
========================= */

bot.action("contact_support", async (ctx) => {
  await ctx.answerCbQuery();
  supportPending[ctx.from.id] = true;

  return ctx.reply(`📩 Support System Activated!

✍️ এখন আপনার মেসেজ লিখুন
আপনার মেসেজ Admin এর কাছে চলে যাবে ✅`);
});

/* =========================
   PANEL COMMAND
========================= */

bot.command("panel", (ctx) => {
  ctx.reply("🍊 Orange Carrier Panel 🍊", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Copy Gmail", callback_data: "send_email" }],
        [{ text: "🔐 Copy Password", callback_data: "send_pass" }],
        [{ text: "🌐 Open Panel", url: "https://www.orangecarrier.com" }],
        [{ text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }],
      ],
    },
  });
});

/* =========================
   PANEL BUTTON ACTIONS
========================= */

bot.action("send_email", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("📧 Gmail:\n\nMariyaakter1028@gmail.com");
});

bot.action("send_pass", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("🔐 Password:\n\nOnetimeuse");
});

/* =========================
   ADMIN ONLY COMMANDS
========================= */

const adminOnly = (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    ctx.reply("❌ This command is only for Admin.");
    return false;
  }
  return true;
};

bot.command("block", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("Usage: /block <user_id>");

  const db = loadDB();
  if (!db.banned.includes(id)) db.banned.push(id);
  saveDB(db);

  ctx.reply(`⛔ User ${id} blocked.`);
});

bot.command("unblock", (ctx) => {
  if (!adminOnly(ctx)) return;

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("Usage: /unblock <user_id>");

  const db = loadDB();
  db.banned = db.banned.filter((u) => u !== id);
  saveDB(db);

  ctx.reply(`✅ User ${id} unblocked.`);
});

bot.command("boardchat", (ctx) => {
  if (!adminOnly(ctx)) return;

  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /boardchat <message>");

  bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);
  ctx.reply("✅ Sent to group.");
});

/* =========================
   ADMIN REPLY BUTTON SYSTEM
========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery("❌ Not allowed");

  const userId = ctx.match[1];
  supportPending[ADMIN_ID] = userId;

  await ctx.answerCbQuery();
  return ctx.reply("✍️ Reply message লিখুন এখন...");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const text = ctx.message.text;

  if (isBanned(id)) return ctx.reply("⛔ You are blocked.");

  // Admin reply mode
  if (id === ADMIN_ID && supportPending[ADMIN_ID]) {
    const userId = supportPending[ADMIN_ID];

    await ctx.telegram.sendMessage(userId, `💬 Admin Reply:\n\n${text}`);

    supportPending[ADMIN_ID] = null;
    return ctx.reply("✅ Reply sent to user.");
  }

  // Support system user message
  if (supportPending[id]) {
    supportPending[id] = false;

    const user = ctx.from.username
      ? `@${ctx.from.username}`
      : ctx.from.first_name;

    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `📩 SUPPORT MESSAGE\n\n👤 ${user}\n🆔 ${id}\n\n💬 ${text}`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "💬 Reply", callback_data: `reply_${id}` }]],
        },
      }
    );

    return ctx.reply("✅ Your message has been sent to Admin. Wait for reply 📩");
  }
});

/* =========================
   RANDOM MESSAGE (AUTO DELETE + BUTTONS)
========================= */

const randomMessages = [
  "🌟 Stay strong, success is near 💪",
  "🚀 Keep grinding, don’t stop 🔥",
  "💡 Smart work always wins 🧠",
  "🌸 Stay positive, stay focused 😊",
  "⚡ System is active 🚀",
  "🔥 Hustle hard, shine bright 💎",
  "📈 Your growth matters every day 📊",
  "💬 Keep learning, keep earning 💰",
  "🌍 Connected with global system 🌐",
  "🧠 Upgrade your mindset daily 📚",
  "💎 Small steps lead to big success 🏆",
  "🚀 Never quit, just upgrade 🔥",
  "🌸 Good vibes only ✨",
  "⚙️ Smart system running smoothly 🤖",
  "📢 Stay tuned for updates 🔔",
  "💪 Hard work beats luck every time 🔥",
  "📌 Stay consistent, stay unstoppable 🚀",
  "✨ Your future is loading... keep going 💎",
  "🌍 Success is a journey not destination 🚀",
  "📊 Focus + Discipline = Money 💰",
];

setInterval(async () => {
  try {
    const msg =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    const sent = await bot.telegram.sendMessage(
      GROUP_ID,
      `📢 RANDOM SMS\n\n${msg}`,
      randomButtons()
    );

    // Auto delete after 10 minutes
    setTimeout(() => {
      bot.telegram.deleteMessage(GROUP_ID, sent.message_id).catch(() => {});
    }, 600000);
  } catch {}
}, 120000);

/* ========================= */

bot.launch();
console.log("✅ Bot running...");
