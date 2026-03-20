# Smart A/S Connect

소형가전 A/S 매칭 및 관리 시스템 (v1.0)

## 프로젝트 구조

```
smart-as/
├── backend/                    # Go Backend API
│   ├── cmd/server/main.go      # 서버 진입점
│   ├── internal/
│   │   ├── config/            # 설정 관리
│   │   ├── handlers/           # HTTP 핸들러
│   │   ├── middleware/         # 미들웨어 (JWT, CORS)
│   │   ├── models/             # 데이터 모델
│   │   ├── repository/         # 데이터베이스 연산
│   │   └── service/            # 비즈니스 로직
│   ├── migrations/             # DB 마이그레이션
│   ├── config.yaml             # 설정 파일
│   └── go.mod
├── frontend/
│   └── admin-web/              # React Admin Web
│       ├── src/
│       │   ├── api/            # API 클라이언트
│       │   ├── components/     # UI 컴포넌트
│       │   ├── pages/          # 페이지 컴포넌트
│       │   ├── types/          # TypeScript 타입
│       │   └── App.tsx
│       └── package.json
├── mobile/
│   ├── customer-app/           # 고객 앱 (준비중)
│   └── technician-app/         # 기사 앱 (준비중)
└── docs/                       # 문서
```

## 시작하기

### 1. Backend 실행

```bash
cd backend

# 의존성 설치
go mod download

# PostgreSQL 설정 (config.yaml 수정)
# database:
#   host: localhost
#   port: 5432
#   user: postgres
#   password: your_password
#   dbname: smart_as

# 서버 실행
go run ./cmd/server

# 또는 빌드 후 실행
go build -o bin/server ./cmd/server
./bin/server
```

서버가 `http://localhost:8080` 에서 실행됩니다.

### 2. Admin Web 실행

```bash
cd frontend/admin-web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

Admin Web이 `http://localhost:3000` 에서 실행됩니다.

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스 생성:

```sql
CREATE DATABASE smart_as;
```

마이그레이션 실행 (서버 실행 시 자동 실행됨) 또는:

```bash
psql -U postgres -d smart_as -f migrations/001_init.sql
```

## API 엔드포인트

### 고객 API (`/api/v1/customer`)
- `POST /register` - 회원가입
- `POST /login` - 로그인
- `POST /repair-requests` - A/S 접수
- `GET /repair-requests` - 내 접수 목록
- `GET /repair-requests/:id` - 접수 상세
- `PUT /repair-requests/:id/fcm-token` - FCM 토큰 업데이트

### 기사 API (`/api/v1/technician`)
- `POST /register` - 기사 회원가입
- `POST /login` - 로그인
- `GET /repair-requests` - 대기 중인 요청
- `POST /repair-requests/:id/accept` - 요청 수락
- `GET /assignments` - 내 배정 목록
- `POST /assignments/:id/start` - 수리 시작
- `POST /assignments/:id/complete` - 수리 완료

### 관리자 API (`/api/v1/admin`)
- `POST /login` - 관리자 로그인
- `POST /register` - 관리자 등록
- `GET /dashboard` - 대시보드 통계
- `GET /technicians` - 기사 목록
- `PUT /technicians/:id/approve` - 기사 승인
- `GET /repair-requests` - 전체 접수 목록
- `GET /statistics` - 정산/통계
- `GET /export/excel` - 엑셀 다운로드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Go, Gin, GORM, PostgreSQL |
| Frontend | React, TypeScript, Tailwind CSS, React Query |
| Push | Firebase Cloud Messaging |

## 개발 로드맵

- [x] 1단계: DB 스키마 설계 및 기본 API 서버 구축
- [x] 2단계: 고객용 접수 페이지 및 관리자 기본 웹 개발
- [x] 3단계: 기사용 실시간 콜 목록 및 배정 로직 구현
- [x] 4단계: 엑셀 출력 및 정산 시스템 고도화
- [x] Mobile Apps (Customer, Technician)
- [x] FCM 푸시 알림 연동
