# 1. 빌드 환경
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN cd backend && go mod download
RUN cd backend && go build -o /app/main ./cmd/server/main.go

# 2. 실행 환경
FROM alpine:latest
WORKDIR /root/

# 빌드된 실행 파일 복사
COPY --from=builder /app/main .

# 핵심 수정: config.yaml을 폴더 없이 바로 옆에 복사!
COPY --from=builder /app/backend/config.yaml ./config.yaml

# 3. 실행
CMD ["./main"]
