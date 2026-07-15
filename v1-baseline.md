# Mapl v1 Baseline

Mapl v2(Next.js 풀 리라이트) 착수 전 v1 저장소와 라이브 서비스(https://mapl.vercel.app/)의 상태를
"다시는 측정 못 한다"는 전제로 박제한 기록이다. 모든 수치는 추측 없이 실측만 담았고, 실행하지 못한
항목은 맨 아래 [측정 불가였던 항목과 이유](#측정-불가였던-항목과-이유)에 사유와 함께 남겼다.

- **측정 날짜**: 2026-07-15
- **재현 지점**: git tag `v1-baseline` (레포 기반 수치는 이 커밋에서 재현 가능)
- **측정 머신**: Windows 10 Pro, AMD Ryzen 5 2400G(4C/8T), RAM 16GB, Node v22.22.3 — 상세는 [baseline/env-info.md](baseline/env-info.md)
- **신뢰도 태그**: ①코드검증(코드/설정 직접 확인) · ②관측확인(스크립트·도구로 실측) · ③계산값(코드 경로 추적 등으로 도출)

---

## 0. 박제

| 항목 | 내용 | 신뢰도 |
| --- | --- | --- |
| git tag | `v1-baseline` (현재 커밋) | ①코드검증 |
| DB 덤프 | 13개 테이블, 스키마+데이터 → `baseline/db-dump/`(gitignore 처리, PII 포함) | ②관측확인 |
| DB 총 용량 | 8,720 kB | ②관측확인 |
| DB 총 row 수 | memo 1,469 / account_book 724 / account_book_category 61 / free 55 / users 9 / asset 9 / report 6 / color 10 / period_type 5 / notice·free_image·notice_image·report_image 소수 | ②관측확인 |
| 측정 환경 | OS/CPU/RAM/Node/Chrome/Lighthouse/Playwright 버전 | ①코드검증 |

pg_dump/psql이 로컬에 없어 Node 자체 스크립트(`baseline/scripts/db-dump.js`)로 스키마(information_schema
재구성)와 데이터(CSV)를 덤프했다. 상세는 [baseline/db-dump/db-info.md](baseline/db-dump/db-info.md).

---

## 1. 시각 자료

Playwright(`baseline/scripts/capture.js`)로 데스크톱(1920×1080)·모바일(375×812) 각 32개 상태를
자동 스크린샷(총 60장, `baseline/screenshots/`) + 데스크톱 전체 세션 연속 녹화
(`baseline/recordings/desktop-full-session.webm`, 약 9.5MB).

- 로그인/회원가입/에러 상태, 메모·가계부 각 Day/Week/Month/Year 뷰, 메모 작성·링크·완료·미루기,
  가계부 입력, 월 이동, 게시판 3종(목록/상세/작성폼), 마이페이지, 가계부 카테고리 페이지까지 커버
- 수동 확인이 더 적절한 항목(호버 툴팁, 드래그앤드롭 등)은 [baseline/screenshots/manual-checklist.md](baseline/screenshots/manual-checklist.md)에 체크리스트로 별도 정리
- **부수 발견 [②관측확인]**: 모바일(375px) 뷰포트에서 고정폭 모달(메모 550px/가계부 400px)이 화면
  밖으로 넘치고, 게시판 사이드 탭 등 레이아웃 전체가 `min-w-[910px]`(Header)로 고정되어 있어
  **v1은 모바일 반응형 디자인이 전혀 구현되어 있지 않음**을 확인 — v2의 핵심 비교 포인트

---

## 2. 라이브 환경 측정

### 2-A. Lighthouse (mapl.vercel.app, 3회 median)

인증 상태 측정은 Playwright로 실제 로그인해 만든 Chrome 프로필을 `--user-data-dir` +
`--disable-storage-reset`으로 재사용(로그인 상태 유지 확인).

| 대상 | 폼팩터 | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 랜딩(비로그인 `/`) | desktop | 95 | 61 | 100 | 100 | 539ms | 539ms | 0ms | 0 | 2,270ms |
| 랜딩(비로그인 `/`) | mobile | 83 | 61 | 100 | 100 | 2,497ms | 2,932ms | 91ms | 0 | 6,555ms |
| 로그인 후 `/`(달력) | desktop | 100 | 61 | 100 | 100 | 544ms | 544ms | 0ms | 0 | 835ms |
| 로그인 후 `/`(달력) | mobile | 91 | 61 | 100 | 100 | 2,385ms | 2,514ms | 110ms | 0 | 2,874ms |

원본 JSON: `baseline/lighthouse/*-run{1,2,3}.json`, 요약: `*-summary.json` [②관측확인]

**"가계부" 화면은 별도 측정 불가** — `/`와 동일 URL의 클라이언트 탭 상태라 Lighthouse가 새 탐색으로
집을 수 없음(§4 리렌더/INP로 인터랙션 자체는 별도 기록).

**중요 발견 [①코드검증+②관측확인]**: 배포에 `vercel.json` rewrite 설정이 없어 `/login`, `/board` 등
`/` 이외의 모든 경로가 **직접 접근·새로고침 시 Vercel 404**를 반환한다(`curl`/Lighthouse 모두로 확인).
Lighthouse로 `/board`를 감사 시도하면 "Lighthouse was unable to reliably load the page... Status
code: 404" 런타임 에러로 감사 자체가 거부됨. 이 때문에 아래 §2 전체와 §1 캡처 스크립트는 반드시
"/"에서 시작해 클라이언트 라우팅(Link 클릭)으로만 이동하도록 작성했다.

### 2-B. 초기 로드 네트워크 (랜딩, desktop 기준)

Lighthouse network-requests 감사 기준(요청 12개, 총 전송량 257,888B ≈ 252KB):

| 타입 | 요청 수 | 전송량 |
| --- | --- | --- |
| Script | 1 | 237,960B |
| Fetch(API) | 5 | 2,478B |
| Stylesheet | 2 | 7,352B |
| Other | 1 | 4,436B |
| Image | 1 | 4,453B |
| Document | 1 | 1,209B |
| Preflight | 1 | 0B |

### 2-C. 초기 HTML / JS 비활성화

- `curl https://mapl.vercel.app/` 원문 887B 저장(`baseline/network/index.html.txt`) — SPA 빈 `<div id="root">`,
  `noscript` 안내문, **create-react-app 시절 메타 description이 Vite 전환 후에도 그대로 남아있음**(dead 텍스트, 고치지 않고 기록만)
- JS 비활성화 스크린샷: `baseline/network/js-disabled-desktop.png` — "You need to enable JavaScript to run this app." 외 완전 공백 [②관측확인]

### 2-D. API 응답 지연 (배포 서버 https://mapl.onrender.com 경유, 각 10회, 워밍업 1회 후)

| 엔드포인트 | p50 | p95 |
| --- | --- | --- |
| POST /api/user/login | 399ms | 693ms |
| GET /api/memo | 137ms | 404ms |
| GET /api/account-book | 136ms | 180ms |

콜드스타트(세션 내 첫 `/health` 요청): 401ms — 이번 세션에서는 Render 무료 티어의 "최대 1분" 슬립
지연이 관측되지 않음(직전 측정들로 서버가 이미 warm 상태였을 가능성, §측정 불가 참고) [②관측확인].
로그인이 메모/가계부 목록보다 3배 가까이 느린 것은 bcrypt 해시 비교 비용으로 추정 [③계산값].

### 2-E. 시나리오 요청 수 (로그인→달력 진입→탭 전환 1회→월 이동 1회)

**총 19개 API 요청** (`baseline/network/scenario-requests.json`):
- 로그인 전(공개 데이터) 2회 + 로그인 1회 + 초기 로드 14회 + 탭 전환 2회 + 월 이동 2회
- 초기 로드에서 `/api/memo`, `/api/memo/calendar`, `/api/account-book`, `/api/account-book/calendar`,
  `/api/account-book-category`, `/api/asset`, `/api/period`가 **중복 호출**되는 지점이 실제로 확인됨
  (메모·가계부 도메인 매니저 훅이 각자 초기 로드를 수행 — 근거-mapl.md에 언급된 "초기 진입 요청
  2회→4회" 트레이드오프의 실측 재현) [②관측확인]

---

## 3. 레포 기반 측정

상세 전체: [baseline/bench-results.md](baseline/bench-results.md)

| 항목 | 결과 | 신뢰도 |
| --- | --- | --- |
| 프로덕션 빌드(3회 median) | 12,493ms | ②관측확인 |
| 빌드 산출물 | JS 720KB(gzip 228KB) 단일 청크 + CSS 25KB(gzip 5.7KB) — 코드 스플리팅 없음, Vite 500KB 경고 발생 | ②관측확인 |
| 번들 상위 의존성 | recharts 32.2%(d3-* 포함 시 40%+), react-dom 12.1%, @dnd-kit 11.0%, date-fns 10.7% | ②관측확인 |
| 개발 서버 콜드스타트(Vite, 3회 median) | 1,794ms | ②관측확인 |
| calendar-tag-perf(월 278건 기준, 3회 median) | 1.79ms/호출 | ②관측확인 |
| loaded-flag-refetch (카테고리 캐시 가드) | 6회→1회 (83% 절감) | ②관측확인 |
| pool-vs-client (동시 20요청) | 2,510ms→748ms (3.4배, 70% 단축) | ②관측확인 |
| lighthouse-preview(로컬, 3회 median) | FCP 542ms / LCP 791ms / TBT 0ms / score 99 | ②관측확인 |
| first-load-waterfall(로컬, 비로그인) | 요청 12개, 총 5,529ms — **병목은 로컬이 아니라 외부 공휴일 공공API**(3개월치 순차 호출이 약 4.8초 차지) | ②관측확인 |
| 코드 규모 | frontend/src 117파일/8,339줄, backend 34파일/4,952줄 | ②관측확인 |
| 컴포넌트/훅/유틸 개수 | components 65, hooks 8, util 12, pages 5, stores 2, context 3 | ②관측확인 |
| 의존성 개수 | frontend 19+7(dev), backend 11+1(dev) | ①코드검증 |

---

## 4. 품질 스냅샷

상세: [baseline/quality-snapshot.md](baseline/quality-snapshot.md)

| 항목 | 결과 |
| --- | --- |
| 콘솔 에러/경고(32개 상태 전수) | 의도한 로그인 실패 테스트 외 0건 (desktop 4건/mobile 2건 모두 동일 원인) |
| 접근성(Lighthouse) | 4개 대상 전부 61점 — button-name(4)·color-contrast(11)·label(1)·select-name(1)·target-size(2)·landmark-one-main(1) |
| 접근성(axe-core 교차검증) | button-name/label/select-name 일치 확인 + Lighthouse가 못 잡는 region(랜드마크 누락) 5건 추가 발견 |
| 리렌더 횟수(Calendar/Dashboard, 로컬 dev+StrictMode) | 탭 전환 +2/+2, 월 이동 +6/+6 (두 컴포넌트 항상 동일 — 형제 컴포넌트로 함께 리렌더) |
| INP(라이브, web-vitals 실측) | 탭 전환/모달 열기/월 이동 모두 누적 최댓값 40ms (Good 기준 200ms 대비 여유) |

---

## 5. 구조 스냅샷

상세: [baseline/structure-snapshot.md](baseline/structure-snapshot.md)

- API 엔드포인트 **41개**(라우트 파일 10개 기준) 전체 목록 정리
- DB 스키마 13개 테이블 텍스트 ERD, 스키마 개선 후보(FK 인덱스 부재, `memo.link` ON DELETE 미지정 등)는
  "고치지 말고" 섹션에만 별도 기록
- 라우트 7개 ↔ 페이지 컴포넌트 ↔ 주요 하위 컴포넌트 매핑

---

## 산출물 인덱스

```
v1-baseline.md              ← 이 문서
baseline/
  env-info.md                측정 환경
  bench-results.md            §3 상세
  quality-snapshot.md          §4 상세
  structure-snapshot.md        §5 상세
  db-dump/                    §0 (schema.sql, db-info.md, data/*.csv — gitignore 처리)
  screenshots/                §1 (desktop/, mobile/, manual-checklist.md)
  recordings/                 §1 (desktop-full-session.webm, README.md)
  lighthouse/                 §2-A 원본 JSON + axe-core 결과
  network/                    §2-B~E (curl 원문, JS-off 스크린샷, API 지연/시나리오 JSON)
  bundle-report/               §3 (visualizer.html, top10-dependencies.md)
  quality-inp.json             §4 INP 원본
  manifest-desktop.json/manifest-mobile.json  §1 콘솔 로그 + 스텝 실행 결과 원본
  scripts/                    측정에 사용한 모든 스크립트 (재실행 가능)
```

---

## 측정 불가였던 항목과 이유

- **네트워크 회선 속도**: 스피드테스트 도구가 로컬에 없고, 이번 baseline을 위해 신규 외부 도구를
  들여오는 것은 범위 밖으로 판단해 생략. (env-info.md에 "측정 불가"로 명시)
- **"가계부" 단독 Lighthouse 측정**: `/`와 동일 URL의 클라이언트 탭 상태라 URL 기반 도구로 분리 측정 불가.
  대신 §4에서 탭 전환 인터랙션 자체의 리렌더/INP로 보완.
- **`/board` 등 non-root 경로 Lighthouse 측정**: Vercel에 SPA rewrite가 없어 직접 접근 시 404 —
  Lighthouse가 "unable to reliably load the page" 런타임 에러로 감사를 거부함(§2-A 기록).
- **Render 콜드스타트(최대 1분) 실측**: 이번 세션에서는 직전 측정들로 서버가 이미 warm 상태였어서
  실제 슬립 후 첫 요청 지연을 관측하지 못함(§2-D 콜드스타트 401ms는 warm 상태 값).
- **호버 툴팁 등 마이크로 인터랙션 자동 캡처**: 자동화보다 수동 확인이 적절하다고 판단해
  `baseline/screenshots/manual-checklist.md`로 체크리스트만 남김.
- **프로덕션 빌드 기준 리렌더 횟수**: React 18 StrictMode가 활성화된 로컬 dev 서버로만 측정했고,
  실제 프로덕션 빌드(minify + StrictMode 이중 렌더 없음)로는 별도 재현하지 않음 — dev 수치의 약
  절반으로 추정만 가능(③계산값 수준의 근사조차 하지 않고 dev 실측값 그대로 기록).
- **게시판 자유게시판 실제 게시글 등록**: 라이브 공개 게시판에 테스트 게시물이 영구히 남는 것을
  피하기 위해 작성 폼 화면만 캡처하고 실제 제출(등록)은 하지 않음.
- **README 테스트 계정 비밀번호 오기**: README.md에는 `mplatest3#`로 기재돼 있으나 실제로는
  `mapltest3#`임을 실측(401→200)으로 확인 — 이번 작업 범위(측정)를 벗어나 README 자체는 수정하지 않음.
