const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

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

    console.log("🌐 Opening Almaviva site...");
    await page.goto("https://ly.almaviva-visa.services/appointment", {
      waitUntil: "domcontentloaded"
    });

    console.log("👤 Clicking login icon...");
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button, a")]
        .find(el =>
          el.innerText &&
          (el.innerText.toLowerCase().includes("login") ||
           el.innerText.includes("👤"))
        );
      if (btn) btn.click();
    });

    await page.waitForTimeout(3000);

    console.log("✍️ Typing email...");
    await page.waitForSelector(
      'input[name="email"], input[type="email"], input[placeholder*="Email"]',
      { timeout: 30000 }
    );
    await page.type(
      'input[name="email"], input[type="email"], input[placeholder*="Email"]',
      process.env.ALMA_EMAIL,
      { delay: 60 }
    );

    console.log("✍️ Typing password...");
    await page.waitForSelector(
      'input[name="password"], input[type="password"], input[placeholder*="Password"]',
      { timeout: 30000 }
    );
    await page.type(
      'input[name="password"], input[type="password"], input[placeholder*="Password"]',
      process.env.ALMA_PASSWORD,
      { delay: 60 }
    );

    console.log("🔐 Submitting login...");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(6000);
    console.log("✅ Login submitted");

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: "🤖 Almaviva bot logged in successfully"
      })
    });

    console.log("📨 Telegram confirmation sent");

    await browser.close();
    console.log("🛑 Bot finished normally");

  } catch (err) {
    console.error("❌ Bot crashed:", err);
    process.exit(1);
  }
})();
