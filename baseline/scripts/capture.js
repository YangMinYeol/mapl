// 벤치: Mapl v1 라이브 서비스 시각 자료 캡처 (§1) — Playwright
// - 스크린샷(데스크톱 1920x1080 / 모바일 375x812) + 데스크톱 인터랙션 비디오 녹화
// - SPA 클라이언트 라우팅만 사용(직접 URL 진입은 Vercel 404 확인됨 → §5/§6에 별도 기록)
// - 실행: node baseline/scripts/capture.js desktop   (비디오 포함)
//         node baseline/scripts/capture.js mobile    (스크린샷만)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const VIEWPORT_ARG = process.argv[2];
if (!["desktop", "mobile"].includes(VIEWPORT_ARG)) {
  console.error("사용법: node capture.js <desktop|mobile>");
  process.exit(1);
}

const BASE_URL = "https://mapl.vercel.app";
const LOGIN = { userId: "mapltest3", password: "mapltest3#" };
// 참고: README.md에는 "mplatest3#"로 적혀 있으나 실측 결과 401 — 실제 비밀번호는 "mapltest3#" (사용자 확인, 2026-07-15)

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 812 },
};

const SHOT_DIR = path.join(__dirname, "..", "screenshots", VIEWPORT_ARG);
const RECORD_DIR = path.join(__dirname, "..", "recordings");
fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(RECORD_DIR, { recursive: true });

const report = []; // { step, status: 'ok'|'fail', detail }
const consoleLogs = []; // { type, text, url }

// 모바일(375px)에서 고정폭 모달이 뷰포트 밖으로 넘쳐 일반 클릭이 불가능한 경우(반응형 미대응, baseline 실측)
// DOM에서 직접 .click()을 호출해 좌표 기반 클릭 없이 진행
async function clickByText(page, tag, text) {
  const clicked = await page.evaluate(
    ({ tag, text }) => {
      const els = Array.from(document.querySelectorAll(tag));
      const el = els.find((e) => e.textContent.trim() === text);
      if (el) {
        el.click();
        return true;
      }
      return false;
    },
    { tag, text }
  );
  if (!clicked) throw new Error(`clickByText: "${text}" 요소를 찾지 못함`);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: true });
}

async function step(name, fn) {
  try {
    await fn();
    report.push({ step: name, status: "ok" });
    console.log(`[ok] ${name}`);
  } catch (e) {
    report.push({ step: name, status: "fail", detail: e.message });
    console.log(`[FAIL] ${name}: ${e.message}`);
  }
}

async function main() {
  const browser = await chromium.launch();
  const contextOpts = { viewport: VIEWPORTS[VIEWPORT_ARG] };
  if (VIEWPORT_ARG === "desktop") {
    contextOpts.recordVideo = { dir: RECORD_DIR, size: VIEWPORTS.desktop };
  }
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();
  page.on("console", (msg) => consoleLogs.push({ type: msg.type(), text: msg.text(), url: page.url() }));
  page.on("pageerror", (err) => consoleLogs.push({ type: "pageerror", text: err.message, url: page.url() }));
  page.setDefaultTimeout(15000);

  // 주의: Vercel에 SPA rewrite(vercel.json)가 없어 "/" 외 경로는 직접 goto/새로고침 시 404 확인됨
  // (baseline 실측, §5/§6에 별도 기록) → 이후 모든 내부 이동은 클라이언트 라우팅(Link 클릭)만 사용
  await step("root-page", async () => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  });

  // ── 로그인 전 ─────────────────────────────
  await step("login-page", async () => {
    await page.getByRole("link", { name: "로그인" }).click();
    await page.waitForURL("**/login", { waitUntil: "commit" });
    await shot(page, "01-login");
  });

  await step("login-error-state", async () => {
    await page.fill("#userId", "wrongwrong1");
    await page.fill("#password", "wrongpassword1!");
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForSelector("text=아이디 또는 비밀번호를 다시 한번 확인해 주세요.", { timeout: 5000 });
    await shot(page, "02-login-error");
    await page.getByRole("button", { name: "확인" }).click();
  });

  await step("signup-page", async () => {
    await page.getByRole("button", { name: "회원가입" }).click();
    await page.waitForURL("**/signup", { waitUntil: "commit" });
    await shot(page, "03-signup");
  });

  // ── 로그인 ────────────────────────────────
  await step("do-login", async () => {
    await page.goBack({ waitUntil: "commit" }); // /signup → /login (클라이언트 라우팅 히스토리)
    await page.waitForURL("**/login", { waitUntil: "commit" });
    await page.fill("#userId", LOGIN.userId);
    await page.fill("#password", LOGIN.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForSelector(".calendar-header-left", { timeout: 20000 });
    await page.waitForTimeout(1000);
  });

  // ── 메모 탭 (Day/Week/Month/Year) ─────────
  const periodLabels = ["Day", "Week", "Month", "Year"];
  for (const label of periodLabels) {
    await step(`main-memo-${label.toLowerCase()}`, async () => {
      await page.locator(".period-nav-list .nav-item", { hasText: label }).click();
      await page.waitForTimeout(500);
      await shot(page, `10-main-memo-${label.toLowerCase()}`);
    });
  }

  await step("back-to-day", async () => {
    await page.locator(".period-nav-list .nav-item", { hasText: "Day" }).click();
    await page.waitForTimeout(300);
  });

  // ── 메모 빠른 추가 ─────────────────────────
  await step("quick-add-memo", async () => {
    await page.locator(".dashboard-content-add input").fill("baseline 테스트 메모");
    await page.locator(".dashboard-content-add input").press("Enter");
    await page.waitForTimeout(800);
    await shot(page, "11-main-memo-after-quick-add");
  });

  await step("memo-modal-open", async () => {
    await page.locator(".dashboard-content-add button").click(); // 입력창 비어있어 상세 모달
    await page.waitForSelector("text=메모");
    await shot(page, "12-memo-modal-open");
    await clickByText(page, "button", "닫기"); // 모바일 375px에서 고정폭 모달이 화면 밖으로 넘침(반응형 미대응, baseline 실측)
  });

  await step("postpone-memo", async () => {
    await page.locator('[title="미루기"]').first().click();
    await page.waitForTimeout(800);
    await shot(page, "13-main-memo-after-postpone");
  });

  // ── 링크 메모: Week에 원본 생성 → Day에서 링크 ──
  await step("link-create-source", async () => {
    await page.locator(".period-nav-list .nav-item", { hasText: "Week" }).click();
    await page.waitForTimeout(300);
    await page.locator(".dashboard-content-add input").fill("링크 원본 메모");
    await page.locator(".dashboard-content-add input").press("Enter");
    await page.waitForTimeout(800);
    await page.locator(".period-nav-list .nav-item", { hasText: "Day" }).click();
    await page.waitForTimeout(300);
  });

  await step("link-select-and-add", async () => {
    const subRow = page.locator(".dashboard-sub-content li", { hasText: "링크 원본 메모" });
    await subRow.locator("button").first().click(); // 체크박스
    await page.locator(".header").getByRole("button", { name: "추가" }).click();
    await page.waitForSelector("text=선택한 메모를 링크를 연결하여 추가하시겠습니까?");
    await shot(page, "14-link-confirm-modal");
    await page.getByRole("button", { name: "예", exact: true }).click();
    await page.waitForTimeout(800);
    await shot(page, "15-main-memo-after-link");
  });

  await step("link-modal-view", async () => {
    await page.locator('[title="링크"]').first().click();
    await page.waitForSelector("text=링크 연결된 메모 목록");
    await shot(page, "16-link-modal");
    await clickByText(page, "button", "닫기"); // 모바일 375px에서 고정폭 모달이 화면 밖으로 넘침(반응형 미대응, baseline 실측)
  });

  await step("link-complete", async () => {
    const linkedRow = page.locator(".dashboard-main-content li", { hasText: "링크 원본 메모" });
    await linkedRow.locator("button").first().click(); // 완료 체크박스
    await page.waitForSelector("text=동기화되어있는 메모 모두 complete", { timeout: 5000 });
    await page.getByRole("button", { name: "예", exact: true }).click();
    await page.waitForTimeout(800);
    await shot(page, "17-main-memo-after-complete-linked");
  });

  // ── 가계부 탭 ──────────────────────────────
  await step("switch-to-accountbook-tab", async () => {
    await page.locator(".calendar-header-left button", { hasText: "가계부" }).click();
    await page.waitForTimeout(500);
  });

  for (const label of periodLabels) {
    await step(`main-accountbook-${label.toLowerCase()}`, async () => {
      await page.locator(".period-nav-list .nav-item", { hasText: label }).click();
      await page.waitForTimeout(500);
      await shot(page, `20-main-accountbook-${label.toLowerCase()}`);
    });
  }

  await step("accountbook-modal-open", async () => {
    await page.locator(".period-nav-list .nav-item", { hasText: "Day" }).click();
    await page.waitForTimeout(300);
    await page
      .locator("xpath=//div[starts-with(normalize-space(.),'자산')]/following-sibling::button")
      .click();
    await page.waitForSelector("text=가계부");
    await shot(page, "21-accountbook-modal-open");
    await clickByText(page, "button", "닫기"); // 모바일 375px에서 고정폭 모달이 화면 밖으로 넘침(반응형 미대응, baseline 실측)
  });

  // ── 월 이동 ───────────────────────────────
  await step("month-navigation", async () => {
    await page.locator(".calendar-header-left button", { hasText: "메모" }).click();
    await page.waitForTimeout(300);
    await shot(page, "22-calendar-before-month-nav");
    await page.locator(".calendar-header-center button").nth(2).click(); // 다음달
    await page.waitForTimeout(500);
    await shot(page, "23-calendar-next-month");
    await page.locator(".calendar-header-center button").nth(0).click(); // 이전달
    await page.locator(".calendar-header-center button").nth(0).click(); // 이전달 한번 더 (원래보다 이전)
    await page.waitForTimeout(500);
    await shot(page, "24-calendar-prev-month");
  });

  // ── 게시판 ────────────────────────────────
  await step("board-notice-list", async () => {
    await page.getByRole("link", { name: "게시판" }).click();
    await page.waitForURL("**/board", { waitUntil: "commit" });
    await page.waitForTimeout(500);
    await shot(page, "30-board-notice-list");
  });

  await step("board-free-list", async () => {
    await clickByText(page, "span", "자유게시판"); // 375px에서 사이드 탭이 뷰포트 밖으로 넘침(반응형 미대응)
    await page.waitForTimeout(500);
    await shot(page, "31-board-free-list");
  });

  await step("board-post-detail", async () => {
    await page.locator(".divide-y.border-y > div").first().click();
    await page.waitForTimeout(500);
    await shot(page, "32-board-post-detail");
    await page.getByRole("button", { name: "목록" }).click();
  });

  await step("board-write-form", async () => {
    await clickByText(page, "button", "글쓰기"); // 375px에서 뷰포트 밖으로 넘침(반응형 미대응)
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="제목을 입력해주세요."]').fill("baseline 측정용 제목(미제출)");
    await page.locator("textarea").fill("baseline 측정 스크립트가 작성한 임시 내용입니다. 등록 버튼을 누르지 않고 캡처만 진행합니다.");
    await shot(page, "33-board-write-form");
    await page.getByRole("button", { name: "목록" }).click(); // 등록하지 않고 취소
  });

  await step("board-report-list", async () => {
    await clickByText(page, "span", "오류 보고"); // 375px에서 뷰포트 밖으로 넘침(반응형 미대응)
    await page.waitForTimeout(500);
    await shot(page, "34-board-report-list");
  });

  // ── 마이페이지 ────────────────────────────
  await step("user-profile-password-check", async () => {
    await page.getByText("달력", { exact: true }).click(); // 게시판→달력 복귀 (UserDropDown 노출 위해)
    await page.waitForTimeout(300);
    await page.locator("header").getByText(/님/).hover();
    await page.getByRole("link", { name: "회원정보" }).click();
    await page.waitForURL("**/user/profile", { waitUntil: "commit" });
    await shot(page, "40-user-profile-password-check");
  });

  await step("user-profile-edit", async () => {
    await page.locator('input[type="password"]').fill(LOGIN.password);
    await page.getByRole("button", { name: "확인" }).click();
    await page.waitForURL("**/user/profile/edit", { waitUntil: "commit" });
    await shot(page, "41-user-profile-edit");
  });

  await step("accountbook-category-page", async () => {
    await page.goBack({ waitUntil: "commit" });
    await page.waitForTimeout(300);
    await page.locator("header").getByText(/님/).hover();
    await page.getByRole("link", { name: "가계부 카테고리" }).click();
    await page.waitForURL("**/user/accountbook/category", { waitUntil: "commit" });
    await shot(page, "42-accountbook-category");
  });

  await context.close();
  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, "..", `manifest-${VIEWPORT_ARG}.json`),
    JSON.stringify({ report, consoleLogs }, null, 2),
    "utf8"
  );

  const fails = report.filter((r) => r.status === "fail");
  console.log(`\n완료: ${report.length}단계 중 실패 ${fails.length}건`);
  if (fails.length) console.log(fails.map((f) => `- ${f.step}: ${f.detail}`).join("\n"));
}

main().catch((e) => {
  console.error("capture 실패:", e);
  process.exit(1);
});
