const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

(async () => {
  try {
    console.log("🚀 Bot starting...");

    // رسالة تأكيد تشغيل
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: "🤖 Almaviva bot started"
      })
    });

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log("✅ Browser launched successfully");

    // 👇 هنا لاحقًا نضيف:
    // - login
    // - check appointments
    // - telegram alert

    await browser.close();
    console.log("🛑 Bot finished normally");

  } catch (err) {
    console.error("❌ Bot crashed:", err);
    process.exit(1);
  }
})();
