# 데이터베이스 스키마 문서

> PostgreSQL Database Schema for Smart A/S Connect

## 개요

- **데이터베이스**: PostgreSQL
- **버전**: 16+
- **테이블 수**: 5개
- **인코딩**: UTF-8

## ERD (엔티티 관계도)

```
┌──────────────┐       ┌──────────────────────┐       ┌──────────────┐
│    Users     │       │   RepairRequests    │       │  Technicians │
│   (고객)     │──────<│                     │>──────│    (기사)     │
└──────────────┘       └──────────────────────┘       └──────────────┘
                              │
                              │
                              ▼
                    ┌──────────────────────┐
                    │  RepairCompletions    │
                    │     (수리 완료)        │
                    └──────────────────────┘
                              ▲
                              │
                    ┌──────────────────────┐
                    │       Admins          │
                    │     (관리자)           │
                    └──────────────────────┘
```

## 테이블 상세

### 1. Users (고객 테이블)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fcm_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP  -- Soft delete
);
```

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PRIMARY KEY | 고유 ID |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 연락처 (로그인 ID) |
| name | VARCHAR(100) | NOT NULL | 이름 |
| email | VARCHAR(255) | UNIQUE | 이메일 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시된 비밀번호 |
| fcm_token | TEXT | - | Firebase 클라우드 메시징 토큰 |
| created_at | TIMESTAMP | DEFAULT | 생성 일시 |
| updated_at | TIMESTAMP | DEFAULT | 수정 일시 |
| deleted_at | TIMESTAMP | - | 삭제 일시 (Soft delete) |

---

### 2. Technicians (기사 테이블)

```sql
CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fcm_token TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    service_area VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PRIMARY KEY | 고유 ID |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 연락처 |
| name | VARCHAR(100) | NOT NULL | 이름 |
| email | VARCHAR(255) | UNIQUE | 이메일 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시된 비밀번호 |
| fcm_token | TEXT | - | FCM 토큰 |
| status | VARCHAR(20) | DEFAULT 'pending' | 상태: pending, approved, suspended |
| service_area | VARCHAR(100) | - | 서비스 지역 |
| latitude | DECIMAL(10,7) | - | 위도 |
| longitude | DECIMAL(10,7) | - | 경도 |
| created_at | TIMESTAMP | DEFAULT | 생성 일시 |
| updated_at | TIMESTAMP | DEFAULT | 수정 일시 |
| deleted_at | TIMESTAMP | - | 삭제 일시 |

---

### 3. RepairRequests (수리 요청 테이블)

```sql
CREATE TABLE repair_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    technician_id INTEGER REFERENCES technicians(id),
    product_name VARCHAR(200) NOT NULL,
    purchase_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    symptom_description TEXT,
    symptom_photos JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PRIMARY KEY | 고유 ID |
| user_id | INTEGER | REFERENCES users(id) | 고객 ID |
| technician_id | INTEGER | REFERENCES technicians(id) | 기사 ID (nullable) |
| product_name | VARCHAR(200) | NOT NULL | 제품명 |
| purchase_date | DATE | NOT NULL | 구매일 |
| customer_name | VARCHAR(100) | NOT NULL | 고객명 |
| phone | VARCHAR(20) | NOT NULL | 연락처 |
| address | TEXT | NOT NULL | 주소 |
| latitude | DECIMAL(10,7) | - | 위도 |
| longitude | DECIMAL(10,7) | - | 경도 |
| symptom_description | TEXT | - | 증상 설명 |
| symptom_photos | JSONB | - | 증상 사진 URL 배열 |
| status | VARCHAR(20) | DEFAULT 'pending' | 상태 |
| accepted_at | TIMESTAMP | - | 수락 일시 |
| created_at | TIMESTAMP | DEFAULT | 생성 일시 |
| updated_at | TIMESTAMP | DEFAULT | 수정 일시 |
| deleted_at | TIMESTAMP | - | 삭제 일시 |

---

### 4. RepairCompletions (수리 완료 테이블)

```sql
CREATE TABLE repair_completions (
    id SERIAL PRIMARY KEY,
    repair_request_id INTEGER NOT NULL UNIQUE REFERENCES repair_requests(id),
    technician_id INTEGER NOT NULL REFERENCES technicians(id),
    repair_details TEXT NOT NULL,
    parts_used TEXT,
    payment_amount INTEGER NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    completion_photos JSONB,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PRIMARY KEY | 고유 ID |
| repair_request_id | INTEGER | UNIQUE, REFERENCES | 요청 ID |
| technician_id | INTEGER | NOT NULL, REFERENCES | 기사 ID |
| repair_details | TEXT | NOT NULL | 수리 내용 |
| parts_used | TEXT | - | 사용 부품 |
| payment_amount | INTEGER | NOT NULL | 결제 금액 (원) |
| payment_method | VARCHAR(20) | NOT NULL | 결제 방법: card, cash, transfer |
| completion_photos | JSONB | - | 완료 사진 URL 배열 |
| completed_at | TIMESTAMP | DEFAULT | 완료 일시 |

---

### 5. Admins (관리자 테이블)

```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | SERIAL | PRIMARY KEY | 고유 ID |
| username | VARCHAR(100) | UNIQUE, NOT NULL | 관리자 아이디 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시된 비밀번호 |
| created_at | TIMESTAMP | DEFAULT | 생성 일시 |
| updated_at | TIMESTAMP | DEFAULT | 수정 일시 |
| deleted_at | TIMESTAMP | - | 삭제 일시 |

---

## 인덱스

```sql
-- users 테이블
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- technicians 테이블
CREATE INDEX idx_technicians_phone ON technicians(phone);
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_deleted_at ON technicians(deleted_at);

-- repair_requests 테이블
CREATE INDEX idx_repair_requests_user_id ON repair_requests(user_id);
CREATE INDEX idx_repair_requests_technician_id ON repair_requests(technician_id);
CREATE INDEX idx_repair_requests_status ON repair_requests(status);
CREATE INDEX idx_repair_requests_created_at ON repair_requests(created_at);
CREATE INDEX idx_repair_requests_deleted_at ON repair_requests(deleted_at);

-- repair_completions 테이블
CREATE INDEX idx_repair_completions_request_id ON repair_completions(repair_request_id);
CREATE INDEX idx_repair_completions_technician_id ON repair_completions(technician_id);
CREATE INDEX idx_repair_completions_completed_at ON repair_completions(completed_at);

-- admins 테이블
CREATE INDEX idx_admins_username ON admins(username);
```

---

## 마이그레이션 SQL

전체 마이그레이션 파일: `backend/migrations/001_init.sql`

```sql
-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fcm_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Technicians
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fcm_token TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    service_area VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- RepairRequests
CREATE TABLE IF NOT EXISTS repair_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    technician_id INTEGER REFERENCES technicians(id),
    product_name VARCHAR(200) NOT NULL,
    purchase_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    symptom_description TEXT,
    symptom_photos JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- RepairCompletions
CREATE TABLE IF NOT EXISTS repair_completions (
    id SERIAL PRIMARY KEY,
    repair_request_id INTEGER NOT NULL UNIQUE REFERENCES repair_requests(id),
    technician_id INTEGER NOT NULL REFERENCES technicians(id),
    repair_details TEXT NOT NULL,
    parts_used TEXT,
    payment_amount INTEGER NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    completion_photos JSONB,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

---

## 데이터 흐름

```
1. 고객 가입 → users 테이블에 INSERT
2. 기사 가입 → technicians 테이블에 INSERT (status='pending')
3. 관리자가 기사 승인 → technicians.status = 'approved' UPDATE
4. 고객이 요청 접수 → repair_requests 테이블에 INSERT
5. 기사가 요청 수락 → 
   - technicians_id UPDATE
   - status = 'assigned' UPDATE
   - accepted_at UPDATE
6. 기사가 수리 완료 →
   - repair_completions 테이블에 INSERT
   - repair_requests.status = 'completed' UPDATE
```

---

## 백업 및 복원

### 백업

```bash
pg_dump -U postgres -d smart_as > backup_$(date +%Y%m%d).sql
```

### 복원

```bash
psql -U postgres -d smart_as < backup_20260320.sql
```

### 자동 백업 (cron)

```bash
# 매일 새벽 3시에 백업
0 3 * * * pg_dump -U postgres smart_as > /backup/smart_as_$(date +\%Y\%m\%d).sql
```
