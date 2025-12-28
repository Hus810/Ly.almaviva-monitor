const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1️⃣ افتح الصفحة الرئيسية
  await page.goto("https://ly.almaviva-visa.services/", {
    waitUntil: "networkidle2",
  });

  // 2️⃣ اضغط أيقونة الشخص (selector عام يشتغل مع Angular)
  await page.waitForSelector("button, a", { timeout: 15000 });
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("button, a")]
      .find(e => e.innerText.toLowerCase().includes("login") || e.innerText.includes("دخول"));
    if (el) el.click();
  });

  // 3️⃣ انتظر حقول تسجيل الدخول
  await page.waitForSelector("input[type=email]", { timeout: 15000 });
  await page.type("input[type=email]", EMAIL, { delay: 50 });

  await page.waitForSelector("input[type=password]", { timeout: 15000 });
  await page.type("input[type=password]", PASSWORD, { delay: 50 });

  await page.keyboard.press("Enter");

  // 4️⃣ بعد تسجيل الدخول
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // 5️⃣ صفحة المواعيد
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
    console.log("🚨 Tripoli AVAILABLE!");
  } else {
    console.log("❌ No Tripoli yet...");
  }

  await browser.close();
})();
