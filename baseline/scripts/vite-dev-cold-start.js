// 벤치: Vite 개발 서버 콜드스타트 재측정 (§3) — bench/dev-server-cold-start.js의 Vite 부분만 재사용
// (CRA는 이미 마이그레이션되어 레포에 존재하지 않아 비교 대상에서 제외, Vite만 현재 머신 기준 재실측)
// 실행: node baseline/scripts/vite-dev-cold-start.js
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RUNS = 3;
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const viteDir = path.join(__dirname, "..", "..", "frontend");

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

async function waitForHttp(url, timeoutMs = 60000) {
  const t0 = performance.now();
  while (performance.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return Math.round(performance.now() - t0);
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`timeout: ${url}`);
}

function killTree(pid) {
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
  } catch (_) {}
}

async function main() {
  const times = [];
  for (let run = 1; run <= RUNS; run++) {
    rmrf(path.join(viteDir, "node_modules", ".vite")); // 콜드스타트 보장
    const child = spawn("npm run dev", {
      cwd: viteDir,
      shell: true,
      env: { ...process.env, BROWSER: "none", FORCE_COLOR: "0" },
      stdio: "ignore",
    });
    try {
      const ms = await waitForHttp("http://localhost:5173/");
      times.push(ms);
      console.log(`run ${run}: ${ms}ms`);
    } finally {
      killTree(child.pid);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  console.log(`\nmedian: ${median(times)}ms`);
}

main().catch((e) => {
  console.error("벤치 실패:", e.message);
  process.exit(1);
});
