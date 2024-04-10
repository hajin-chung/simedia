FROM node:18-alpine as web-builder
WORKDIR /web
COPY web/package.json web/pnpm-lock.yaml ./
COPY web/ ./
RUN npm install -g pnpm && pnpm install
RUN npm run build

FROM golang:1.22 as server-builder
WORKDIR /server
COPY . .
RUN CGO_ENABLED=0 go build -o simedia .

FROM alpine:latest
WORKDIR /root/
COPY --from=server-builder /server/simedia .
COPY --from=web-builder /web/dist ./public
EXPOSE 3000

CMD ["./simedia", "--port=3000", "--dir=/media"]

