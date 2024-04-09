FROM golang:1.22.1

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

WORKDIR /app
COPY . .

WORKDIR /app/web
RUN pnpm install
RUN pnpm run build

WORKDIR /app
RUN go build -o server .

EXPOSE 3000

CMD ["./server", "--port=3000", "--dir=/media"]

