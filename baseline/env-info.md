# 측정 환경 (baseline)

측정 날짜: 2026-07-15

| 항목 | 값 | 신뢰도 |
| --- | --- | --- |
| OS | Windows 10 Pro, 버전 10.0.19045 | ①코드검증 |
| CPU | AMD Ryzen 5 2400G with Radeon Vega Graphics (4코어 / 8논리프로세서) | ①코드검증 |
| RAM | 16GB (4GB+8GB+4GB 3개 모듈, TotalPhysicalMemory 기준 약 14.95GiB 인식) | ①코드검증 |
| Node.js | v22.22.3 | ①코드검증 |
| npm | 10.9.8 | ①코드검증 |
| Chrome | 150.0.7871.115 | ①코드검증 |
| Lighthouse | 13.4.0 (npx) | ①코드검증 |
| Playwright | 1.61.1 (Chromium 1228, ffmpeg 1011 로컬 캐시) | ①코드검증 |
| 네트워크 환경 | 측정 불가 — 회선 속도계(스피드테스트 도구) 미설치, 신규 외부 도구 도입은 계획 범위 밖으로 판단해 생략 | — |

## 참고

- CPU/RAM은 `wmic cpu get name,numberofcores,numberoflogicalprocessors` / `wmic memorychip get capacity` / `wmic computersystem get totalphysicalmemory` 실측
- OS는 PowerShell `[System.Environment]::OSVersion.VersionString` + `Get-CimInstance Win32_OperatingSystem` 실측
- 이 문서에 기록된 사양이 이후 모든 §2(라이브)·§3(레포) 수치의 측정 머신 기준이다.
