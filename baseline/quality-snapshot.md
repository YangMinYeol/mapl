# 품질 스냅샷 (baseline §4)

측정 도구/날짜: Playwright 1.61.1 + Chromium(§1 캡처 세션), Lighthouse 13.4.0, axe-core 4.12.1 — 2026-07-15

## 콘솔 에러/경고 (페이지별)

`baseline/scripts/capture.js` 실행 중 `page.on("console")`/`page.on("pageerror")`로 전 페이지·전 상태를 수집(원본: `baseline/manifest-desktop.json`, `baseline/manifest-mobile.json`).

| 뷰포트 | 에러 | 경고 |
| --- | --- | --- |
| desktop | 4건 | 0건 |
| mobile | 2건 | 0건 |

전부 의도적으로 유발한 "잘못된 로그인" 테스트(401 응답 + 클라이언트 에러 핸들러 로그)뿐이며,
그 외 32개 캡처 스텝(로그인~가계부 카테고리까지 전 화면) 어디에서도 의도치 않은 콘솔 에러/경고는
관측되지 않았다 [②관측확인].

## 접근성(a11y)

Lighthouse accessibility 카테고리 점수는 4개 측정 대상(랜딩/로그인 후, desktop/mobile) 전부 동일하게 **61점**
(`baseline/lighthouse/*-summary.json`). 감점 항목(랜딩 desktop 기준, `landing-desktop-run1.json`):

| 감사 항목 | 내용 | 위반 건수 |
| --- | --- | --- |
| button-name | 버튼에 접근 가능한 이름(텍스트/aria-label)이 없음 | 4건 |
| color-contrast | 전경/배경 명도 대비 부족 | 11건 |
| label | 폼 요소에 연결된 label 없음 | 1건 |
| select-name | select 요소에 접근 가능한 이름 없음 | 1건 |
| target-size | 터치 타겟 크기/간격 부족 | 2건 |
| landmark-one-main | 문서에 main 랜드마크 없음 | 1건 |

axe-core CLI(`npx @axe-core/cli`, 랜딩 페이지 기준, 원본 `baseline/lighthouse/axe-landing.json`)로 교차 확인 —
Lighthouse가 못 잡는 **region**(콘텐츠가 랜드마크에 포함되지 않음, 5건) 위반을 추가로 발견:

| 위반 | 건수 |
| --- | --- |
| button-name | 4 |
| label | 1 |
| region | 5 |
| select-name | 1 |

→ 두 도구 결과가 button-name/label/select-name에서 서로 검증되어 신뢰도가 높다 [②관측확인].
FontAwesome 아이콘 전용 버튼(미루기/링크/수정/삭제 아이콘 버튼 등)에 접근 가능한 이름이 없는 것이
button-name 위반의 주 원인으로 추정된다(코드상 `title` 속성은 있으나 스크린리더가 인식하는
`aria-label`/텍스트가 아님).

## 리렌더 횟수 (Calendar / Dashboard)

기존 코드에는 리렌더 카운터 장치가 없어(측정을 위해 사전 확인), `console.count()`를 **임시로만** 삽입해
로컬 dev 서버(`:5173`, React 18 **StrictMode** 활성 상태 — 개발 모드에서 렌더가 의도적으로 2배 유발됨)에서
측정한 뒤 즉시 `git checkout`으로 원복(diff 없음 확인 완료).

| 시점 | Calendar render 누적 | Dashboard render 누적 | 증가분 |
| --- | --- | --- | --- |
| 초기 로드 후 | 20 | 20 | — |
| 탭 전환(메모→가계부) 후 | 22 | 22 | +2 / +2 |
| 월 이동(다음달) 후 | 28 | 28 | +6 / +6 |

Calendar와 Dashboard가 항상 같은 횟수로 리렌더된다 — 두 컴포넌트가 `MainPage`의 공통 상태
(`currentDate`, `activeTab` 등)를 그대로 props로 받아 형제 컴포넌트로서 함께 리렌더되는 구조이기 때문
[③계산값·코드 경로 추적]. StrictMode로 인해 실제 프로덕션 빌드에서는 이 수치의 절반 수준일 가능성이 높다
(별도 실측은 하지 않음 — "측정 불가" 섹션 참고).

## INP (실사용 인터랙션)

라이브 사이트(mapl.vercel.app) 대상, `frontend`의 `web-vitals` 패키지(이미 의존성으로 존재, 신규 설치 없음)
IIFE 번들을 주입해 실측(원본: `baseline/quality-inp.json`). `onINP`는 세션 내 "누적 최악값"을 보고하는
지표라 아래 3개 값은 개별 인터랙션 단독 측정이 아니라 그 시점까지의 최댓값이다.

| 인터랙션 | 누적 INP 최댓값 |
| --- | --- |
| 탭 전환(메모→가계부) | 40ms |
| 가계부 입력 모달 열기 | 40ms |
| 월 이동(다음달) | 40ms |

세 인터랙션 모두 "Good" 기준(200ms 미만)을 크게 하회한다 — 로그인 클릭 등 세션 초반 인터랙션이 이미
40ms 최댓값을 기록해 이후 값이 갱신되지 않았을 가능성이 있어, 개별 인터랙션이 정확히 40ms라기보다
"40ms 이하"로 해석하는 것이 정확하다 [②관측확인].
