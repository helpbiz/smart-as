# 문서 인덱스

> Smart A/S Connect 개발 문서

## 📚 문서 목록

### 시작하기
- [프로젝트 개요](./00-overview.md) - 프로젝트 전체 구조 및 설명
- [로컬 개발 환경 설정](./setup/local-dev.md) - Windows/Mac/Linux 개발 환경 구축
- [AWS 배포 가이드](./setup/aws-deploy.md) - EC2에 배포하는 방법

### 개발
- [API 엔드포인트](./api/endpoints.md) - 모든 API 문서
- [DB 스키마](./database/schema.md) - 데이터베이스 테이블 구조
- [아키텍처](./architecture/system-design.md) - 시스템 설계 문서

### 설정 및 운영
- [설정 가이드](./setup/configuration.md) - config.yaml 및 환경 설정
- [테스트 가이드](./setup/testing.md) - API 테스트 방법 (curl, Postman)
- [문제 해결](./troubleshooting/common-issues.md) - 자주 발생하는 오류 해결

---

## 🚀 빠른 시작

### 로컬 개발

```bash
# 1. 프로젝트 클론
git clone https://github.com/helpbiz/smart-as.git
cd smart-as

# 2. PostgreSQL 설정
# (docs/setup/local-dev.md 참고)

# 3. Backend 실행
cd backend
go run ./cmd/server

# 4. Frontend 실행 (새 터미널)
cd frontend/admin-web
npm install
npm run dev
```

### 관리자 계정 생성

```bash
curl -X POST http://localhost:8080/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 📁 문서 구조

```
docs/
├── 00-overview.md           # 프로젝트 개요
├── api/
│   └── endpoints.md         # API 문서
├── architecture/
│   └── system-design.md     # 아키텍처 문서
├── database/
│   └── schema.md            # DB 스키마
├── setup/
│   ├── local-dev.md         # 로컬 개발 가이드
│   ├── aws-deploy.md        # AWS 배포 가이드
│   ├── configuration.md     # 설정 가이드
│   └── testing.md           # 테스트 가이드
└── troubleshooting/
    └── common-issues.md     # 문제 해결
```

---

## 🔗 유용한 링크

- [GitHub 저장소](https://github.com/helpbiz/smart-as)
- [Go 문서](https://go.dev/doc/)
- [Gin 프레임워크](https://gin-gonic.com/)
- [GORM](https://gorm.io/)
- [React Query](https://tanstack.com/query/latest)
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)

---

## 업데이트 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-03-20 | 1.0 | 초기 문서 작성 |
