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
    return ctx.reply("⚠️ Access Denied 🚫\n\n" +
  "You must join all required channels before using this bot 📢\n\n" +
  "👉 After joining, click the button below to verify your access 🔄\n\n" +
  "🔥 Stay connected to unlock full features 🚀", joinUI());
  }

  ctx.reply(`🌸 Bot Started Successfully 🚀

👋 Welcome!

📌 You can use the following commands:

🔹 /start → Start the bot
🔹 /panel → View panel (Email/Password/Link)
🔹 /help → Help menu (can be added later)

⚠️ Note:
❌ /block → Admin only
❌ /unblock → Admin only
❌ /boardchat → Admin only

💡 If you face any issue, contact the admin

🚀 Enjoy using the bot`);

/* =========================
   CHECK JOIN BUTTON
========================= */

bot.action("check_join", async (ctx) => {
  const ok = await isJoined(ctx);

  if (!ok) {
  return ctx.answerCbQuery(
`❌ NOT JOINED ❌

🚫 Access Blocked
📢 Join Required Channels First`
  );
}

await ctx.editMessageText(`🎉✅ Verification Successful! 🚀

━━━━━━━━━━━━━━━
🌸 Congratulations!
You are now fully verified 💎

⚡ You can now access all bot features
📌 No restrictions applied
🚀 Enjoy smooth system access

━━━━━━━━━━━━━━━
💡 Smart Method System Active`);

/* =========================
   PANEL COMMAND
========================= */

bot.command("panel", (ctx) => {
  ctx.reply(`🍊 Orange Carrier Panel 🍊
━━━━━━━━━━━━━━━
🔽 Click buttons below 🔽
`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📧 Copy Gmail", callback_data: "copy_email" }
        ],
        [
          { text: "🔐 Copy Password", callback_data: "copy_pass" }
        ],
        [
          { text: "🌐 Panel Login", url: "https://www.orangecarrier.com" }
        ],
        [
          { text: "👤 Support", url: "https://t.me/Smart_Method_Owner" }
        ]
      ]
    }
  });
});

/* =========================
   COPY BUTTONS
========================= */

bot.action("copy_email", (ctx) => {
  ctx.answerCbQuery("📧 Copied: Mariyaakter1028@gmail.com");
});

bot.action("copy_pass", (ctx) => {
  ctx.answerCbQuery("🔐 Copied: Onetimeuse");
});

/* =========================
   BOARDCHAT (ADMIN ONLY)
========================= */

bot.command("boardchat", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply(`🚫 ACCESS DENIED 🚫

⚠️ This command is restricted!

👮‍♂️ Only ADMIN has permission to use this feature.

🔒 You do not have the required access level.

━━━━━━━━━━━━━━━
💡 If you think this is a mistake, contact support`);
});
  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("❌ /boardchat message");

  await bot.telegram.sendMessage(GROUP_ID, `📢 ${msg}`);
  ctx.reply("✅ Message successfully sent to group 🚀");
});

/* =========================
   BLOCK
========================= */

bot.command("block", (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.reply("🚫 ACCESS DENIED 🚫

⚠️ This command is restricted!

👮‍♂️ Only ADMIN has permission to use this feature.

🔒 You do not have the required access level.

━━━━━━━━━━━━━━━
💡 If you think this is a mistake, contact support");

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
    return ctx.reply("🚫 ACCESS DENIED 🚫

⚠️ This command is restricted!

👮‍♂️ Only ADMIN has permission to use this feature.

🔒 You do not have the required access level.

━━━━━━━━━━━━━━━
💡 If you think this is a mistake, contact support");

  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("❌ /unblock userID");

  const db = loadDB();
  db.banned = db.banned.filter(u => u !== String(id));
  saveDB(db);

  ctx.reply(`✅ Unblocked ${id}`);
});

/* =========================
   REPLY SYSTEM
========================= */

bot.action(/reply_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID)
    return ctx.answerCbQuery("🚫 ACCESS DENIED 🚫

⚠️ This command is restricted!

👮‍♂️ Only ADMIN has permission to use this feature.

🔒 You do not have the required access level.

━━━━━━━━━━━━━━━
💡 If you think this is a mistake, contact support");

  const userId = ctx.match[1];
  pendingReply[ADMIN_ID] = userId;

  ctx.reply("✍️ You are now replying to this user. Type your message...");
});

/* =========================
   MESSAGE HANDLER
========================= */

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const id = ctx.from.id;

  if (isBanned(id)) return ctx.reply("⛔ Access denied. You are blocked by @Smart_Method_Owner");

  const ok = await isJoined(ctx);
  if (!ok) return ctx.reply("⚠️ Join first", joinUI());

  /* ADMIN REPLY */
  if (id === ADMIN_ID && pendingReply[ADMIN_ID]) {
    const userId = pendingReply[ADMIN_ID];

    await ctx.telegram.sendMessage(userId, `💬 You received a reply from Admin:\n\n${text}`);

    pendingReply[ADMIN_ID] = null;
    return ctx.reply("🤖 Reply পাঠানো সম্পন্ন হয়েছে — ইউজার এখন মেসেজটি পেয়েছে 📩");
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
   RANDOM GROUP MESSAGE + AUTO DELETE
========================= */

const randomMessages = [
  "🌟 Stay strong, success is near 💪",
  "🚀 Keep grinding, don’t stop 🔥",
  "💡 Smart work always wins 🧠",
  "🌸 Stay positive, stay focused 😊",
  "⚡ System is fully active now 🚀",
  "🔥 Hustle hard, shine bright 💎",
  "📈 Your growth matters every day 📊",
  "💬 Keep learning, keep earning 💰",
  "🌍 Connected with global system 🌐",
  "🧠 Upgrade your mindset daily 📚",
  "💎 Small steps lead to big success 🏆",
  "🚀 Never quit, just upgrade 🔥",
  "🌸 Good vibes only ✨",
  "⚙️ Smart system running smoothly 🤖",
  "📢 Stay tuned for updates 🔔"
];

setInterval(async () => {
  try {
    const msg =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    const sent = await bot.telegram.sendMessage(GROUP_ID, msg);

    // AUTO DELETE AFTER 10 MINUTES
    setTimeout(async () => {
      try {
        await bot.telegram.deleteMessage(GROUP_ID, sent.message_id);
      } catch (e) {
        console.log("Delete error:", e.message);
      }
    }, 600000);

  } catch (e) {
    console.log("random error:", e.message);
  }
}, 120000);

/* ========================= */

bot.launch();
console.log("Bot running...");
