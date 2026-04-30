# Module 10 — Multi-stage Dockerfile.
# Stage 1: Node bakes the React bundle.
# Stage 2: Go compiles the static binary.
# Stage 3: tiny Alpine runtime carries only the binary, the bundle, and the data.
# Result: one image, runs anywhere, ~25MB.

# ---- Stage 1: web bundle ----
FROM node:20-alpine AS web-builder
WORKDIR /web
COPY web/package.json web/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY web/ ./
RUN npm run build

# ---- Stage 2: go binary ----
FROM golang:1.22-alpine AS go-builder
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download || true
COPY . .
ENV CGO_ENABLED=0 GOOS=linux
RUN go build -ldflags="-s -w" -o /out/server ./cmd/server

# ---- Stage 3: runtime ----
FROM alpine:3.20 AS runtime
RUN apk add --no-cache ca-certificates tzdata && adduser -D -g '' app
WORKDIR /app
COPY --from=go-builder /out/server /app/server
COPY --from=web-builder /web/dist /app/web/dist
COPY --from=go-builder /src/data /app/data
USER app
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["/app/server", "-port=8080", "-web=/app/web/dist", "-data=/app/data/items.json"]
