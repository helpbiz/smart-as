# 아키텍처 문서

> Smart A/S Connect 시스템 설계 및架构

## 시스템 아키텍처

### 전체 구조

```
┌────────────────────────────────────────────────────────────────────┐
│                           Client Layer                              │
├─────────────────┬──────────────────────┬────────────────────────────┤
│                 │                      │                            │
│   Customer App  │   Technician App     │     Admin Web              │
│   (React Native)│   (React Native)     │     (React)                │
│                 │                      │                            │
└────────┬────────┴──────────┬─────────┴────────────┬─────────────┘
         │                     │                        │
         │ HTTP/REST          │ HTTP/REST              │ HTTP/REST
         │                     │                        │
┌────────▼─────────────────────▼────────────────────────▼─────────────┐
│                         API Gateway Layer                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Go Backend Server                          │  │
│  │                        :8080                                   │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │   Router    │  │ Middleware  │  │  Handlers   │          │  │
│  │  │   (Gin)     │──│ JWT / CORS  │──│  Customer   │          │  │
│  │  │             │  │             │  │ Technician  │          │  │
│  │  │             │  │             │  │   Admin     │          │  │
│  │  └─────────────┘  └─────────────┘  └──────┬──────┘          │  │
│  │                                             │                  │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │                    Service Layer                       │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │  │
│  │  │  │   Auth   │ │  Repair  │ │   FCM    │ │  Stats  │ │   │  │
│  │  │  │ Service  │ │ Service  │ │ Service  │ │ Service │ │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │                                             │                  │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │                  Repository Layer                     │   │  │
│  │  │              (GORM / PostgreSQL)                     │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    External Services                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │    FCM       │  │   Excelize   │  │     SMTP     │      │  │
│  │  │ (Push Notif) │  │   (Export)    │  │  (Future)    │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
         │
         │ JDBC/PostgreSQL
         │
┌────────▼─────────────────────────────────────────────────────────┐
│                      Data Layer                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL 16                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │
│  │  │  Users   │ │Technician│ │RepairReq │ │Admins    │      │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 레이어별 설명

### 1. Client Layer (프레젠테이션)

#### Admin Web (React)
- **기술**: React 18, TypeScript, Tailwind CSS, React Query
- **역할**: 관리자 대시보드, 통계, 기사 관리
- **상태 관리**: React Query (서버 상태), Context (로컬 상태)

#### Customer App (React Native)
- **기술**: React Native, Expo
- **역할**: 고객 회원가입, A/S 요청, 상태 확인
- **스토리지**: AsyncStorage (토큰 저장)

#### Technician App (React Native)
- **기술**: React Native, Expo
- **역할**: 대기 요청 확인, 수락, 수리 완료
- **내비게이션**: React Navigation

---

### 2. API Gateway Layer

#### Router (Gin)
```
/api/v1/customer/*     → CustomerHandler
/api/v1/technician/*   → TechnicianHandler  
/api/v1/admin/*        → AdminHandler
/health                → Health Check
```

#### Middleware
1. **CORS**: Cross-Origin Resource Sharing
2. **JWT Auth**: 토큰 검증
3. **Logger**: 요청 로깅

---

### 3. Handler Layer

각 핸들러는 HTTP 요청을 받아 Service를 호출합니다.

```
CustomerHandler
├── Register()     POST /customer/register
├── Login()        POST /customer/login
├── CreateRepairRequest()  POST /customer/repair-requests
├── ListRepairRequests()    GET /customer/repair-requests
├── GetRepairRequest()      GET /customer/repair-requests/:id
└── UpdateFCMToken()       PUT /customer/repair-requests/:id/fcm-token

TechnicianHandler
├── Register()     POST /technician/register
├── Login()        POST /technician/login
├── ListAvailableRequests()  GET /technician/repair-requests
├── AcceptRequest()          POST /technician/repair-requests/:id/accept
├── ListAssignments()        GET /technician/assignments
├── StartRepair()            POST /technician/assignments/:id/start
├── CompleteRepair()         POST /technician/assignments/:id/complete
└── UpdateFCMToken()        PUT /technician/fcm-token

AdminHandler
├── Login()          POST /admin/login
├── CreateAdmin()     POST /admin/register
├── GetDashboard()    GET /admin/dashboard
├── ListTechnicians()     GET /admin/technicians
├── ApproveTechnician()   PUT /admin/technicians/:id/approve
├── ListRepairRequests()  GET /admin/repair-requests
├── GetStatistics()       GET /admin/statistics
└── ExportExcel()         GET /admin/export/excel
```

---

### 4. Service Layer (비즈니스 로직)

#### AuthService
- 사용자 등록/로그인
- JWT 토큰 생성/검증
- 비밀번호 해싱 (bcrypt)

#### RepairService
- 요청 생성
- 기사 배정
- 상태 관리
- 완료 처리

#### FCMService
- Firebase Cloud Messaging 연동
- 푸시 알림 발송

#### StatisticsService
- 매출 통계
- 월별 데이터
- 기사별 통계

---

### 5. Repository Layer (데이터 접근)

GORM ORM을 사용하여 PostgreSQL과 통신합니다.

```go
type Repository struct {
    db *gorm.DB
}

// 주요 메서드
CreateUser()
GetUserByPhone()
CreateRepairRequest()
GetPendingRepairRequests()
AssignTechnician()
GetTechnicianStats()
```

---

## 인증 흐름

```
┌──────────┐                    ┌──────────────┐                    ┌────────────┐
│  Client  │                    │   Backend    │                    │    DB      │
└────┬─────┘                    └──────┬───────┘                    └─────┬──────┘
     │                                 │                                │
     │  1. Login Request               │                                │
     │  (phone, password)              │                                │
     │────────────────────────────────>│                                │
     │                                 │                                │
     │                                 │  2. SELECT * FROM users        │
     │                                 │     WHERE phone = ?            │
     │                                 │───────────────────────────────>│
     │                                 │                                │
     │                                 │  3. 비밀번호 검증 (bcrypt)      │
     │                                 │                                │
     │  4. JWT 토큰 생성               │                                │
     │     {user_id, role, exp}       │                                │
     │<────────────────────────────────│                                │
     │                                 │                                │
     │  5. 이후 요청에 토큰 포함        │                                │
     │  Authorization: Bearer <token>  │                                │
     │────────────────────────────────>│                                │
     │                                 │                                │
     │                                 │  6. 토큰 검증 & user_id 추출   │
     │                                 │                                │
     │  7. 요청 처리 결과               │                                │
     │<────────────────────────────────│                                │
```

---

## 알림 흐름 (FCM)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│ Customer │    │   Backend    │    │     FCM      │    │  Technician│
│   App    │    │   Server     │    │   Server     │    │    App     │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                  │
     │ FCM Token 저장  │                   │                  │
     │────────────────>│                   │                  │
     │                 │                   │                  │
     │                 │ 기사가 요청 수락   │                  │
     │                 │───────────────────>│                  │
     │                 │                   │ Push Noti        │
     │ 알림 수신       │                   │─────────────────>│
     │<────────────────│                   │                  │
```

---

## 배포 아키텍처 (AWS)

```
                         ┌─────────────────┐
                         │   Route 53      │
                         │   (DNS)         │
                         └────────┬────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │         ALB               │
                    │   (Load Balancer)         │
                    │   + ACM (SSL)             │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼─────────┐ ┌──────▼──────┐ ┌────────▼────────┐
    │   EC2 Instance    │ │  EC2        │ │    RDS           │
    │   (Backend)       │ │  Instance    │ │  (PostgreSQL)    │
    │   Go Server       │ │  (Frontend)  │ │                  │
    │   :8080           │ │  Nginx       │ │  Multi-AZ        │
    │                   │ │  :80/:443    │ │  Backup          │
    └───────────────────┘ └─────────────┘ └──────────────────┘
```

---

## 보안 고려사항

### 1. 인증/인가
- [x] JWT 토큰 사용 (만료시간 24시간)
- [x] bcrypt 비밀번호 해싱 (cost 12)
- [x] 역할 기반 접근 제어 (Customer, Technician, Admin)

### 2. 데이터 보안
- [ ] HTTPS强制 (프로덕션)
- [x] SQL 인젝션 방지 (GORM Parameterized Query)
- [ ] 민감 데이터 암호화

### 3. API 보안
- [ ] Rate Limiting
- [ ] 입력 검증
- [ ] CORS 설정

---

## 성능 최적화

### 1. 데이터베이스
- 적절한 인덱스 설정
- N+1 쿼리 방지 (Preload)
- 연결 풀 설정

### 2. API
- 응답 캐싱 (Redis - 향후)
- 압축 (gzip)
- 페이지네이션

### 3. 클라이언트
- React Query 캐싱
- 이미지 최적화
- 코드 분할 (Code Splitting)
