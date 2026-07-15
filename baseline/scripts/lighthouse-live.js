// 벤치: 라이브 서비스 Lighthouse 측정 (§2-A) — bench/lighthouse-preview.js 패턴 확장
// - desktop/mobile preset × 3회 실행 → median, 4개 카테고리 점수 + Core Web Vitals
// - 인증 프로필(authProfileDir) 지정 시 --disable-storage-reset으로 localStorage 로그인 상태 유지
// - 실행: node lighthouse-live.js <url> <desktop|mobile> <label> [authProfileDir]
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [, , url, formFactor, label, authProfileDir] = process.argv;
if (!url || !formFactor || !label) {
  console.error("사용법: node lighthouse-live.js <url> <desktop|mobile> <label> [authProfileDir]");
  process.exit(1);
}

const RUNS = 3;
const OUT_DIR = path.join(__dirname, "..", "lighthouse");
fs.mkdirSync(OUT_DIR, { recursive: true });
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

const presetFlag = formFactor === "desktop" ? "--preset=desktop" : "";
const chromeFlags = ["--headless=new"];
let storageFlag = "";
if (authProfileDir) {
  chromeFlags.push(`--user-data-dir="${authProfileDir}"`);
  storageFlag = "--disable-storage-reset";
}

const out = { performance: [], accessibility: [], "best-practices": [], seo: [], fcp: [], lcp: [], tbt: [], cls: [], speedIndex: [] };

for (let i = 1; i <= RUNS; i++) {
  const tmp = path.join(OUT_DIR, `${label}-${formFactor}-run${i}.json`);
  const cmd =
    `npx lighthouse "${url}" --only-categories=performance,accessibility,best-practices,seo ` +
    `${presetFlag} --chrome-flags="${chromeFlags.join(" ")}" ${storageFlag} ` +
    `--output=json --output-path="${tmp}" --quiet`;
  execSync(cmd, { stdio: "inherit" });
  const r = JSON.parse(fs.readFileSync(tmp, "utf8"));
  const a = r.audits;
  for (const cat of ["performance", "accessibility", "best-practices", "seo"]) {
    out[cat].push(Math.round(r.categories[cat].score * 100));
  }
  out.fcp.push(a["first-contentful-paint"].numericValue);
  out.lcp.push(a["largest-contentful-paint"].numericValue);
  out.tbt.push(a["total-blocking-time"].numericValue);
  out.cls.push(a["cumulative-layout-shift"].numericValue);
  out.speedIndex.push(a["speed-index"].numericValue);
  console.log(
    `[${label}/${formFactor}] run${i}: perf=${out.performance[i - 1]} a11y=${out.accessibility[i - 1]} ` +
      `bp=${out["best-practices"][i - 1]} seo=${out.seo[i - 1]} LCP=${Math.round(a["largest-contentful-paint"].numericValue)}ms`
  );
}

const summary = {
  label,
  formFactor,
  url,
  runs: RUNS,
  authenticated: Boolean(authProfileDir),
  median: {
    performance: median(out.performance),
    accessibility: median(out.accessibility),
    "best-practices": median(out["best-practices"]),
    seo: median(out.seo),
    fcp_ms: Math.round(median(out.fcp)),
    lcp_ms: Math.round(median(out.lcp)),
    tbt_ms: Math.round(median(out.tbt)),
    cls: Number(median(out.cls).toFixed(3)),
    speedIndex_ms: Math.round(median(out.speedIndex)),
  },
};
fs.writeFileSync(path.join(OUT_DIR, `${label}-${formFactor}-summary.json`), JSON.stringify(summary, null, 2), "utf8");
console.log("\nmedian:", JSON.stringify(summary.median, null, 2));
