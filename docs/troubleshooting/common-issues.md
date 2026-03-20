# 문제 해결 가이드

> 자주 발생하는 오류 및 해결 방법

## Backend 관련

### 1. `connection refused` (PostgreSQL 연결 실패)

**증상**:
```
Failed to connect to database: dial error
```

**원인**:
- PostgreSQL이 실행 중이 않음
- 잘못된 비밀번호
- 잘못된 포트

**해결**:

```bash
# PostgreSQL 상태 확인 (Linux/macOS)
sudo systemctl status postgresql

# PostgreSQL 시작
sudo systemctl start postgresql

# Windows: services.msc에서 PostgreSQL 서비스 확인
```

**config.yaml 비밀번호 확인**:
```yaml
database:
  password: postgres123  # 실제 비밀번호로 변경
```

---

### 2. `password authentication failed`

**증상**:
```
Failed to connect to database: password authentication failed
```

**해결**:

```bash
# PostgreSQL 비밀번호 확인/재설정
sudo -u postgres psql

# 비밀번호 확인
\password postgres

# smartas 사용자가 있다면 비밀번호 재설정
ALTER USER smartas WITH PASSWORD 'newpassword123';
\q
```

**config.yaml 수정**:
```yaml
database:
  password: newpassword123  # 변경
```

---

### 3. `port already in use`

**증상**:
```
listen tcp :8080: bind: address already in use
```

**해결**:

```bash
# 포트 사용 중인지 확인
lsof -i :8080

# 프로세스 종료
kill -9 <PID>

# 또는 다른 프로세스 확인 후 중지
```

---

### 4. `module not found`

**증상**:
```
package xxx: cannot find package
```

**해결**:

```bash
cd backend
go mod download
go mod tidy
go build -o bin/server ./cmd/server
```

---

### 5. Backend 서버가 응답 없음

**확인**:

```bash
# 서버 상태 확인
curl http://localhost:8080/health

# Backend 로그 확인
go run ./cmd/server
# 터미널에서 직접 실행하면 오류 메시지 확인 가능
```

---

## Frontend 관련

### 1. `npm install` 오류

**증상**:
```
npm ERR! code EPERM
npm ERR! syscall open
```

**해결**:

```bash
# Windows: PowerShell을 관리자 권한으로 실행
# macOS/Linux: sudo 사용

# 캐시 지우고 다시 설치
npm cache clean --force
rm -rf node_modules
npm install
```

---

### 2. `Cannot find module`

**증상**:
```
Module not found: Error: Cannot find module
```

**해결**:

```bash
cd frontend/admin-web
rm -rf node_modules package-lock.json
npm install
```

---

### 3. API 연결 실패 (CORS)

**증상**:
```
Access-Control-Allow-Origin 오류
```

**해결**:

Backend의 CORS 설정 확인:
```go
// backend/internal/middleware/middleware.go
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
        // ...
    }
}
```

---

### 4. 빌드 오류

**증상**:
```
Module not found: Error: Can't resolve
```

**해결**:

```bash
cd frontend/admin-web
rm -rf dist
npm run build
```

---

## Database 관련

### 1. 데이터베이스 존재하지 않음

**증상**:
```
database "smart_as" does not exist
```

**해결**:

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE smart_as;

# 또는
sudo -u postgres createdb smart_as
```

---

### 2. 마이그레이션 오류

**증상**:
```
relation "users" already exists
```

**해결**: 테이블이 이미 존재하면 정상. 무시해도 됨.
GORM의 `AutoMigrate`는 기존 테이블을 건드리지 않음.

---

### 3. 테이블이 만들어지지 않음

**증상**:
```
table not found
```

**해결**:

```bash
# Backend 서버를 다시 실행하면 자동 마이그레이션됨
go run ./cmd/server
```

---

## Mobile 앱 관련

### 1. Expo 실행 오류

**증상**:
```
Metro bundler connection error
```

**해결**:

```bash
# Metro 캐시 지우기
npx expo start --clear

# 또는
rm -rf node_modules/.cache
npx expo start
```

---

### 2. API URL不正确

**증상**:
```
Network request failed
```

**해결**:

```typescript
// 모바일 앱의 API URL 확인
// mobile/customer-app/src/api/index.ts
// mobile/technician-app/src/api/index.ts

const API_BASE_URL = 'http://localhost:8080/api/v1';
// localhost를 실제 IP로 변경 (개발 시)
```

**Android 에뮬레이터의 경우**:
```typescript
// Android 에뮬레이터는 localhost 대신 10.0.2.2 사용
const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';
```

**iOS 시뮬레이터의 경우**:
```typescript
// macOS의 localhost IP
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

**실제 기기의 경우**:
```typescript
// 컴퓨터의 로컬 IP 사용
const API_BASE_URL = 'http://192.168.1.100:8080/api/v1';
```

---

## AWS/EC2 배포 관련

### 1. SSH 접속 실패

**증상**:
```
Permission denied (publickey)
```

**해결**:

```bash
# 키 파일 권한 확인
chmod 400 ~/Downloads/your-key.pem

# 올바른 사용자 이름 확인
ssh -i ~/Downloads/your-key.pem ubuntu@<EC2-IP>

# 기본 사용자: ubuntu (Amazon Linux는 ec2-user)
```

---

### 2. Backend 서비스 시작 실패

**확인**:

```bash
# 서비스 상태
sudo systemctl status smart-as-backend

# 로그 확인
sudo journalctl -u smart-as-backend -n 50

# 경로 확인
ls -la /var/www/smart-as/backend/
```

---

### 3. Nginx 502 Bad Gateway

**원인**:
- Backend 서버가 실행 중이 아님
- 잘못된 포트 설정

**해결**:

```bash
# Backend 실행 중인지 확인
curl http://localhost:8080/health

# Backend 시작
sudo systemctl start smart-as-backend

# Nginx 재시작
sudo systemctl restart nginx
```

---

### 4. HTTPS 적용 안됨

**확인**:

```bash
# SSL 인증서 상태
sudo certbot certificates

# Nginx 설정 확인
sudo nginx -t
```

---

## 일반적인 확인 명령어

### Backend

```bash
# 프로세스 확인
ps aux | grep go

# 포트 확인
lsof -i :8080

# 로그 확인
go run ./cmd/server 2>&1
```

### Database

```bash
# PostgreSQL 상태
sudo systemctl status postgresql

# 접속 확인
psql -U postgres -d smart_as -c "SELECT 1"
```

### Frontend

```bash
# 노드 프로세스 확인
ps aux | grep node

# 포트 확인
lsof -i :3000
```

### Nginx

```bash
# 설정 문법 확인
sudo nginx -t

# 로그 확인
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 도움 요청 시 제공할 정보

문제를 해결하려면 다음 정보를 제공해주세요:

1. **오류 메시지** (전체 스택 트레이스)
2. **어떤 작업을 했는지**
3. **사용 환경** (로컬/EC2/다른 OS)
4. **코드 변경 내역** (있다면)

```bash
# 환경 정보 수집
echo "=== OS ==="
uname -a

echo "=== Go Version ==="
go version

echo "=== Node Version ==="
node -v

echo "=== Backend Log ==="
# 마지막 50줄
journalctl -u smart-as-backend -n 50 --no-pager

echo "=== Port Status ==="
netstat -tlnp | grep -E '8080|5432|3000'
```
