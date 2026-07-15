# 구조 스냅샷 (baseline §5) — v2 설계 입력값

## API 엔드포인트 전체 목록

`backend/route/*.js` 10개 파일 기준(①코드검증). `verifyToken`이 없으면 비로그인 접근 가능.

| 메서드 | 경로 | 인증 | 용도 |
| --- | --- | --- | --- |
| POST | /api/user/login | - | 로그인 |
| POST | /api/user/signup | - | 회원가입 |
| POST | /api/user/check-duplicate | - | 아이디/이메일 중복 검사 |
| POST | /api/user/refresh | - | 리프레시 토큰 갱신 |
| POST | /api/user/verify-password | ✅ | 비밀번호 재검증 |
| DELETE | /api/user/me | ✅ | 회원탈퇴 |
| PATCH | /api/user/me | ✅ | 회원정보 수정 |
| GET | /api/memo | ✅ | 메모 목록(대시보드) |
| GET | /api/memo/calendar | ✅ | 달력용 메모 목록 |
| POST | /api/memo | ✅ | 메모 추가 |
| PATCH | /api/memo | ✅ | 메모 수정 |
| DELETE | /api/memo | ✅ | 메모 삭제 |
| DELETE | /api/memo/linked/:linkId | ✅ | 링크된 메모 일괄 삭제 |
| POST | /api/memo/complete | ✅ | 메모 완료 상태 변경 |
| POST | /api/memo/complete-linked | ✅ | 링크된 메모 완료 상태 일괄 변경 |
| POST | /api/memo/postpone | ✅ | 메모 미루기 |
| GET | /api/memo/linked/:linkId | ✅ | 링크된 메모 목록 |
| POST | /api/memo/unlink | ✅ | 메모 링크 해제 |
| GET | /api/period | - | 기한 타입 목록(Day/Week/Month/Year/Other) |
| GET | /api/color | - | 색상 목록 |
| GET | /api/account-book | ✅ | 가계부 대시보드 목록 |
| GET | /api/account-book/calendar | ✅ | 달력용 가계부 목록 |
| POST | /api/account-book | ✅ | 가계부 항목 추가 |
| PATCH | /api/account-book | ✅ | 가계부 항목 수정 |
| DELETE | /api/account-book | ✅ | 가계부 항목 삭제 |
| GET | /api/account-book-category | ✅ | 유저별 가계부 카테고리 목록 |
| POST | /api/account-book-category | ✅ | 가계부 카테고리 추가 |
| PATCH | /api/account-book-category | ✅ | 가계부 카테고리 수정 |
| DELETE | /api/account-book-category/:categoryId | ✅ | 가계부 카테고리 삭제 |
| PATCH | /api/account-book-category/reorder | ✅ | 가계부 카테고리 재정렬(드래그앤드롭) |
| GET | /api/asset | ✅ | 자산 조회 |
| GET | /api/notice | - | 공지사항 목록 |
| POST | /api/notice | ✅ | 공지사항 등록(이미지 포함) |
| PUT | /api/notice/:id | ✅ | 공지사항 수정 |
| DELETE | /api/notice/:id | ✅ | 공지사항 삭제 |
| GET | /api/free | - | 자유게시판 목록 |
| POST | /api/free | ✅ | 자유게시판 등록(이미지 포함) |
| PUT | /api/free/:id | ✅ | 자유게시판 수정 |
| DELETE | /api/free/:id | ✅ | 자유게시판 삭제 |
| GET | /api/report | - | 오류 보고 목록 |
| POST | /api/report | ✅ | 오류 보고 등록(이미지 포함) |
| PUT | /api/report/:id | ✅ | 오류 보고 수정 |
| DELETE | /api/report/:id | ✅ | 오류 보고 삭제 |
| PATCH | /api/report/:id/status | ✅ | 오류 보고 진행 상태 변경 |
| GET | /health | - | 헬스체크(UptimeRobot용) |

총 41개 엔드포인트(health 제외 40개) [①코드검증]

## DB 스키마 (ERD, 텍스트)

13개 테이블, `baseline/db-dump/schema.sql`(①코드검증, information_schema 기반 재구성) 기준.
DB 총 용량 8,720kB, 총 row 수는 `db-dump/db-info.md` 참고.

```
users (9 rows)
 ├─ 1:N → memo.user_id
 ├─ 1:N → account_book.user_id
 ├─ 1:N → account_book_category.user_id
 ├─ 1:1 → asset.user_id (실질적으로 유저당 자산 1건)
 ├─ 1:N → free.user_id / notice.user_id / report.user_id

period_type (5 rows: Day/Week/Month/Year/Other)
 └─ 1:N → memo.period_id

color (10 rows)
 ├─ 1:N → memo.color_id (기본값 10)
 └─ 1:N → account_book_category.color_id (기본값 10)

memo (1,469 rows)
 ├─ FK user_id → users, color_id → color, period_id → period_type
 └─ FK link → memo.id (자기 참조, 링크 메모 그룹 키)

account_book_category (61 rows)
 ├─ FK user_id → users, color_id → color
 └─ 1:N → account_book.category_id

asset (9 rows)
 ├─ FK user_id → users
 └─ 1:N → account_book.asset_id

account_book (724 rows)
 └─ FK user_id → users, category_id → account_book_category, asset_id → asset

free / notice / report (각 55 / 1 / 6 rows) — 게시판 3종, 구조 동일
 └─ 각각 1:N → free_image / notice_image / report_image (url만 저장)
```

## 스키마 개선 후보 (고치지 말고 — 관찰만)

- **FK 컬럼에 인덱스 없음**: `memo.user_id`, `account_book.user_id` 등 조회에 자주 쓰이는 외래키 컬럼에
  PK 외의 인덱스가 전혀 없다(`db-dump/db-info.md` 인덱스 목록 참고). 현재 row 수(최대 1,469건)에서는
  체감 영향이 없지만 데이터가 늘면 풀스캔 위험.
- **`memo.link` 자기참조 FK에 `ON DELETE` 미지정**: 링크 그룹의 원본 메모가 삭제될 때의 동작이 DB
  제약이 아니라 애플리케이션 로직(`deleteLinkedMemos`)에 전적으로 의존.
- **`account_book.type`, `account_book_category.type`, `report.status`가 `varchar`**: enum이나
  CHECK 제약 없이 자유 문자열이라 오탈자성 데이터 유입을 DB가 막아주지 않음(애플리케이션 상수로만 관리).
- **`color_id`/`period_id` 기본값이 매직넘버(10, 1)**: 시드 데이터의 특정 row에 암묵적으로 의존.

## 라우트 ↔ 컴포넌트 매핑

`frontend/src/App.jsx` 기준(①코드검증). 참고: 라이브 배포(Vercel)에 SPA rewrite 설정이 없어
`/` 이외의 경로는 직접 URL 접근·새로고침 시 404가 발생함을 실측으로 확인(§2 참고) — 아래 경로들은
모두 클라이언트 라우팅(내부 Link 이동)으로만 도달 가능하다.

| 경로 | 페이지 컴포넌트 | 주요 하위 컴포넌트 |
| --- | --- | --- |
| `/` | MainPage | Calendar(+CalendarHeader/CalendarDays/DropdownCalendar), Dashboard(MemoDashboard/AccountBookDashboard), MemoModal, AccountBookModal, LinkModal |
| `/login` | LoginPage | FloatingLabelInput, PrimaryButton |
| `/signup` | SignupPage | FloatingLabelInput, react-daum-postcode |
| `/board` | BoardPage | BoardTabs, BoardHeader, BoardList, BoardPost, NoticeBoard/FreeBoard/ReportBoard |
| `/user/profile` | UserPage → PasswordCheck | UserSidebar |
| `/user/profile/edit` | UserPage → ProfileEdit | UserSidebar, react-daum-postcode |
| `/user/accountbook/category` | UserPage → AccountBookCategory | UserSidebar, @dnd-kit(드래그 정렬), AccountBookCategoryModal |

`/`(MainPage)는 URL 분리 없이 클라이언트 상태(`activeTab`: 메모/가계부)로 두 도메인 화면을
전환한다 — 이 때문에 Lighthouse 같은 URL 기반 도구로는 "가계부 화면"만 따로 측정할 수 없다(§2 참고).
