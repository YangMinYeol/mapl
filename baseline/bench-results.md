# 레포 기반 측정 (baseline §3)

측정 환경: [env-info.md](env-info.md) 참고 (2026-07-15, Windows 10 Pro, Ryzen 5 2400G, 16GB RAM, Node v22.22.3)
모든 수치는 이번 세션에 현재 머신에서 재실측(②관측확인). 캐시는 매 실행 전 삭제, 3회 median.

## 프로덕션 빌드

`frontend/dist` + `node_modules/.vite` 삭제 후 `npm run build` × 3:

| run | 소요 시간 |
| --- | --- |
| 1 | 15,872ms |
| 2 | 12,493ms |
| 3 | 11,879ms |
| **median** | **12,493ms (12.5초)** |

산출물 크기 (청크가 1개뿐 — 코드 스플리팅 미설정, Vite가 빌드 시 500KB 초과 경고 표시):

| 파일 | raw | gzip |
| --- | --- | --- |
| index-*.js (단일 청크) | 737,284B (720KB) | 233,765B (228KB) |
| index-*.css (단일 청크) | 25,747B (25KB) | 5,817B (5.7KB) |
| dist/ 총합 | 792KB | — |

## 번들 구성 분석

`npx vite-bundle-visualizer` → [bundle-report/visualizer.html](bundle-report/visualizer.html)
상위 10개 의존성(렌더링 크기 기준): [bundle-report/top10-dependencies.md](bundle-report/top10-dependencies.md)

| 순위 | 패키지 | 크기(KB) | 비중 |
| --- | --- | --- | --- |
| 1 | recharts | 350.3 | 32.2% |
| 2 | react-dom | 131.7 | 12.1% |
| 3 | @dnd-kit | 119.6 | 11.0% |
| 4 | date-fns | 117.0 | 10.7% |
| 5 | @fortawesome | 115.2 | 10.6% |
| 6 | es-toolkit | 62.1 | 5.7% |
| 7 | react-modal | 46.9 | 4.3% |
| 8 | d3-scale (recharts 내부) | 28.0 | 2.6% |
| 9 | d3-shape (recharts 내부) | 23.9 | 2.2% |
| 10 | d3-time-format (recharts 내부) | 18.7 | 1.7% |

recharts는 d3-* 계열까지 포함하면 실질적으로 번들의 40% 이상을 차지하는 최대 단일 요인이다 [②관측확인].

## 개발 서버 콜드스타트 (Vite만 — CRA는 이미 마이그레이션되어 비교 대상 없음)

`node_modules/.vite` 삭제 → `npm run dev` → HTTP 200 응답까지 × 3:

| run | 소요 시간 |
| --- | --- |
| 1 | 2,868ms |
| 2 | 1,794ms |
| 3 | 1,675ms |
| **median** | **1,794ms (1.8초)** |

## calendar-tag-perf (달력 태그 배치 계산)

시나리오: 월 278건 메모(데일리 8건×31일 + 기간메모 30건), 6주 달력, 100회 반복 평균 × 3회

| run | ms/호출 |
| --- | --- |
| 1 | 2.46 |
| 2 | 1.76 |
| 3 | 1.79 |
| **median** | **1.79ms/호출** |

## loaded-flag-refetch (카테고리 캐시 가드)

로그인 1회 + 가계부 모달 왕복 5회 시나리오:

- `loaded` 가드 있음(현재 코드): fetch 1회
- 가드 제거(비교군): fetch 6회
- **절감: 5회 (83%)**

## pool-vs-client (DB 커넥션 구조)

대상: Neon Postgres (읽기 전용 쿼리만)

- 트랜잭션 인터리빙: 공유 Client → B가 A의 트랜잭션 내부에서 실행됨(txid 동일, `true`) / Pool → 격리됨(txid 다름, `false`)
- 동시 20요청 × 50ms 작업 × 3회:

| run | 단일 Client | Pool(max=10) |
| --- | --- | --- |
| 1 | 2,521ms | 768ms |
| 2 | 2,504ms | 748ms |
| 3 | 2,510ms | 737ms |
| **median** | **2,510ms** | **748ms** |

→ **3.4배 (70% 단축)**

## lighthouse-preview (로컬 vite preview, :4173)

| run | FCP | LCP | TBT | score |
| --- | --- | --- | --- | --- |
| 1 | 571ms | 656ms | 0ms | 100 |
| 2 | 542ms | 791ms | 0ms | 99 |
| 3 | 537ms | 798ms | 0ms | 96 |
| **median** | **542ms** | **791ms** | **0ms** | **99** |

## first-load-waterfall (로컬 preview + 로컬 backend, 비로그인 첫 진입)

요청 수: 12개, median 총 소요 **5,529ms**

가장 눈에 띄는 병목은 로컬 API가 아니라 **외부 공휴일 공공데이터 API**(apis.data.go.kr)다:

| 요청 | 시작 | 소요 |
| --- | --- | --- |
| /api/period, /api/color (로컬 backend) | +183~193ms | 538~561ms |
| 공휴일 API (7월) | +816ms | 100ms |
| 공휴일 API (8월) | +918ms | **2,461ms** |
| 공휴일 API (9월) | +3,381ms | **2,287ms** |

3개월치 공휴일 조회가 순차 실행되며 총 소요의 대부분(약 4.8초/5.5초)을 차지한다 — 로컬 DB/API가 아니라
**외부 공공 API 응답 지연이 첫 진입 체감 속도의 실질적 병목** [②관측확인]. (참고: `apis.data.go.kr` 요청 URL에
서비스키가 쿼리 파라미터로 그대로 노출되는 것도 확인됨 — §5 참고.)

## 코드 규모

| 영역 | 파일 수 | 코드 줄 수(js/jsx/css) |
| --- | --- | --- |
| frontend/src | 117 (jsx 76 + js 41) | 8,339 |
| backend | 34 (js) + 2 (json) | 4,952 |

frontend/src 세부 디렉터리별 파일 수:

| 디렉터리 | 개수 |
| --- | --- |
| components | 65 |
| hooks | 8 |
| util | 12 |
| pages | 5 |
| stores | 2 |
| context | 3 |

CSS: `main.css` 37줄만 실사용, `App.css`/`Calendar.css`는 0줄(빈 파일, Tailwind v4 CSS-first 전환 후 잔존하는 dead 파일 — 고치지 않고 기록만 함) [①코드검증]

의존성 개수:

| | dependencies | devDependencies |
| --- | --- | --- |
| frontend | 19 | 7 |
| backend | 11 | 1 |

주요 버전: React 18.3.1, Vite 6.2.0, Express 4.21.2, pg 8.13.1, Tailwind CSS 4.0.9 (package.json 기준, ①코드검증)
