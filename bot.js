const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

(async () => {
  try {
    console.log("🚀 Bot starting...");

    // 1️⃣ إطلاق المتصفح
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // 2️⃣ فتح الموقع
    await page.goto("https://ly.almaviva-visa.services/appointment", {
      waitUntil: "networkidle2"
    });

    // 3️⃣ الضغط على أيقونة تسجيل الدخول
    const loginButton = await page.$x("//button[contains(., 'Login') or contains(., '👤')]");
    if (loginButton.length) {
      await loginButton[0].click();
      await page.waitForTimeout(2000); // 2 ثانية انتظار للـ DOM
    } else {
      console.log("⚠️ أيقونة Login لم تُعثر عليها");
    }

    // 4️⃣ الانتظار وكتابة الإيميل
    await page.waitForSelector('input[name="email"], input[placeholder*="Email"]', { timeout: 30000 });
    await page.type('input[name="email"]', process.env.ALMA_EMAIL, { delay: 50 });

    // 5️⃣ الانتظار وكتابة الباسوورد
    await page.waitForSelector('input[name="password"], input[placeholder*="Password"]', { timeout: 30000 });
    await page.type('input[name="password"]', process.env.ALMA_PASSWORD, { delay: 50 });

    // 6️⃣ زر الدخول (Enter)
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("✅ Logged in successfully");

    // 7️⃣ رسالة تيليجرام للتأكيد
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: "🤖 Almaviva bot started and logged in successfully"
      })
    });

    // 👇 لاحقًا: نضيف اختيار Tripoli + التحقق من السهم الأزرق

    await browser.close();
    console.log("🛑 Bot finished normally");

  } catch (err) {
    console.error("❌ Bot crashed:", err);
    process.exit(1);
  }
})();
