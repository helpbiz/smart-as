# 로컬 개발 환경 설정 가이드

> Windows, macOS, Linux対応

## 필요 환경

| 도구 | 최소 버전 | 설치 안내 |
|------|----------|----------|
| Go | 1.22+ | [go.dev/dl](https://go.dev/dl) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org/download) |
| Git | 2.0+ | [git-scm.com](https://git-scm.com) |
| npm | 9+ | nodejs 설치 시 포함 |
| Expo CLI | - | `npm install -g expo-cli` |

---

## 1단계: PostgreSQL 설치 및 설정

### Windows

1. **PostgreSQL 다운로드**
   - https://www.postgresql.org/download/windows/
   - PostgreSQL 16 installer 다운로드

2. **설치 중 설정**
   - **Password**: `postgres123` (기억할 비밀번호)
   - **Port**: `5432` (기본값)
   - **Encoding**: `UTF8`

3. **pgAdmin 실행** (설치 시 함께 설치됨)

4. **데이터베이스 생성**
   - pgAdmin에서 `Servers` → `PostgreSQL 16` 우클릭
   - `Create` → `Database...`
   - Database name: `smart_as`
   - Owner: `postgres`

### macOS

```bash
# Homebrew로 설치
brew install postgresql@16

# PostgreSQL 시작
brew services start postgresql@16

# 데이터베이스 생성
createdb smart_as

# 접속 확인
psql -d smart_as
```

### Linux (Ubuntu/Debian)

```bash
# PostgreSQL 설치
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# postgres 사용자로 전환
sudo -u postgres psql

# 데이터베이스 및 사용자 생성
CREATE USER smartas WITH PASSWORD 'smartas123';
CREATE DATABASE smart_as OWNER smartas;
\q
```

---

## 2단계: Go 설치

### Windows

1. https://go.dev/dl 에서 Windows installer 다운로드 (.msi)
2. 설치程序的デフォルト대로 진행
3. **환경변수 설정 확인** (자동으로 됨)
4. **PowerShell 재시작**

### macOS

```bash
# Homebrew로 설치
brew install go

# 확인
go version
```

### Linux

```bash
# 다운로드
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz

# 설치
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
rm go1.22.0.linux-amd64.tar.gz

# PATH 설정
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# 확인
go version
```

---

## 3단계: Node.js 설치

### Windows/macOS/Linux 공통

https://nodejs.org 에서 LTS 버전(20.x) 설치

### macOS (Homebrew)

```bash
brew install node@20
```

### Linux

```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 확인
node -v
npm -v
```

---

## 4단계: 프로젝트 클론

```bash
# 프로젝트 클론
git clone https://github.com/helpbiz/smart-as.git

# 폴더로 이동
cd smart-as

# 디렉토리 확인
ls -la
```

---

## 5단계: Backend 실행

### 5-1. 설정 파일 수정

`backend/config.yaml` 파일을 메모장이나 VS Code로 열기:

```yaml
database:
  host: localhost
  port: 5432
  user: postgres          # Windows/Linux 기본
  # user: smartas        # Linux에서 별도 사용자 생성 시
  password: postgres123   # 설치 시 설정한 비밀번호
  dbname: smart_as
  sslmode: disable

jwt:
  secret: your-super-secret-key-change-in-production
  expiry_hours: 24

server:
  host: 0.0.0.0
  port: 8080

fcm:
  credentials_file: ./fcm-credentials.json  # 없으면 비워두기
```

### 5-2. 의존성 설치

```bash
cd backend

# Go 모듈 의존성 다운로드
go mod download

# 확인
go mod tidy
```

### 5-3. 서버 실행

```bash
# 개발 모드로 실행
go run ./cmd/server

# 또는 빌드 후 실행
go build -o bin/server ./cmd/server
./bin/server
```

**✅ 성공 시 출력:**
```
Server starting on 0.0.0.0:8080
```

**❌ 오류가 발생하면:**
- PostgreSQL 연결 오류 → 비밀번호 확인
- `config.yaml` 파일 경로 확인

---

## 6단계: Frontend 실행

**새 터미널** 열기 (기존 터미널은 Backend 실행 중):

```bash
cd smart-as/frontend/admin-web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**✅ 성공 시 출력:**
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

**브라우저에서 열기**: http://localhost:3000

---

## 7단계: 관리자 계정 생성

**또 다른 새 터미널** 열기:

```bash
# 관리자 계정 생성
curl -X POST http://localhost:8080/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**✅ 성공 응답:**
```json
{"message":"admin created"}
```

---

## 8단계: 테스트

### 관리자 웹 테스트

1. 브라우저에서 http://localhost:3000 접속
2. 로그인 화면에서 아이디/비밀번호 입력:
   - **Username**: `admin`
   - **Password**: `admin123`
3. 대시보드가 보이면 성공!

### API 테스트 (curl)

```bash
# 서버 상태 확인
curl http://localhost:8080/health

# 관리자 로그인
curl -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 기사 회원가입
curl -X POST http://localhost:8080/api/v1/technician/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678",
    "name": "김기사",
    "password": "tech123",
    "service_area": "서울"
  }'

# 기사 승인 (관리자 토큰 필요)
curl -X PUT http://localhost:8080/api/v1/admin/technicians/1/approve \
  -H "Authorization: Bearer <관리자_토큰>"
```

---

## Mobile 앱 실행 (선택사항)

### Customer App

```bash
cd smart-as/mobile/customer-app
npm install
npx expo start
```

### Technician App

```bash
cd smart-as/mobile/technician-app
npm install
npx expo start
```

**📱 Expo Go 앱 설치** (스마트폰에서):
- iOS: App Store에서 "Expo Go" 검색
- Android: Play Store에서 "Expo Go" 검색

**QR 코드 스캔** 후 앱 실행

---

## 빠른 참조 (Quick Reference)

### 필요한 터미널 수: 3개

```
┌─────────────────────────────────────────────────────────────┐
│ Terminal 1: Backend 서버                                     │
│ $ cd smart-as/backend && go run ./cmd/server                │
├─────────────────────────────────────────────────────────────┤
│ Terminal 2: Frontend 서버                                     │
│ $ cd smart-as/frontend/admin-web && npm run dev              │
├─────────────────────────────────────────────────────────────┤
│ Terminal 3: curl 명령어 (선택사항)                             │
│ $ curl http://localhost:8080/health                          │
└─────────────────────────────────────────────────────────────┘
```

### 자주 사용하는 명령어

```bash
# Backend 재시작
Ctrl+C (중지) → go run ./cmd/server (재실행)

# Frontend 재시작
자동 (Vite hot reload)

# 데이터 초기화 (DB 삭제 후 재생성)
# pgAdmin에서 smart_as 데이터베이스 우클릭 → Delete/Drop
# 다시 생성 후 관리자 계정 생성
```

---

## 문제 해결

| 문제 | 해결책 |
|------|--------|
| `connection refused` | PostgreSQL 서비스 실행 중인지 확인 |
| `password authentication failed` | `config.yaml` 비밀번호 확인 |
| `port already in use` | 다른 프로세스 사용 중 → `lsof -i :8080` |
| `npm install` 오류 | Node.js 버전 확인 (18+) |
| `go mod download` 오류 | Go 설치 확인 + 네트워크 연결 |

### PostgreSQL 서비스 확인

**Windows**: services.msc에서 PostgreSQL 서비스 확인
**macOS**: `brew services list | grep postgresql`
**Linux**: `sudo systemctl status postgresql`
