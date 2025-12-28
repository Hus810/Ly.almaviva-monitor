const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://ly.almaviva-visa.services/login", {
    waitUntil: "networkidle2",
  });

  await page.type("input[type=email]", EMAIL);
  await page.type("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  await page.goto("https://ly.almaviva-visa.services/appointment", {
    waitUntil: "networkidle2",
  });

  const content = await page.content();

  const tripoliAvailable =
    content.includes("Tripoli") &&
    !content.includes("No available appointments");

  if (tripoliAvailable) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "🚨 فتح موعد في طرابلس! ادخل الموقع فورًا",
      }),
    });
  }

  await browser.close();
})();
