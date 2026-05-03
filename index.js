import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";
import fs from "fs";

const bot = new Telegraf(BOT_TOKEN);

/* ================= CONFIG ================= */

const ADMIN_ID = 8136997138;
const METHOD_CHANNEL = "@Global_Method_Channel";
const GROUP_ID = "-1003527248014";
const DB_FILE = "./db.json";

/* ================= DB ================= */

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ banned: [], users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ================= RANDOM SYSTEM ON/OFF ================= */

let randomStatus = true; // default ON

bot.command("randomon", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("🚫 Admin only");
  randomStatus = true;
  ctx.reply("✅ Random Message ON");
});

bot.command("randomoff", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("🚫 Admin only");
  randomStatus = false;
  ctx.reply("⛔ Random Message OFF");
});

/* ================= RANDOM MESSAGES ================= */

const randomMessages = [
  "🔥 Don't miss the latest updates!",
  "🚀 Join now and get exclusive access!",
  "💎 Premium methods available!",
  "📢 Stay connected for daily updates!",
  "⚡ New updates are coming every day!",
  "🎯 Best services available here!",
  "📌 Join now to unlock premium access!",
  "💥 Limited time offers running!",
  "🚨 Don't miss this opportunity!",
  "🌐 Join our channels for more updates!",
  "🎉 Daily new tricks & methods!",
  "🔔 Stay updated with us always!",
  "💡 Smart users are already joined!",
  "📊 Get access to powerful tools!",
  "🔥 Trending methods available now!",
  "🚀 Boost your experience with us!",
  "📢 Exclusive content waiting for you!",
  "🎯 Join now and explore more!",
  "💎 Trusted and fast service!",
  "⚙️ Join our channel for full access!"
];

function getRandomMsg() {
  return randomMessages[Math.floor(Math.random() * randomMessages.length)];
}

/* ================= AUTO MESSAGE (UPDATED WITH ON/OFF) ================= */

setInterval(async () => {
  if (!randomStatus) return; // 🔥 ON/OFF control

  try {
    const sent = await bot.telegram.sendMessage(
      GROUP_ID,
      `📢 ${getRandomMsg()}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚙️ Global Channel", url: "https://t.me/Global_Method_Channel" }],
            [{ text: "📢 Main Channel", url: "https://t.me/+75BQ2Qw9UZI4OTM1" }]
          ]
        }
      }
    );

    // 4 minute delete
    setTimeout(async () => {
      try {
        await bot.telegram.deleteMessage(GROUP_ID, sent.message_id);
      } catch {}
    }, 4 * 60 * 1000);

  } catch {}
}, 2 * 60 * 1000);

/* ================= BOT START ================= */

bot.launch();
console.log("✅ BOT RUNNING");
