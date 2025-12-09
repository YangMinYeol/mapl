# 일정 관리 웹서비스 Mapl(My Planner)

![마플 미리보기](/frontend/src/assets/images/readme/mapl_preview.png)

| 배포 URL                 | 계정      | 패스워드   |
| ------------------------ | --------- | ---------- |
| https://mapl.vercel.app/ | mapltest3 | mplatest3# |

- 초기 접속 시 서버 활성화로 인해 잠시 지연될 수 있습니다.

---

### 프로젝트 소개

Mapl(My Planner)는 달력을 중심으로 메모와 가계부를 간편하게 관리할 수 있는 개인 맞춤형 플래너 웹서비스입니다.

- 하루, 주, 월, 연 단위의 기록을 자연스럽게 연결해 사용자가 자신의 생활 패턴을 효율적으로 정리할 수 있도록 구성했습니다.
- 가계부 데이터를 기반으로 수입·지출의 카테고리별 비중을 그래프로 시각화해 한눈에 파악할 수 있습니다.
- 공지사항, 자유 게시판, 오류보고 게시판을 제공하여 사용자 간의 가벼운 소통도 가능하도록 만들었습니다.

---

### 기술 스택

##### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

##### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

##### Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

##### Deployment

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white) ![Neon](https://img.shields.io/badge/Neon-00E699?style=for-the-badge&logo=neon&logoColor=white) ![UptimeRobot](https://img.shields.io/badge/UptimeRobot-2ECC71?style=for-the-badge&logo=uptimerobot&logoColor=white)

#### 주요 라이브러리

- **상태 관리**: Zustand
- **라우팅**: React Router DOM
- **데이터 시각화**: Recharts
- **드래그 앤 드롭**: @dnd-kit
- **인증/보안**: bcrypt, JWT
- **파일 업로드**: Multer, Cloudinary
- **외부 API**: Daum Postcode API
- **UI/UX**: FontAwesome, React Modal
- **날짜 처리**: date-fns

---

### 주요 기능

#### 초기화면

![초기화면](/frontend/src/assets/images/readme/calendar.png)

- Mapl 접속 시 기본 화면으로, **좌측에는 월별 달력, 우측에는 메모 및 가계부 내역**이 표시됩니다.
- 메모 또는 가계부(수입/지출) 등록하면 달력과 대시보드에 실시간으로 반영됩니다.
- 비로그인 상태에서 데이터 등록 시도 시 자동으로 로그인 페이지로 이동합니다.

#### 로그인

![로그인](/frontend/src/assets/images/readme/login.gif)

- 입력 값 **유효성 검사**를 진행합니다
  - 아이디: 영문으로 시작하는 8~16자의 영문자 및 숫자 조합
  - 비밀번호: 8~15자의 영문, 숫자, 특수문자(!@#$%^\*+=.-) 조합
- 로그인 성공 시, **사용자 정보와 토큰은 UserContext와 localStorage**에 저장되어 자동으로 메인(달력) 화면으로 이동합니다.
- Enter 키 입력 시에도 로그인 처리가 가능하여 편리한 UX를 제공합니다.

#### 회원가입

![회원가입](/frontend/src/assets/images/readme/signup.gif)

- 입력 값 **실시간 유효성 검사**를 진행합니다
  - 이름: 2~5자의 한글만 입력 가능
  - 아이디: 영문으로 시작하는 8~16자의 영문자 및 숫자 조합
  - 비밀번호: 8~15자의 영문, 숫자, 특수문자(!@#$%^\*+=.-) 조합
  - 비밀번호 확인: 입력한 비밀번호와 일치 여부 확인
  - 이메일: 올바른 이메일 형식 검증
- 각 입력 필드에서 발생하는 오류는 **실시간 에러 메시지**로 표시되어 사용자가 즉시 수정 가능
- **중복 검사**를 통해 아이디와 이메일의 고유성을 보장합니다.
- **Daum 우편번호 API**를 연동하여 정확한 주소 입력을 지원합니다.

#### 메모

![메모](/frontend/src/assets/images/readme/memo.gif)

- 달력에 등록한 메모가 **컬러 태그**로 표시되어 한눈에 구분할 수 있습니다.
  - 카테고리별 색상으로 목적에 따라 시각적으로 분류할 수 있습니다.
  - 달력 태그에 **마우스 오버 시 상세 내역**이 툴팁으로 표시됩니다.
  - **시작일과 종료일**에 따라 달력에 표시되는 태그 길이가 자동 조정됩니다.
  - 연도/월 내비게이션과 **투데이 버튼**으로 원하는 날짜로 빠르게 이동할 수 있습니다.
- 우측 대시보드에서 선택한 날짜 기준으로 메모를 작성 및 관리할 수 있습니다.
  - **다음날로 미루기** 기능으로 클릭 한 번에 일정 조정이 가능합니다.
  - **Day/Week/Month/Year** 전환으로 다양한 시간 단위로 메모를 확인할 수 있습니다.

#### 가계부

![가계부](/frontend/src/assets/images/readme/accountbook.gif)

- 달력에 등록한 수입 및 지출 내역이 **컬러 태그**로 표시되어 한눈에 구분할 수 있습니다.
  - 카테고리별 색상으로 목적에 따라 시각적으로 분류할 수 있습니다.
  - 달력 태그에 **마우스 오버 시 상세 내역**이 툴팁으로 표시됩니다.
- 우측 대시보드에서 선택한 날짜 기준으로 가계부 내역을 종합적으로 확인과 작성 및 관리할 수 있습니다.
  - 자산, 수입, 지출을 한눈에 확인할 수 있습니다.
  - **파이 차트**로 카테고리별 수입/지출 비중을 시각화하여 쉽게 파악할 수 있습니다.
  - **Day/Week/Month/Year** 전환으로 다양한 시간 단위로 재무 현황을 확인할 수 있습니다.

#### 가계부 카테고리

![가계부 카테고리](/frontend/src/assets/images/readme/accountbook_category.gif)

- 좌측에서 사용자의 현재 자산 총액을 확인할 수 있습니다.
- **자산/수입** 탭을 전환하여 카테고리를 관리할 수 있습니다.
- **카테고리 추가** 버튼을 통해 카테고리를 생성할 수 있습니다.
- 각 카테고리는 **색상**으로 구분되어 시각적 식별이 용이합니다.
- 각 카테고리는 **삭제 및 수정**이 가능하여 개인 맞춤형 관리가 가능합니다.
- 드래그 앤 드롭(::)으로 카테고리 **순서를 변경**할 수 있습니다.

#### 고객센터

![고객센터](/frontend/src/assets/images/readme/board.png)

- 좌측 메뉴에서 **공지사항, 자유게시판, 오류 보고** 게시판으로 이동할 수 있습니다.
- **공지사항**: 서비스 업데이트 및 중요 공지사항을 확인할 수 있습니다.
- **자유게시판**: 사용자 간 자유로운 소통 공간을 제공합니다.
- **오류 보고**: 서비스 이용 중 발견한 오류를 신고하고 피드백을 받을 수 있습니다.

---

### 프로젝트 구조

```
├── backend                       # Node.js 백엔드
    ├── controller                # 클라이언트 요청을 받아 처리하고 응답 반환
    ├── middleware                # 미들웨어 (예: 인증, 에러 처리)
    ├── model                     # 데이터베이스와 직접 상호작용하는 모듈
    ├── route                     # API 라우트 정의
    ├── db.js                     # PostgreSQL 데이터베이스 연결 설정
    ├── server.js                 # 서버 진입점 (Express 서버 실행)
    └── package.json              # 백엔드 패키지 및 의존성 관리
│
└── frontend                      # React 프론트엔드
    ├── package.json              # 프론트엔드 패키지 및 의존성 관리
    ├── tailwind.config.js        # Tailwind CSS 설정
    └──  src
      ├── api                     # 서버 API 요청 함수 정의
      ├── assets                  # 이미지등 정적 리소스
      ├── components              # 재사용 가능한 UI 컴포넌트
      ├── constants               # 앱 내 상수 정의
      ├── context                 # React Context (전역 상태 관리용)
      ├── hooks                   # 커스텀 React Hooks
      ├── pages                   # 페이지 단위 컴포넌트
      ├── stores                  # Zustand를 사용한 전역 상태 관리
      ├── styles                  # 전역 스타일 또는 Tailwind 설정 관련 스타일
      ├── util                    # 유틸리티 함수 모음
      └── App.jsx                 # 메인 App 컴포넌트 (라우팅 및 레이아웃 포함)
```
