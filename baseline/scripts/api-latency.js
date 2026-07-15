// 벤치: 라이브 API 응답 지연 (§2-D) — 배포 서버(Render) 경유 실측
// - 워밍업 1회 후 로그인/메모 목록/가계부 목록 각 10회 순차 호출 → p50/p95
// - 콜드스타트(첫 요청) 지연은 별도 1회 기록(중앙값 미포함)
// 실행: node baseline/scripts/api-latency.js
const API_URL = "https://mapl.onrender.com"; // 배포 백엔드 (Lighthouse network-requests 실측으로 확인, 2026-07-15)
const LOGIN = { userId: "mapltest3", password: "mapltest3#" };
const fs = require("fs");
const path = require("path");

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function timed(fn) {
  const t0 = performance.now();
  const res = await fn();
  const ms = performance.now() - t0;
  return { ms, res };
}

async function main() {
  const result = {};

  // 콜드스타트(첫 요청) — 별도 1회
  const cold = await timed(() => fetch(`${API_URL}/health`));
  result.coldStart_ms = Math.round(cold.ms);
  console.log(`콜드스타트(첫 /health 요청): ${result.coldStart_ms}ms (status ${cold.res.status})`);

  // 워밍업(측정 제외)
  await fetch(`${API_URL}/health`);

  // 로그인 10회
  const loginTimes = [];
  let accessToken, userId;
  for (let i = 0; i < 10; i++) {
    const { ms, res } = await timed(() =>
      fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(LOGIN),
      })
    );
    const data = await res.json();
    if (res.ok) {
      accessToken = data.accessToken;
      userId = data.user.id;
    }
    loginTimes.push(ms);
    console.log(`login run${i + 1}: ${Math.round(ms)}ms (status ${res.status})`);
  }
  result.login = { p50_ms: Math.round(percentile(loginTimes, 50)), p95_ms: Math.round(percentile(loginTimes, 95)) };

  const today = new Date().toISOString().slice(0, 10);
  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  // 메모 목록 10회
  const memoTimes = [];
  for (let i = 0; i < 10; i++) {
    const { ms, res } = await timed(() =>
      fetch(`${API_URL}/api/memo?userId=${userId}&selectedDate=${today}`, { headers: authHeaders })
    );
    memoTimes.push(ms);
    console.log(`memo-list run${i + 1}: ${Math.round(ms)}ms (status ${res.status})`);
  }
  result.memoList = { p50_ms: Math.round(percentile(memoTimes, 50)), p95_ms: Math.round(percentile(memoTimes, 95)) };

  // 가계부 목록 10회
  const abTimes = [];
  for (let i = 0; i < 10; i++) {
    const { ms, res } = await timed(() =>
      fetch(`${API_URL}/api/account-book?userId=${userId}&startDate=${today}&endDate=${today}`, {
        headers: authHeaders,
      })
    );
    abTimes.push(ms);
    console.log(`accountbook-list run${i + 1}: ${Math.round(ms)}ms (status ${res.status})`);
  }
  result.accountBookList = { p50_ms: Math.round(percentile(abTimes, 50)), p95_ms: Math.round(percentile(abTimes, 95)) };

  fs.writeFileSync(
    path.join(__dirname, "..", "network", "api-latency.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );
  console.log("\n결과:", JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error("api-latency 실패:", e.message);
  process.exit(1);
});
