# AGENTS.md — Smart A/S Connect

> AI 코딩 에이전트를 위한 가이드

---

## 프로젝트 개요

- **유형**: Monorepo (Backend + Frontend + Mobile)
- **기술 스택**:
  - Backend: Go 1.22, Gin, GORM, PostgreSQL
  - Frontend: React 18, TypeScript, Tailwind CSS, React Query
  - Mobile: React Native (Expo)

---

## 빌드/테스트 명령어

### Backend (Go)

```bash
cd backend

# 개발 실행
go run ./cmd/server

# 빌드
go build -o bin/server ./cmd/server

# 의존성 설치
go mod download

# 단위 테스트 (현재 테스트 파일 없음)
go test ./...
```

### Frontend (React Admin Web)

```bash
cd frontend/admin-web

# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 사전 검증 (TypeScript만)
npx tsc --noEmit

# 테스트 (Playwright)
npx playwright test
```

### Mobile Apps

```bash
# 고객 앱
cd mobile/customer-app
npm install
npm start

# 기사 앱
cd mobile/technician-app
npm install
npm start
```

### Docker

```bash
cd docker
docker-compose up -d  # PostgreSQL + Backend
```

---

## 코드 스타일 가이드

### Go (Backend)

- **파일명**: snake_case (`user_service.go`, `repair_request_handler.go`)
- **패키지명**: 짧고 간결 (`handlers`, `service`, `repository`)
- **네이밍**:
  - 변수/함수: camelCase
  - 구조체/인터페이스: PascalCase
  - 상수: PascalCase 또는 SCREAMING_SNAKE_CASE
- **에러 처리**: `if err != nil` 즉시 처리, 에러 감싸기 `fmt.Errorf("context: %w", err)`
- **에러 반환**: 마지막 반환값으로 에러 반환
- **로그**: `log.Println` 또는 구조화된 로깅

### React/TypeScript (Frontend)

- **파일명**: PascalCase (컴포넌트), camelCase (유틸)
- **컴포넌트**: 함수형 + Hooks 사용
- **타입**: TypeScript 엄격 모드 (`strict: true`)
- **네이밍**:
  - 컴포넌트: PascalCase
  - 변수/함수: camelCase
  - 상수: SCREAMING_SNAKE_CASE
- **가져오기**: 절대 경로 사용 금지, 상대 경로 사용
- **CSS**: Tailwind CSS 클래스 사용

### React Native (Mobile)

- **패턴**: Expo 기반
- **네비게이션**: React Navigation (`@react-navigation/native-stack`)
- **API**: Axios 사용
- **상태**: AsyncStorage (로컬), React Query (서버 상태)

---

## 프로젝트 구조

```
smart-as/
├── AGENTS.md                    # 이 파일
├── README.md
├── backend/                     # Go Backend
│   ├── cmd/server/main.go       # 진입점
│   ├── internal/                # 내부 패키지
│   │   ├── config/              # 설정
│   │   ├── handlers/            # HTTP 핸들러
│   │   ├── middleware/          # JWT, CORS
│   │   ├── models/              # 데이터 모델
│   │   ├── repository/          # DB 연산
│   │   └── service/            # 비즈니스 로직
│   ├── migrations/              # DB 마이그레이션
│   ├── config.yaml              # 설정 파일
│   └── go.mod
├── frontend/admin-web/          # React Admin Web
│   ├── src/
│   │   ├── api/                # API 클라이언트
│   │   ├── components/          # UI 컴포넌트
│   │   ├── pages/               # 페이지
│   │   ├── types/               # TypeScript 타입
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── mobile/
│   ├── customer-app/            # 고객용 React Native
│   └── technician-app/           # 기사용 React Native
└── docs/                        # 개발 문서
```

---

## 주요 규칙

### Backend

1. **설정**: `config.yaml` 사용, 하드코딩 금지
2. **인증**: JWT 토큰 via `Authorization: Bearer <token>`
3. **DB**: GORM 사용, 마이그레이션은 `migrations/` 폴더
4. **API 응답**: JSON 형식, 에러는 `{ "error": "메시지" }`

### Frontend

1. **API 호출**: `api/` 폴더의 클라이언트 사용
2. **상태 관리**: React Query (`@tanstack/react-query`)
3. **타입**: `types/` 폴더에 공유 타입 정의
4. **컴포넌트**: `components/` 폴더, 재사용 가능한 UI

### 공통

1. **에러 처리**: 모든 에러는 사용자에게 표시, 로그는 서버에 기록
2. **검증**: 모든 사용자 입력 검증 (백엔드 필수)
3. **시크릿**: `.env` 또는 `config.yaml`, 코드에 하드코딩 금지
4. **포트**: Backend 8088, Frontend 3000 (Vite 기본)

---

## 참고 문서

- [API 문서](./docs/api/endpoints.md)
- [DB 스키마](./docs/database/schema.md)
- [로컬 개발 가이드](./docs/setup/local-dev.md)
- [테스트 가이드](./docs/setup/testing.md)
