// 벤치: 로그인→달력 진입→탭 전환 1회→월 이동 1회 시나리오의 API 호출 횟수 (§2-E)
// 실행: node baseline/scripts/scenario-requests.js
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://mapl.vercel.app";
const LOGIN = { userId: "mapltest3", password: "mapltest3#" };

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const requests = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/api/") || url.includes("onrender.com")) {
      requests.push({ method: req.method(), url });
    }
  });

  const mark = (label) => requests.push({ marker: label });

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  mark("--- 로그인 이동 ---");
  await page.getByRole("link", { name: "로그인" }).click();
  await page.waitForURL("**/login", { waitUntil: "commit" });
  await page.fill("#userId", LOGIN.userId);
  await page.fill("#password", LOGIN.password);
  mark("--- 로그인 제출 ---");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForSelector(".calendar-header-left", { timeout: 20000 });
  await page.waitForTimeout(1500); // 초기 로드 요청 마무리 대기
  mark("--- 달력 진입 완료 ---");

  await page.locator(".calendar-header-left button", { hasText: "가계부" }).click();
  await page.waitForTimeout(1000);
  mark("--- 탭 전환(메모→가계부) 완료 ---");

  await page.locator(".calendar-header-center button").nth(2).click(); // 다음달
  await page.waitForTimeout(1000);
  mark("--- 월 이동(다음달) 완료 ---");

  await browser.close();

  console.log(requests.map((r) => (r.marker ? `\n${r.marker}` : `  ${r.method} ${r.url}`)).join("\n"));
  const apiOnly = requests.filter((r) => !r.marker);
  console.log(`\n총 API 요청 수: ${apiOnly.length}`);

  fs.writeFileSync(
    path.join(__dirname, "..", "network", "scenario-requests.json"),
    JSON.stringify(requests, null, 2),
    "utf8"
  );
}

main().catch((e) => {
  console.error("scenario-requests 실패:", e.message);
  process.exit(1);
});
