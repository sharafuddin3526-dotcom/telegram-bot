function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📊 Panel", callback_data: "panel_menu" }],
        [{ text: "🆘 Help", callback_data: "help_menu" }],
        [{ text: "📢 Support", callback_data: "support_menu" }]
      ]
    }
  };
}

/* ================= START ================= */

bot.start((ctx) => {
  ctx.reply("📌 MAIN MENU", mainMenu());
});

/* ================= PANEL MENU ================= */

bot.action("panel_menu", (ctx) => {
  ctx.editMessageText("📊 ORANGE PANEL ACCESS", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📧 Gmail", callback_data: "gmail" }],
        [{ text: "🔐 Password", callback_data: "pass" }],
        [{ text: "🌐 Login Panel", url: "https://www.orangecarrier.com/" }],
        [{ text: "👤 Support ID", url: "https://t.me/Smart_Method_Owner" }],
        [{ text: "🔙 Back", callback_data: "back" }]
      ]
    }
  });
});

/* ================= HELP MENU ================= */

bot.action("help_menu", (ctx) => {
  ctx.editMessageText(`📌 HELP MENU

🔹 /panel → Get Panel Access
🔹 Support available`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📊 Panel", callback_data: "panel_menu" }],
        [{ text: "🔙 Back", callback_data: "back" }]
      ]
    }
  });
});

/* ================= SUPPORT ================= */

bot.action("support_menu", (ctx) => {
  ctx.reply("✍️ Write your message. It will be sent to admin 📩");
});

/* ================= BACK BUTTON ================= */

bot.action("back", (ctx) => {
  ctx.editMessageText("📌 MAIN MENU", mainMenu());
});

/* ================= PANEL BUTTONS ================= */

bot.action("gmail", (ctx) => {
  ctx.reply("📧 Gmail: Mariyaakter1028@gmail.com");
});

bot.action("pass", (ctx) => {
  ctx.reply("🔐 Password: Onetimeuse");
});
