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

  // 1️⃣ فتح الصفحة الرئيسية
  await page.goto("https://ly.almaviva-visa.services/", {
    waitUntil: "networkidle2",
  });

  // 2️⃣ الضغط على أيقونة تسجيل الدخول (login icon)
  await page.waitForSelector("button.login-button"); // <-- استبدل هذا بالـ selector الصحيح
  await page.click("button.login-button");

  // 3️⃣ انتظار ظهور الحقول بعد الضغط
  await page.waitForSelector("input#user_email", { timeout: 10000 });
  await page.type("input#user_email", EMAIL);

  await page.waitForSelector("input#user_password", { timeout: 10000 });
  await page.type("input#user_password", PASSWORD);

  // 4️⃣ الضغط على زر تسجيل الدخول
  await page.waitForSelector("button[type=submit]");
  await page.click("button[type=submit]");

  // 5️⃣ الانتظار حتى يتم الانتقال لصفحة المواعيد
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.goto("https://ly.almaviva-visa.services/appointment", {
    waitUntil: "networkidle2",
  });

  // 6️⃣ أخذ محتوى الصفحة وفحص مواعيد طرابلس
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

  // 7️⃣ أخذ screenshot (اختياري للتأكد من ظهور الصفحة)
  await page.screenshot({ path: "page.png", fullPage: true });

  await browser.close();
})();
