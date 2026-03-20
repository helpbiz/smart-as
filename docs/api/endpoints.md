# API 엔드포인트 문서

> Smart A/S Connect Backend API Reference

## 기본 정보

| 항목 | 내용 |
|------|------|
| **Base URL** | `http://localhost:8080/api/v1` (로컬) |
| **Content-Type** | `application/json` |
| **인코딩** | UTF-8 |

## 인증

### JWT 토큰 사용

Protected 엔드포인트는 `Authorization` 헤더에 Bearer 토큰을 포함해야 합니다:

```
Authorization: Bearer <jwt_token>
```

### 에러 응답 형식

```json
{
  "error": "에러 메시지"
}
```

---

## 고객 API (`/customer`)

### 1. 회원가입

**POST** `/customer/register`

```bash
curl -X POST http://localhost:8080/api/v1/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678",
    "name": "홍길동",
    "email": "hong@example.com",
    "password": "password123"
  }'
```

**요청 본문:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| phone | string | ✅ | 연락처 (로그인 ID) |
| name | string | ✅ | 이름 |
| email | string | ❌ | 이메일 |
| password | string | ✅ | 비밀번호 (6자 이상) |

**응답 (201 Created):**

```json
{
  "id": 1,
  "phone": "01012345678",
  "name": "홍길동",
  "email": "hong@example.com"
}
```

---

### 2. 로그인

**POST** `/customer/login`

```bash
curl -X POST http://localhost:8080/api/v1/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678",
    "password": "password123"
  }'
```

**응답 (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "phone": "01012345678",
    "name": "홍길동"
  }
}
```

---

### 3. A/S 요청 접수

**POST** `/customer/repair-requests`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X POST http://localhost:8080/api/v1/customer/repair-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "product_name": "삼성 냉장고",
    "purchase_date": "2023-01-15",
    "customer_name": "홍길동",
    "phone": "01012345678",
    "address": "서울시 강남구 테헤란로 123",
    "latitude": 37.5665,
    "longitude": 126.9780,
    "symptom_description": "냉기가 잘 안 만들어집니다"
  }'
```

**요청 본문:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| product_name | string | ✅ | 제품명 |
| purchase_date | date | ✅ | 구매일 (YYYY-MM-DD) |
| customer_name | string | ✅ | 고객명 |
| phone | string | ✅ | 연락처 |
| address | string | ✅ | 주소 |
| latitude | float | ❌ | 위도 |
| longitude | float | ❌ | 경도 |
| symptom_description | string | ❌ | 증상 설명 |
| symptom_photos | array | ❌ | 증상 사진 URL 배열 |

**응답 (201 Created):**

```json
{
  "id": 1,
  "user_id": 1,
  "product_name": "삼성 냉장고",
  "status": "pending",
  "created_at": "2026-03-20T10:00:00Z"
}
```

---

### 4. 내 요청 목록

**GET** `/customer/repair-requests`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/customer/repair-requests \
  -H "Authorization: Bearer <token>"
```

**응답:**

```json
[
  {
    "id": 1,
    "product_name": "삼성 냉장고",
    "status": "assigned",
    "technician": {
      "name": "김기사",
      "phone": "01098765432"
    },
    "created_at": "2026-03-20T10:00:00Z"
  }
]
```

---

### 5. 요청 상세

**GET** `/customer/repair-requests/:id`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/customer/repair-requests/1 \
  -H "Authorization: Bearer <token>"
```

---

### 6. FCM 토큰 업데이트

**PUT** `/customer/repair-requests/:id/fcm-token`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X PUT http://localhost:8080/api/v1/customer/repair-requests/1/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"fcm_token": "dGVzdC10b2tlbi14eHh4"}'
```

---

## 기사 API (`/technician`)

### 1. 기사 회원가입

**POST** `/technician/register`

```bash
curl -X POST http://localhost:8080/api/v1/technician/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01098765432",
    "name": "김기사",
    "password": "tech123",
    "email": "kim@tech.com",
    "service_area": "서울",
    "latitude": 37.5665,
    "longitude": 126.9780
  }'
```

**응답 (201 Created):**

```json
{
  "id": 1,
  "phone": "01098765432",
  "name": "김기사",
  "status": "pending"
}
```

> ⚠️ **주의**: 기사 가입 후 관리자가 승인해야 로그인 가능합니다.

---

### 2. 기사 로그인

**POST** `/technician/login`

```bash
curl -X POST http://localhost:8080/api/v1/technician/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01098765432",
    "password": "tech123"
  }'
```

**응답 (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "phone": "01098765432",
    "name": "김기사",
    "status": "approved"
  }
}
```

**에러 응답:**

```json
{
  "error": "account not approved yet"
}
```

---

### 3. 대기 중인 요청 목록

**GET** `/technician/repair-requests`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/technician/repair-requests \
  -H "Authorization: Bearer <token>"
```

**응답:**

```json
[
  {
    "id": 1,
    "product_name": "삼성 냉장고",
    "customer_name": "홍길동",
    "phone": "01012345678",
    "address": "서울시 강남구...",
    "symptom_description": "냉기 부족",
    "status": "pending",
    "created_at": "2026-03-20T10:00:00Z"
  }
]
```

---

### 4. 요청 수락

**POST** `/technician/repair-requests/:id/accept`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X POST http://localhost:8080/api/v1/technician/repair-requests/1/accept \
  -H "Authorization: Bearer <token>"
```

**응답 (200 OK):**

```json
{
  "message": "request accepted"
}
```

---

### 5. 내 배정 목록

**GET** `/technician/assignments`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/technician/assignments \
  -H "Authorization: Bearer <token>"
```

---

### 6. 수리 시작

**POST** `/technician/assignments/:id/start`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X POST http://localhost:8080/api/v1/technician/assignments/1/start \
  -H "Authorization: Bearer <token>"
```

---

### 7. 수리 완료

**POST** `/technician/assignments/:id/complete`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X POST http://localhost:8080/api/v1/technician/assignments/1/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "repair_details": "컴프레서 교체를 통해 수리 완료",
    "parts_used": "컴프레서 1개",
    "payment_amount": 150000,
    "payment_method": "card",
    "completion_photos": ["https://..."]
  }'
```

**요청 본문:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| repair_details | string | ✅ | 수리 내용 |
| parts_used | string | ❌ | 사용 부품 |
| payment_amount | int | ✅ | 결제 금액 (원) |
| payment_method | string | ✅ | 결제 방법: `card`, `cash`, `transfer` |
| completion_photos | array | ❌ | 완료 사진 URL 배열 |

---

### 8. FCM 토큰 업데이트

**PUT** `/technician/fcm-token`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X PUT http://localhost:8080/api/v1/technician/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"fcm_token": "dGVzdC10b2tlbi14eHh4"}'
```

---

## 관리자 API (`/admin`)

### 1. 관리자 로그인

**POST** `/admin/login`

```bash
curl -X POST http://localhost:8080/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

### 2. 관리자 생성

**POST** `/admin/register`

```bash
curl -X POST http://localhost:8080/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin2",
    "password": "password123"
  }'
```

---

### 3. 대시보드 통계

**GET** `/admin/dashboard`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

**응답:**

```json
{
  "today_requests": 5,
  "today_assigned": 3,
  "today_completed": 2,
  "pending_requests": 10,
  "total_technicians": 15,
  "approved_technicians": 12
}
```

---

### 4. 기사 목록

**GET** `/admin/technicians`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/admin/technicians \
  -H "Authorization: Bearer <token>"
```

---

### 5. 기사 승인

**PUT** `/admin/technicians/:id/approve`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -X PUT http://localhost:8080/api/v1/admin/technicians/1/approve \
  -H "Authorization: Bearer <token>"
```

---

### 6. 전체 요청 목록

**GET** `/admin/repair-requests`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/admin/repair-requests \
  -H "Authorization: Bearer <token>"
```

---

### 7. 통계/정산

**GET** `/admin/statistics`

> 🔒 인증 필요 (Bearer Token)

```bash
curl http://localhost:8080/api/v1/admin/statistics \
  -H "Authorization: Bearer <token>"
```

**응답:**

```json
{
  "total_revenue": 1500000,
  "monthly_revenue": [
    {"month": "2026-03", "revenue": 500000, "count": 5},
    {"month": "2026-02", "revenue": 1000000, "count": 10}
  ],
  "technician_stats": [
    {
      "technician_id": 1,
      "technician_name": "김기사",
      "total_jobs": 25,
      "total_revenue": 750000
    }
  ]
}
```

---

### 8. 엑셀 다운로드

**GET** `/admin/export/excel`

> 🔒 인증 필요 (Bearer Token)

```bash
curl -O -J http://localhost:8080/api/v1/admin/export/excel \
  -H "Authorization: Bearer <token>"
```

**응답:** Excel 파일 (`.xlsx`) 다운로드

---

## 요청 상태 (Status)

| 상태 | 설명 |
|------|------|
| `pending` | 대기 중 (아직 기사 배정 안됨) |
| `assigned` | 배정됨 (기사 수락 완료) |
| `repairing` | 수리 중 (기사 작업 시작) |
| `completed` | 완료 (수리 완료) |

## 기사 상태 (Technician Status)

| 상태 | 설명 |
|------|------|
| `pending` | 승인 대기 |
| `approved` | 승인 완료 |
| `suspended` | 정지됨 |
