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
  const db = loadDB();
  return db.banned.includes(String(id));
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
          { text: "⚙️ Method Channel", url: "https://t.me/Global_Method_Channel" },
          { text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1M" }
        ],
        [{ text: "🔄 Check Joined", callback_data: "check_join" }]
      ]
    }
  };
}

/* =========================
   GLOBAL MIDDLEWARE (সুরক্ষা)
========================= */

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (ctx.from.id === ADMIN_ID) return next(); // Admin সবসময় allowed

  if (isBanned(ctx.from.id)) {
    return ctx.reply("⛔ You are blocked by admin.");
  }

  const joined = await isJoined(ctx);
  if (!joined) {
    return ctx.reply("⚠️ Access Denied 🚫\n\nYou must join our channel first!", joinUI());
  }

  return next();
});

/* =========================
   START COMMAND
========================= */

bot.start(async (ctx) => {
  const db = loadDB();
  const userId = String(ctx.from.id);

  if (!db.users[userId]) {
    db.users[userId] = { joined: false };
  }

  const alreadyJoined = db.users[userId].joined;

  if (!alreadyJoined) {
    db.users[userId].joined = true;
    saveDB(db);

    return ctx.reply(
`🎉 **Congratulations!** 🎊

🌸 You are now fully verified 💎
🚀 All features unlocked!

📌 Commands:
• /panel → Orange Carrier Panel
• /help  → Help & Support

💡 Enjoy the bot!`
    );
  }

  // Welcome back
  ctx.reply(
`🌸 Bot Started Successfully 🚀

👋 Welcome back, ${ctx.from.first_name}!

📊 /panel → Get Orange Carrier Panel
🆘 /help  → Need any help?`
  );
});

/* =========================
   CHECK JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
    return ctx.answerCbQuery("❌ NOT JOINED! Please join first.", { show_alert: true });
  }

  const db = loadDB();
  const userId = String(ctx.from.id);
  if (!db.users[userId]) db.users[userId] = { joined: false };

  db.users[userId].joined = true;
  saveDB(db);

  await ctx.editMessageText(
`✅ Verification Successful!

🌸 Bot Started Successfully 🚀

Please type /start again to unlock all features 💎`
  );
});

/* =========================
   HELP & PANEL
========================= */

bot.command("help", (ctx) => {
  ctx.reply(
`📌 **Help Menu**

• /start - Restart Bot
• /panel - Orange Carrier Panel
• Just send any message for admin support

Admin will reply as soon as possible.`
  );
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

bot.action("send_email", async (ctx) => {
  await ctx.answerCbQuery("Copied!");
  ctx.reply("📧 Gmail:\n\nmariyaakter1028@gmail.com");
});

bot.action("send_pass", async (ctx) => {
  await ctx.answerCbQuery("Copied!");
  ctx.reply("🔐 Password:\n\nOnetimeuse");
});

/* =========================
   RANDOM MESSAGE (৭ মিনিট পর ডিলিট)
========================= */

const randomMessages = [
  "🌟 Stay strong, success is near 💪",
  "🚀 Keep grinding, don’t stop 🔥",
  "💡 Smart work always wins 🧠",
  "🌸 Stay positive, stay focused 😊",
  "⚡ System is active 🚀",
  "📈 Your growth matters every day",
  "💎 Small steps = big success 🏆",
  "🔥 Never quit, just upgrade",
  "🧠 Upgrade your mindset daily"
];

setInterval(async () => {
  try {
    const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];

    const sent = await bot.telegram.sendMessage(
      GROUP_ID,
      `📢 RANDOM SMS\n\n${msg}`
    );

    // ৭ মিনিট পর ডিলিট
    setTimeout(async () => {
      try {
        await bot.telegram.deleteMessage(GROUP_ID, sent.message_id);
      } catch {}
    }, 420000);

  } catch (e) {
    console.log("Random message error:", e.message);
  }
}, 120000);

/* ========================= */

bot.launch();
console.log("✅ Bot is running successfully...");
