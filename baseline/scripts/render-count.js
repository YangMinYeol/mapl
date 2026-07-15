// 벤치: 달력 탭 전환/월 이동 시 Calendar/Dashboard 리렌더 횟수 (§4)
// 전제: frontend/src/components/calendar/Calendar.jsx, .../dashboard/Dashboard.jsx에
// console.count("Calendar render") / console.count("Dashboard render")를 임시 삽입한 상태에서
// 로컬 dev 서버(:5173) + 로컬 backend(:5000)로 측정 후 원복한다(라이브 배포本은 계측 불가).
// 실행: node baseline/scripts/render-count.js
const { chromium } = require("playwright");

const LOGIN = { userId: "mapltest3", password: "mapltest3#" };

function parseCount(text) {
  // "Calendar render: 3" 형식
  const m = text.match(/^(Calendar render|Dashboard render): (\d+)$/);
  return m ? { label: m[1], count: Number(m[2]) } : null;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const counts = { "Calendar render": 0, "Dashboard render": 0 };
  page.on("console", (msg) => {
    const parsed = parseCount(msg.text());
    if (parsed) counts[parsed.label] = parsed.count;
  });

  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "로그인" }).click();
  await page.waitForURL("**/login", { waitUntil: "commit" });
  await page.fill("#userId", LOGIN.userId);
  await page.fill("#password", LOGIN.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForSelector(".calendar-header-left", { timeout: 20000 });
  await page.waitForTimeout(1000);

  const afterLoad = { ...counts };
  console.log("초기 로드 후:", afterLoad);

  await page.locator(".calendar-header-left button", { hasText: "가계부" }).click();
  await page.waitForTimeout(800);
  const afterTabSwitch = { ...counts };
  console.log(
    "탭 전환(메모→가계부) 후:",
    afterTabSwitch,
    "→ 증가분:",
    afterTabSwitch["Calendar render"] - afterLoad["Calendar render"],
    "/",
    afterTabSwitch["Dashboard render"] - afterLoad["Dashboard render"]
  );

  await page.locator(".calendar-header-center button").nth(2).click(); // 다음달
  await page.waitForTimeout(800);
  const afterMonthNav = { ...counts };
  console.log(
    "월 이동(다음달) 후:",
    afterMonthNav,
    "→ 증가분:",
    afterMonthNav["Calendar render"] - afterTabSwitch["Calendar render"],
    "/",
    afterMonthNav["Dashboard render"] - afterTabSwitch["Dashboard render"]
  );

  await browser.close();
}

main().catch((e) => {
  console.error("render-count 실패:", e.message);
  process.exit(1);
});
