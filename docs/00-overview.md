# Smart A/S Connect - 프로젝트 개요

> 소형가전 A/S 매칭 및 관리 시스템

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| **버전** | v1.0 |
| **작성일** | 2026-03-20 |
| **상태** | 개발 완료 |

## 프로젝트 설명

Smart A/S Connect는 소형가전(냉장고, 세탁기,空调 등)의 애프터서비스를 위한 종합 관리 시스템입니다.

### 주요 기능

1. **고객 앱** - A/S 요청 접수 및 상태 확인
2. **기사 앱** - 수리 요청 확인, 수락, 작업 완료
3. **관리자 웹** - 전체 서비스 관리, 통계, 정산

## 기술 스택

### Backend
- **언어**: Go 1.22+
- **프레임워크**: Gin (HTTP 라우팅)
- **ORM**: GORM (데이터베이스)
- **데이터베이스**: PostgreSQL
- **인증**: JWT (JSON Web Token)
- **푸시알림**: Firebase Cloud Messaging (FCM)

### Frontend
- **Admin Web**: React 18 + TypeScript + Tailwind CSS + React Query
- **Customer App**: React Native + Expo
- **Technician App**: React Native + Expo

### 인프라
- **호스팅**: AWS EC2
- **웹서버**: Nginx
- **HTTPS**: Let's Encrypt (Certbot)

## 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자                                  │
├─────────────┬─────────────────────┬─────────────────────────┤
│  고객 앱     │     기사 앱           │      관리자 웹            │
│ (Customer)  │   (Technician)      │    (Admin Web)          │
└──────┬──────┴──────────┬──────────┴──────────┬───────────────┘
       │                 │                    │
       │    REST API (HTTP/HTTPS)              │
       │                 │                    │
┌──────▼─────────────────▼────────────────────▼───────────────┐
│                    Backend (Go/Gin)                          │
│                    http://localhost:8080                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Customer │  │ Technician│  │  Admin  │  │   FCM   │    │
│  │ Handler  │  │  Handler  │  │ Handler │  │  Client │    │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────────┘    │
│       │              │             │                         │
│  ┌────▼─────────────▼─────────────▼─────────────┐          │
│  │              Service Layer                      │          │
│  └────────────────────┬──────────────────────────┘          │
│                       │                                       │
│  ┌────────────────────▼──────────────────────────┐          │
│  │           Repository Layer                    │          │
│  └────────────────────┬──────────────────────────┘          │
│                       │                                       │
│  ┌────────────────────▼──────────────────────────┐          │
│  │              PostgreSQL Database                │          │
│  └───────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 사용자 역할

### 1. 고객 (Customer)
- 회원가입/로그인
- A/S 요청 접수
- 요청 상태 확인
- 수리 완료 알림 수신

### 2. 기사 (Technician)
- 회원가입/로그인 (관리자 승인 필요)
- 대기 중인 요청 확인
- 요청 수락
- 수리 작업 (시작 → 완료)
- 완료 정보 입력 (부품, 결제)

### 3. 관리자 (Admin)
- 기사 승인/관리
- 전체 요청 현황
- 통계 및 정산
- 엑셀 데이터导出

## 서비스 흐름

```
1. [고객] A/S 요청 접수
        ↓
2. [서버] 기사들에게 푸시 알림 전송
        ↓
3. [기사] 요청 확인 및 수락
        ↓
4. [서버] 고객에게 "수락됨" 알림
        ↓
5. [기사] 현장 방문 → 수리 시작
        ↓
6. [기사] 수리 완료 → 정보 입력
        ↓
7. [서버] 고객에게 "완료됨" 알림
        ↓
8. [관리자] 통계/정산 확인
```

## 파일 구조

```
smart-as/
├── backend/                    # Go Backend API
│   ├── cmd/server/main.go      # 서버 진입점
│   ├── internal/
│   │   ├── config/            # 설정 관리
│   │   ├── fcm/               # Firebase 알림
│   │   ├── handlers/           # HTTP 핸들러
│   │   ├── middleware/         # JWT, CORS
│   │   ├── models/             # 데이터 모델
│   │   ├── repository/         # DB 연산
│   │   └── service/            # 비즈니스 로직
│   ├── migrations/             # DB 마이그레이션
│   ├── config.yaml             # 설정 파일
│   └── go.mod
├── frontend/admin-web/          # React Admin Web
│   ├── src/
│   │   ├── api/               # API 클라이언트
│   │   ├── components/         # UI 컴포넌트
│   │   ├── pages/             # 페이지
│   │   ├── types/             # TypeScript 타입
│   │   └── App.tsx
│   └── package.json
├── mobile/
│   ├── customer-app/           # 고객용 React Native
│   └── technician-app/         # 기사용 React Native
├── docs/                       # 개발 문서
└── README.md                   # 프로젝트 설명
```

## 다음 단계

1. [로컬 개발 환경 설정](./setup/local-dev.md)
2. [AWS 배포](./setup/aws-deploy.md)
3. [API 문서](./api/endpoints.md)
4. [DB 스키마](./database/schema.md)
