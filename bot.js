const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  try {
    console.log("🚀 Bot starting...");

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log("🌐 Opening site...");
    await page.goto(
      "https://ly.almaviva-visa.services/appointment",
      { waitUntil: "domcontentloaded", timeout: 30000 }
    );

    console.log("👤 Trying to click login icon...");
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button, a")]
        .find(el =>
          el.innerText &&
          (el.innerText.toLowerCase().includes("login") ||
           el.innerText.includes("👤"))
        );
      if (btn) btn.click();
    });

    await sleep(3000);

    console.log("🔎 Waiting for email input...");
    const emailSelector =
      'input[name="email"], input[type="email"], input[placeholder*="Email"]';

    await page.waitForSelector(emailSelector, { timeout: 20000 });
    await page.type(emailSelector, process.env.ALMA_EMAIL, { delay: 60 });

    console.log("🔎 Waiting for password input...");
    const passSelector =
      'input[name="password"], input[type="password"], input[placeholder*="Password"]';

    await page.waitForSelector(passSelector, { timeout: 20000 });
    await page.type(passSelector, process.env.ALMA_PASSWORD, { delay: 60 });

    console.log("🔐 Submitting login...");
    await page.keyboard.press("Enter");

    await sleep(5000);
    console.log("✅ Login step finished");

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: "🤖 Almaviva bot: login step completed successfully"
      })
    });

    console.log("📨 Telegram sent");

    await browser.close();
    console.log("🛑 Bot finished normally");
    process.exit(0);

  } catch (err) {
    console.error("❌ Bot crashed:", err);
    process.exit(1);
  }
})();
