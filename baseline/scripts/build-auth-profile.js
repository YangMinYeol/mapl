// 벤치: Lighthouse 인증 측정용 Chrome 프로필 생성 (§2-A)
// - Playwright persistent context로 실제 로그인 수행 → localStorage(accessToken) + 쿠키(refreshToken)가
//   프로필 디렉터리에 저장됨 → 이후 lighthouse CLI가 이 프로필을 재사용(--user-data-dir)하면 로그인 상태로 감사 가능
// - 실행: node baseline/scripts/build-auth-profile.js
const { chromium } = require("playwright");
const path = require("path");

const BASE_URL = "https://mapl.vercel.app";
const LOGIN = { userId: "mapltest3", password: "mapltest3#" };
const PROFILE_DIR = path.join(__dirname, ".chrome-profile-authenticated");

async function main() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    viewport: { width: 1920, height: 1080 },
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "로그인" }).click();
  await page.waitForURL("**/login", { waitUntil: "commit" });
  await page.fill("#userId", LOGIN.userId);
  await page.fill("#password", LOGIN.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForSelector(".calendar-header-left", { timeout: 20000 });
  await page.waitForTimeout(1000);
  console.log("로그인 완료, 프로필 저장 위치:", PROFILE_DIR);
  await context.close();
}

main().catch((e) => {
  console.error("build-auth-profile 실패:", e.message);
  process.exit(1);
});
