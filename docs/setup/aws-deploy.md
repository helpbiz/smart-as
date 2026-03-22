# AWS EC2 배포 가이드

> Ubuntu 22.04 LTS 기준

## 전체 순서

```
1. EC2 인스턴스 생성
2. SSH 접속
3. PostgreSQL 설치 및 설정
4. Go, Node.js 설치
5. 프로젝트 배포
6. Nginx 설정
7. 도메인 & SSL (선택사항)
8. 관리자 계정 생성
```

---

## 1단계: EC2 인스턴스 생성

### 1-1. AWS 콘솔 접속

1. https://console.aws.amazon.com 접속
2. **EC2** 검색 → **인스턴스 시작**

### 1-2. 인스턴스 설정

| 설정 | 값 |
|------|-----|
| **AMI** | Ubuntu Server 22.04 LTS (HVM), SSD Volume Type |
| **인스턴스 유형** | t3.micro (무료 티어) |
| **키 페어** | 새 키 페어 생성 (`.pem` 파일 다운로드) |

### 1-3. 네트워크 설정

**편집** 클릭 후:

| 설정 | 값 |
|------|-----|
| **퍼블릭 IP 자동 할당** | 활성화 |
| **방화벽 (보안 그룹)** | 새 보안 그룹 생성 |

**인바운드 보안 그룹 규칙**:

| 유형 | 포트 범위 | 소스 |
|------|----------|------|
| SSH | 22 | 내 IP |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| 사용자 정의 TCP | 3000 | 0.0.0.0/0 |
| 사용자 정의 TCP | 8080 | 0.0.0.0/0 |

### 1-4. 스토리지

기본 8GB (gp3) → 그대로 진행

### 1-5. 시작

**인스턴스 시작** 클릭 → 인스턴스 ID 메모

---

## 2단계: EC2 접속

### 2-1. 키 파일 권한 변경

```bash
chmod 400 ~/Downloads/your-key.pem
```

### 2-2. SSH 접속

```bash
ssh -i ~/Downloads/your-key.pem ubuntu@<EC2-Public-IP>
```

**예시**:
```bash
ssh -i ~/Downloads/my-key.pem ubuntu@54.123.456.789
```

**✅ 접속 성공**:
```
Welcome to Ubuntu 22.04.3 LTS
ubuntu@ip-xxx-xx-xx-xxx:~$
```

---

## 3단계: 기본 설정

```bash
# 3-1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 3-2. 기본 도구 설치
sudo apt install -y curl git unzip build-essential
```

---

## 4단계: PostgreSQL 설치 및 설정

```bash
# 4-1. PostgreSQL 저장소 추가
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

# 4-2. PostgreSQL 설치
sudo apt update
sudo apt install -y postgresql-16

# 4-3. PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4-4. 데이터베이스 및 사용자 생성
sudo -u postgres psql << EOF
CREATE USER smartas WITH PASSWORD 'SmartAs2024!';
CREATE DATABASE smart_as OWNER smartas;
GRANT ALL PRIVILEGES ON DATABASE smart_as TO smartas;
\q
EOF

# 4-5. 원격 접속 허용 (선택사항)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/16/main/postgresql.conf
sudo sed -i 's/# IPv6 local connections:/host all all 0.0.0.0\/0 md5/' /etc/postgresql/16/main/pg_hba.conf
sudo systemctl restart postgresql

# 4-6. 방화벽 허용
sudo ufw allow 5432/tcp
```

---

## 5단계: Go 설치

```bash
# 5-1. Go 다운로드
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz

# 5-2. 설치
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
rm go1.22.0.linux-amd64.tar.gz

# 5-3. PATH 설정
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc

# 5-4. 확인
go version
```

---

## 6단계: Node.js 설치

```bash
# 6-1. NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 6-2. Node.js 설치
sudo apt install -y nodejs

# 6-3. 확인
node -v
npm -v

# 6-4. Yarn 설치 (선택사항)
sudo npm install -g yarn
```

---

## 7단계: Nginx 설치

```bash
# 7-1. Nginx 설치
sudo apt install -y nginx

# 7-2. Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx

# 7-3. 방화벽 설정
sudo ufw allow 'Nginx Full'

# 7-4. 확인
curl http://localhost
# "Welcome to Nginx!" 응답이면 성공
```

---

## 8단계: 프로젝트 배포

### 8-1. 프로젝트 클론

```bash
# 프로젝트 디렉토리 생성
mkdir -p /var/www
cd /var/www

# Git 클론
sudo git clone https://github.com/helpbiz/smart-as.git
sudo chown -R ubuntu:ubuntu /var/www/smart-as

# 디렉토리 이동
cd /var/www/smart-as
```

### 8-2. Backend 설정

```bash
cd backend

# config.yaml 편집
nano config.yaml
```

```yaml
database:
  host: localhost
  port: 5432
  user: smartas
  password: SmartAs2024!
  dbname: smart_as
  sslmode: disable

jwt:
  secret: CHANGE-THIS-TO-A-VERY-LONG-RANDOM-STRING-IN-PRODUCTION
  expiry_hours: 168  # 7일

server:
  host: 0.0.0.0
  port: 8080

fcm:
  credentials_file: ""
```

```bash
# 8-3. Go 의존성 다운로드
go mod download

# 8-4. 빌드
go build -o bin/server ./cmd/server

# 8-5. systemd 서비스 생성
sudo nano /etc/systemd/system/smart-as-backend.service
```

```ini
[Unit]
Description=Smart A/S Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/smart-as/backend
ExecStart=/var/www/smart-as/backend/bin/server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 8-6. 서비스 시작
sudo systemctl daemon-reload
sudo systemctl start smart-as-backend
sudo systemctl enable smart-as-backend

# 8-7. 상태 확인
sudo systemctl status smart-as-backend
```

**✅ 확인**:
```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

---

### 8-8. Frontend 빌드

```bash
cd /var/www/smart-as/frontend/admin-web

# API URL 수정
nano src/api/index.ts
```

```typescript
// 변경 전
const API_BASE_URL = '/api/v1';

// 변경 후 (EC2 IP 사용)
const API_BASE_URL = 'http://<EC2-Public-IP>:8080/api/v1';
```

```bash
# 빌드
npm install
npm run build
```

---

## 9단계: Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/smart-as
```

```nginx
server {
    listen 80;
    server_name _;  # 모든 도메인

    # 프론트엔드 (React build)
    location / {
        root /var/www/smart-as/frontend/admin-web/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/smart-as/frontend/admin-web/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/smart-as /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 기본 설정 제거

# 문법 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

---

## 10단계: 관리자 계정 생성

```bash
# SSH 접속 또는 curl로 관리자 생성
curl -X POST http://localhost:8080/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}'
```

---

## 🎉 완료!

### 접속 정보

| 서비스 | URL |
|--------|-----|
| **Admin Web** | http://\<EC2-Public-IP\>/ |
| **Backend API** | http://\<EC2-Public-IP\>:8080/api/v1 |
| **Health Check** | http://\<EC2-Public-IP\>:8080/health |

### 관리자 로그인

- **URL**: http://\<EC2-Public-IP\>/
- **Username**: `admin`
- **Password**: `Admin123!`

---

## (선택사항) HTTPS 설정 (SSL)

### 도메인이 있는 경우

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 확인
sudo certbot renew --dry-run
```

### 도메인이 없는 경우

CloudFlare 무료 HTTPS 사용:
1. https://cloudflare.com 가입
2. 도메인 추가
3. DNS 설정에서 A 레코드 추가:
   - **Name**: @ 또는 www
   - **IPv4 address**: \<EC2-Public-IP\>
4. **SSL/TLS** → **Flexible** 선택

---

## 유지보수 명령어

```bash
# Backend 로그 확인
sudo journalctl -u smart-as-backend -f

# Backend 재시작
sudo systemctl restart smart-as-backend

# Backend 중지
sudo systemctl stop smart-as-backend

# Nginx 재시작
sudo systemctl reload nginx

# 전체 재시작
sudo systemctl restart smart-as-backend nginx
```

---

## 비용 안내 (무료 티어)

| 서비스 | 무료 티어 |
|--------|----------|
| EC2 t3.micro | 750시간/월 (12개월) |
| RDS db.t3.micro | 750시간/월 (12개월) |
| 데이터 전송 | 월 15GB OUT 무료 |

---

## 문제 해결

| 문제 | 해결책 |
|------|--------|
| Backend 시작 실패 | `sudo journalctl -u smart-as-backend -n 50` |
| DB 연결 오류 | PostgreSQL 상태 확인 + 비밀번호 확인 |
| 502 Gateway | Nginx → Backend 프록시 확인 |
| 정적 파일 404 | Nginx root 경로 확인 |
