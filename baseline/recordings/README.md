# 인터랙션 녹화 (baseline §1)

- 파일: `desktop-full-session.webm` (1920x1080, Playwright `recordVideo`로 자동 녹화)
- 도구: Playwright 1.61.1 + Chromium(로컬 캐시), 대상: https://mapl.vercel.app/ (실측, 2026-07-15)
- 내용: `baseline/scripts/capture.js desktop` 전체 세션 1회 연속 녹화. 로그인 → 메모 Day/Week/Month/Year
  전환 → 메모 빠른 추가 → 메모 상세 모달 → 미루기 → 링크 메모 생성(Week에 원본 작성 → Day에서 링크 연결)
  → 링크 모달 확인 → 링크 완료 처리 → 가계부 탭 전환 → 가계부 Day/Week/Month/Year → 가계부 모달 →
  월 이동(다음달/이전달) → 게시판 3종 탭 → 게시글 상세/작성 폼 → 마이페이지(비밀번호 재확인/정보수정) →
  가계부 카테고리 페이지까지 하나의 세션으로 이어진다.
- 각 구간의 정확한 타임스탬프는 기록하지 않았음(단일 연속 녹화) — 구간을 찾으려면
  `../manifest-desktop.json`의 `report` 배열 순서(스텝 실행 순서)를 참고해 대략적인 위치를 가늠할 수 있다.
- 실패했던 이전 시도(3회: 로그인 경로 404, 비밀번호 오류) 영상은 재현 가치가 없어 삭제하고 최종 성공 1회만 보존.
