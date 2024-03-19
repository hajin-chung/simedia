FROM golang:1.22.1

# Set the working directory inside the container.
# This is the directory where your Go application will reside.
WORKDIR /app

# Copy the local package files to the container's workspace.
COPY . .

# Build your Go app. Adjust the path according to your main package if needed.
# This creates a binary with the name "server" (or choose your own name).
RUN go build -o server .

# This container exposes port 3000 to the outside world.
EXPOSE 3000

# Run the binary program produced by `go install`
CMD ["./server", "--port=3000", "--dir=/media"]

