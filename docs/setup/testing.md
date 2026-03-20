# 테스트 가이드

> 초보 개발자를 위한 API 테스트 방법

## 테스트 도구 소개

### 1. 브라우저 (간단한 GET 요청)

```bash
# 서버 상태 확인
curl http://localhost:8080/health

# 응답: {"status":"ok"}
```

### 2. curl (명령줄)

모든 HTTP 요청을 명령줄에서 테스트할 수 있습니다.

### 3. Postman (GUI)

https://www.postman.com/downloads/ 에서 설치

### 4. Thunder Client (VS Code 확장)

VS Code에서 직접 API 테스트 가능

---

## 기본 curl 사용법

### GET 요청

```bash
curl http://localhost:8080/api/v1/health
```

### POST 요청 (JSON)

```bash
curl -X POST http://localhost:8080/api/v1/test \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### 인증이 필요한 요청

```bash
curl http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 파일 다운로드

```bash
curl -O -J http://localhost:8080/api/v1/admin/export/excel \
  -H "Authorization: Bearer <token>"
```

---

## 단계별 테스트 시나리오

### 1단계: 서버 확인

```bash
# Backend 서버 상태
curl http://localhost:8080/health

# ✅ 예상 응답
{"status":"ok"}
```

### 2단계: 관리자 계정 생성

```bash
curl -X POST http://localhost:8080/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**✅ 예상 응답**: `{"message":"admin created"}`

### 3단계: 관리자 로그인

```bash
curl -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**✅ 예상 응답**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {"id": 1, "username": "admin"}
}
```

**💡 토큰 복사**: 응답의 `token` 값을 복사하세요 (긴 문자열)

### 4단계: 대시보드 조회 (인증 필요)

```bash
curl http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer <여기에_토큰_粘贴>"
```

**✅ 예상 응답**:
```json
{
  "today_requests": 0,
  "today_assigned": 0,
  "today_completed": 0,
  "pending_requests": 0,
  "total_technicians": 0,
  "approved_technicians": 0
}
```

### 5단계: 기사 회원가입

```bash
curl -X POST http://localhost:8080/api/v1/technician/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678",
    "name": "김기사",
    "password": "tech123",
    "service_area": "서울"
  }'
```

**✅ 예상 응답**:
```json
{
  "id": 1,
  "phone": "01012345678",
  "name": "김기사",
  "status": "pending"
}
```

### 6단계: 기사 승인 (관리자만)

```bash
curl -X PUT http://localhost:8080/api/v1/admin/technicians/1/approve \
  -H "Authorization: Bearer <관리자_토큰>"
```

**✅ 예상 응답**: `{"message":"technician approved"}`

### 7단계: 기사 로그인

```bash
curl -X POST http://localhost:8080/api/v1/technician/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "01012345678", "password": "tech123"}'
```

**✅ 예상 응답**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "phone": "01012345678",
    "name": "김기사",
    "status": "approved"
  }
}
```

### 8단계: 고객 회원가입

```bash
curl -X POST http://localhost:8080/api/v1/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01098765432",
    "name": "홍길동",
    "password": "customer123"
  }'
```

**✅ 예상 응답**:
```json
{
  "id": 1,
  "phone": "01098765432",
  "name": "홍길동"
}
```

### 9단계: 고객 로그인

```bash
curl -X POST http://localhost:8080/api/v1/customer/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "01098765432", "password": "customer123"}'
```

### 10단계: A/S 요청 접수 (고객)

```bash
curl -X POST http://localhost:8080/api/v1/customer/repair-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <고객_토큰>" \
  -d '{
    "product_name": "삼성 냉장고",
    "purchase_date": "2023-01-15",
    "customer_name": "홍길동",
    "phone": "01098765432",
    "address": "서울시 강남구 테헤란로 123",
    "symptom_description": "냉기가 잘 안 만들어집니다"
  }'
```

**✅ 예상 응답**:
```json
{
  "id": 1,
  "user_id": 1,
  "product_name": "삼성 냉장고",
  "status": "pending",
  "created_at": "2026-03-20T10:00:00Z"
}
```

### 11단계: 대기 중인 요청 목록 (기사)

```bash
curl http://localhost:8080/api/v1/technician/repair-requests \
  -H "Authorization: Bearer <기사_토큰>"
```

### 12단계: 요청 수락 (기사)

```bash
curl -X POST http://localhost:8080/api/v1/technician/repair-requests/1/accept \
  -H "Authorization: Bearer <기사_토큰>"
```

### 13단계: 수리 시작 (기사)

```bash
curl -X POST http://localhost:8080/api/v1/technician/assignments/1/start \
  -H "Authorization: Bearer <기사_토큰>"
```

### 14단계: 수리 완료 (기사)

```bash
curl -X POST http://localhost:8080/api/v1/technician/assignments/1/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <기사_토큰>" \
  -d '{
    "repair_details": "컴프레서 교체하여 수리 완료",
    "parts_used": "컴프레서 1개",
    "payment_amount": 150000,
    "payment_method": "card"
  }'
```

### 15단계: 통계 확인 (관리자)

```bash
curl http://localhost:8080/api/v1/admin/statistics \
  -H "Authorization: Bearer <관리자_토큰>"
```

---

## Postman 설정

### Collection 생성

1. Postman 실행
2. **Collections** → **+** 클릭
3. 이름: `Smart A/S API`

### 환경 변수 설정

1. **Environments** → **+** 클릭
2. 이름: `Development`

| 변수 | Initial Value | Current Value |
|------|---------------|---------------|
| baseUrl | http://localhost:8080/api/v1 | http://localhost:8080/api/v1 |
| adminToken | | (로그인 후 복사) |
| customerToken | | (로그인 후 복사) |
| technicianToken | | (로그인 후 복사) |

### 요청 추가

**관리자 로그인**:
```
Method: POST
URL: {{baseUrl}}/admin/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "username": "admin",
  "password": "admin123"
}
```

Tests 탭에 추가:
```javascript
var jsonData = pm.response.json();
pm.environment.set("adminToken", jsonData.token);
```

---

## 에러 코드

| 코드 | 의미 | 해결책 |
|------|------|--------|
| 400 | 잘못된 요청 | 요청 본문 확인 |
| 401 | 인증 실패 | 토큰 확인, 다시 로그인 |
| 403 | 권한 없음 | 적절한 역할(고객/기사/관리자) 확인 |
| 404 | 찾을 수 없음 | ID나 URL 확인 |
| 409 | 충돌 | 이미 존재하는 데이터 (전화번호 중복 등) |
| 500 | 서버 오류 | Backend 로그 확인 |

---

## 실습 연습 문제

### 문제 1: 새로운 기사 등록 및 승인
1. 전화번호 `01055556666`으로 기사 가입
2. 관리자로 승인
3. 로그인하여 토큰 확인

### 문제 2: 전체 서비스 플로우
1. 고객으로 가입
2. A/S 요청 2개 접수
3. 기사가 1개 수락
4. 수리 완료 (결제 10만원, 카드)
5. 관리자로 통계 확인

### 문제 3: 엑셀 다운로드
1. 관리자로 로그인
2. 엑셀 다운로드 API 테스트
3. 다운로드된 파일 확인
