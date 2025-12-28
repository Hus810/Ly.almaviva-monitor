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

    // 1️⃣ فتح الموقع
    await page.goto("https://ly.almaviva-visa.services/appointment", {
      waitUntil: "networkidle2"
    });

    // 2️⃣ الضغط على أيقونة تسجيل الدخول (أعلى اليمين)
    await page.waitForSelector('button, a', { timeout: 15000 });
    await page.evaluate(() => {
      [...document.querySelectorAll("button,a")]
        .find(el => el.innerText.toLowerCase().includes("login") || el.innerText.includes("👤"))?.click();
    });

    // 3️⃣ إدخال الإيميل والباسوورد
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.type('input[type="email"]', process.env.ALMA_EMAIL, { delay: 50 });
    await page.type('input[type="password"]', process.env.ALMA_PASSWORD, { delay: 50 });

    // 4️⃣ زر الدخول
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("✅ Logged in successfully");

    // 👇 هنا الخطوة القادمة: اختيار المدينة
    await browser.close();

  } catch (err) {
    console.error("❌ Bot crashed:", err);
    process.exit(1);
  }
})();
