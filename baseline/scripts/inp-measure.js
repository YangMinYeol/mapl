// 벤치: 실제 인터랙션(탭 전환, 모달 열기)의 INP 측정 (§4) — 라이브 사이트 대상
// frontend에 이미 있는 web-vitals 패키지의 IIFE 번들을 주입해 실측 (소스 수정 없음)
// 실행: node baseline/scripts/inp-measure.js
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://mapl.vercel.app";
const LOGIN = { userId: "mapltest3", password: "mapltest3#" };
const webVitalsScript = fs.readFileSync(
  path.join(__dirname, "..", "..", "frontend", "node_modules", "web-vitals", "dist", "web-vitals.iife.js"),
  "utf8"
);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.addScriptTag({ content: webVitalsScript });
  await page.evaluate(() => {
    window.__inp = null;
    window.webVitals.onINP((metric) => {
      window.__inp = metric.value;
    }, { reportAllChanges: true });
  });

  await page.getByRole("link", { name: "로그인" }).click();
  await page.waitForURL("**/login", { waitUntil: "commit" });
  await page.fill("#userId", LOGIN.userId);
  await page.fill("#password", LOGIN.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForSelector(".calendar-header-left", { timeout: 20000 });
  await page.waitForTimeout(1000);

  const results = {};

  // 탭 전환 인터랙션
  await page.locator(".calendar-header-left button", { hasText: "가계부" }).click();
  await page.waitForTimeout(500);
  results.tabSwitch_ms = await page.evaluate(() => window.__inp);

  // 모달 열기 인터랙션 (가계부 탭 상태에서 "+" 버튼)
  await page
    .locator("xpath=//div[starts-with(normalize-space(.),'자산')]/following-sibling::button")
    .click();
  await page.waitForTimeout(500);
  results.modalOpen_ms = await page.evaluate(() => window.__inp);
  await page.getByRole("button", { name: "닫기" }).click();

  // 월 이동 인터랙션
  await page.locator(".calendar-header-left button", { hasText: "메모" }).click();
  await page.waitForTimeout(300);
  await page.locator(".calendar-header-center button").nth(2).click();
  await page.waitForTimeout(500);
  results.monthNav_ms = await page.evaluate(() => window.__inp);

  console.log("INP 측정 결과(누적 최악값 기준, ms):", results);
  fs.writeFileSync(
    path.join(__dirname, "..", "quality-inp.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );

  await browser.close();
}

main().catch((e) => {
  console.error("inp-measure 실패:", e.message);
  process.exit(1);
});
