# Smart A/S 도커 배포 가이드 (Synology NAS)

## 사전 준비

### 1. DNS 설정 확인
네임서버에서 다음 DNS 레코드가 Synology NAS IP를 가리키는 지 확인:
- `A` 레코드: `foryouelec.co.kr` → `NAS_IP`

### 2. Synology NAS 요구사항
- Docker 패키지 설치
- PostgreSQL 데이터베이스 생성
- SSH 접근 (선택사항, CLI 작업용)

---

## 1. 데이터베이스 설정 (DSM)

### PostgreSQL 설치 및 설정
1. **패키지 센터** → **PostgreSQL** 설치
2. **控制面板** → **PostgreSQL** → **数据目录**
3. 데이터베이스 생성:
   ```
   - 데이터베이스명: smart_as
   - 사용자: smartas
   - 비밀번호: [강력한 비밀번호]
   ```

---

## 2. 파일 복사

### 방법 A: File Station 사용
1. Synology NAS의 공유 폴더에 프로젝트 복사:
   ```
   /volume1/docker/smart-as/
   ```

### 방법 B: rsync/SCP 사용
```bash
rsync -avz --progress ./smart-as user@NAS_IP:/volume1/docker/
```

---

## 3. 환경 설정

### .env 파일 생성
```bash
cd /volume1/docker/smart-as/docker

cp .env.example .env

nano .env
```

`.env` 파일 내용:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=smartas
DB_PASSWORD=your-strong-password
DB_NAME=smart_as
JWT_SECRET=your-random-secret-key-at-least-32-characters
```

---

## 4. Docker 이미지 빌드 및 실행

### DSM Docker 앱 사용

1. **Docker 앱** 실행
2. **映像** → **新增** → **从dockerfile构建**
3. 각 서비스의 Dockerfile을 선택하여 빌드:
   - `docker/backend.Dockerfile`
   - `docker/frontend.Dockerfile`
   - `docker/customer-app.Dockerfile`
   - `docker/technician-app.Dockerfile`

4. **容器** → **新增**
5. **docker-compose.yml** 불러오기 또는 개별 컨테이너 생성

### CLI 사용 (SSH 접속 가능 시)

```bash
cd /volume1/docker/smart-as/docker

docker-compose build

docker-compose up -d
```

---

## 5. SSL 인증서 설정 (Let's Encrypt)

### Certbot으로 인증서 발급
```bash
docker run -it --rm \
  -v ./data/certs:/etc/letsencrypt \
  -v ./data/certbot/www:/var/www/certbot \
  certbot/certbot \
  certonly --webroot -w /var/www/certbot \
  -d foryouelec.co.kr
```

---

## 6. 접속 URL

| 서비스 | URL |
|--------|-----|
| 관리자 웹 | https://foryouelec.co.kr |
| 고객 앱 | https://foryouelec.co.kr/customer-app |
| 기사 앱 | https://foryouelec.co.kr/technician-app |
| API | https://foryouelec.co.kr/api/v1 |

---

## 7. 관리자 계정 생성 (최초 1회)

```bash
docker exec smartas-backend ./smart-as

# 또는 curl로 API 호출
curl -X POST https://foryouelec.co.kr/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 8. 트러블슈팅

### 컨테이너 로그 확인
```bash
docker logs smartas-backend
docker logs smartas-nginx
```

### 컨테이너 재시작
```bash
docker-compose restart
```

### 전체 중지 및 삭제
```bash
docker-compose down
```

---

## 파일 구조

```
/volume1/docker/smart-as/
├── docker/
│   ├── docker-compose.yml
│   ├── .env (사용자 생성)
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   ├── customer-app.Dockerfile
│   ├── technician-app.Dockerfile
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   │       └── foryouelec.co.kr.conf
│   └── data/
│       ├── certs/
│       └── uploads/
├── backend/
├── frontend/
└── mobile/
```

---

## 유지보수

### 업데이트 배포
```bash
git pull
docker-compose build
docker-compose up -d
```

### 로그 로테이션
Docker 컨테이너 로그는 DSM의 Docker 앱에서 확인 가능
