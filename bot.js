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
      { waitUntil: "networkidle2", timeout: 60000 }
    );

    await sleep(3000);

    console.log("👤 Clicking profile/login icon...");
    await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll("button, a, div"));
      const loginBtn = candidates.find(el =>
        el.innerText &&
        el.innerText.toLowerCase().includes("login")
      );
      if (loginBtn) loginBtn.click();
    });

    await sleep(4000);

    console.log("⏳ Waiting for login form (email/password)...");
    const loginAppeared = await page.waitForFunction(() => {
      return (
        document.querySelector('input[type="email"]') ||
        document.querySelector('input[type="password"]')
      );
    }, { timeout: 30000 }).catch(() => false);

    if (!loginAppeared) {
      console.log("❌ Login form not detected, dumping HTML...");

      const html = await page.content();
      console.log(html.substring(0, 2000)); // تشخيص فقط

      throw new Error("Login form did not appear");
    }

    console.log("✉️ Typing email...");
    await page.type('input[type="email"]', process.env.ALMA_EMAIL, { delay: 60 });

    console.log("🔑 Typing password...");
    await page.type('input[type="password"]', process.env.ALMA_PASSWORD, { delay: 60 });

    await sleep(1000);
    console.log("🔐 Submitting login...");
    await page.keyboard.press("Enter");

    await sleep(6000);
    console.log("✅ Login attempt finished");

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: "🤖 Almaviva bot: login step executed"
      })
    });

    await browser.close();
    console.log("🟢 Bot finished successfully");
    process.exit(0);

  } catch (err) {
    console.error("🔥 Fatal error:", err.message);
    process.exit(1);
  }
})();
