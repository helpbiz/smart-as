# 설정 가이드

> Smart A/S Connect 설정 파일 및 환경변수 설명

## 설정 파일 구조

```
smart-as/
├── backend/
│   └── config.yaml          # Backend 설정
├── frontend/admin-web/
│   └── src/api/index.ts     # API URL 설정
└── mobile/
    ├── customer-app/
    │   └── src/api/index.ts
    └── technician-app/
        └── src/api/index.ts
```

---

## Backend 설정 (`backend/config.yaml`)

```yaml
database:
  host: localhost
  port: 5432
  user: postgres
  password: your_password
  dbname: smart_as
  sslmode: disable

jwt:
  secret: your-super-secret-key-change-in-production
  expiry_hours: 24

server:
  host: 0.0.0.0
  port: 8080

fcm:
  credentials_file: ./fcm-credentials.json
```

### 각 설정 설명

#### database 섹션

| 설정 | 설명 | 로컬 | 프로덕션 |
|------|------|------|---------|
| host | PostgreSQL 서버 주소 | `localhost` | `localhost` 또는 `RDS 엔드포인트` |
| port | PostgreSQL 포트 | `5432` | `5432` |
| user | 데이터베이스 사용자 | `postgres` | `smartas` |
| password | 비밀번호 | `postgres123` | 복잡한 비밀번호 |
| dbname | 데이터베이스 이름 | `smart_as` | `smart_as` |
| sslmode | SSL 모드 | `disable` | `require` 권장 |

#### jwt 섹션

| 설정 | 설명 | 권장값 |
|------|------|--------|
| secret | JWT 서명 키 | 32자 이상 랜덤 문자열 |
| expiry_hours | 토큰 만료 시간 | `24` (1일) 또는 `168` (7일) |

**비밀 키 생성 방법**:
```bash
# Linux/macOS
openssl rand -base64 32

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) )
```

#### server 섹션

| 설정 | 설명 | 로컬 | 프로덕션 |
|------|------|------|---------|
| host | 바인딩 주소 | `0.0.0.0` | `0.0.0.0` |
| port | 서버 포트 | `8080` | `8080` |

#### fcm 섹션

| 설정 | 설명 | 비고 |
|------|------|------|
| credentials_file | Firebase credentials 경로 | 파일 없으면 푸시알림 비활성화 |

---

## Frontend API URL 설정

### 로컬 개발 (`localhost`)

```typescript
// frontend/admin-web/src/api/index.ts
const API_BASE_URL = '/api/v1';  // Vite 프록시 사용
```

### 개발 서버 (IP 주소)

```typescript
// 개발용으로 IP 직접 지정
const API_BASE_URL = 'http://192.168.1.100:8080/api/v1';
```

### 프로덕션 (Nginx 리버스 프록시)

```typescript
// HTTPS 사용 시
const API_BASE_URL = '/api/v1';  // Same-origin
```

### EC2 배포 시

```typescript
// EC2 Public IP
const API_BASE_URL = 'http://54.123.456.789:8080/api/v1';

// 도메인 사용 시
const API_BASE_URL = 'https://api.your-domain.com/api/v1';
```

---

## 환경별 설정 비교

### 개발 환경 (local-dev)

```yaml
# backend/config.yaml
database:
  host: localhost
  port: 5432
  user: postgres
  password: postgres123
  dbname: smart_as
  sslmode: disable

jwt:
  secret: dev-secret-key-not-for-production
  expiry_hours: 24

server:
  host: 0.0.0.0
  port: 8080

fcm:
  credentials_file: ""  # 비활성화
```

### 스테이징 환경 (staging)

```yaml
database:
  host: staging-db.xxxx.ap-northeast-2.rds.amazonaws.com
  port: 5432
  user: smartas
  password: [RDS 비밀번호]
  dbname: smart_as
  sslmode: require

jwt:
  secret: [랜덤 생성된 긴 문자열]
  expiry_hours: 168  # 7일

server:
  host: 0.0.0.0
  port: 8080

fcm:
  credentials_file: ./config/firebase-staging.json
```

### 프로덕션 환경 (production)

```yaml
database:
  host: prod-db.xxxx.ap-northeast-2.rds.amazonaws.com
  port: 5432
  user: smartas
  password: [매우 복잡한 비밀번호]
  dbname: smart_as
  sslmode: require

jwt:
  secret: [매우 긴 랜덤 문자열 - 64자 이상]
  expiry_hours: 168

server:
  host: 0.0.0.0
  port: 8080

fcm:
  credentials_file: ./config/firebase-prod.json
```

---

## Firebase (FCM) 설정

### 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. **프로젝트 추가** → 이름 입력 → 계속
3. Google Analytics 활성화 (선택사항)
4. **프로젝트 설정** → **서비스 계정** 탭
5. **Firebase Admin SDK** → **새 비공개 키 생성**
6. JSON 파일 다운로드 → `fcm-credentials.json`으로 이름 변경

### 2. Backend 설정

```bash
# credentials 파일 복사
cp ~/Downloads/service-account-file.json backend/fcm-credentials.json
```

### 3. config.yaml 수정

```yaml
fcm:
  credentials_file: ./fcm-credentials.json
```

### 4. 앱에 FCM 설정

**Android**:
1. Firebase Console → 프로젝트 설정 → Android 앱 추가
2. `google-services.json` 다운로드
3. Android 프로젝트의 `app/` 폴더에 복사

**iOS**:
1. Firebase Console → 프로젝트 설정 → iOS 앱 추가
2. `GoogleService-Info.plist` 다운로드
3. Xcode 프로젝트에 추가

---

## 데이터베이스 설정 (PostgreSQL)

### 로컬 (Windows)

```
Host: localhost
Port: 5432
Database: smart_as
Username: postgres
Password: [설치 시 입력한 비밀번호]
```

### 로컬 (macOS/Linux)

```
Host: localhost
Port: 5432
Database: smart_as
Username: postgres (또는 smartas)
Password: [설정한 비밀번호]
```

### AWS RDS

```
Host: smart-as-db.xxxx.ap-northeast-2.rds.amazonaws.com
Port: 5432
Database: smart_as
Username: smartas
Password: [RDS 생성 시 설정한 비밀번호]
```

**RDS 연결 확인**:
```bash
# EC2에서 RDS 접속 테스트
psql -h <RDS-엔드포인트> -U smartas -d smart_as
```

---

## Nginx 설정

### 기본 리버스 프록시

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/smart-as/frontend/admin-web/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### HTTPS + HTTP 리다이렉트

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        root /var/www/smart-as/frontend/admin-web/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 환경 변수 (개선 예정)

현재는 `config.yaml` 파일을 사용하지만, 보안 강화를 위해 환경 변수 사용을 권장합니다.

```bash
# .env 파일 (gitignore에 추가)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=secret
JWT_SECRET=your-secret-key
FCM_CREDENTIALS=./fcm-credentials.json
```

---

## 보안 체크리스트

- [ ] JWT secret을 길고 복잡하게 설정
- [ ] 데이터베이스 비밀번호 복잡하게 설정
- [ ] 프로덕션에서 `sslmode: require` 사용
- [ ] FCM credentials 파일을 gitignore에 추가
- [ ] `.env` 파일을 사용하여 민감 정보 관리
- [ ]定期적으로 비밀번호 변경
