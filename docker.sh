#!/bin/bash

# A2A Agent Inspector - Docker Build & Run Script

set -e

IMAGE_NAME="a2a-agent-inspector"
IMAGE_TAG="latest"
CONTAINER_NAME="a2a-inspector"
PORT="${PORT:-3000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build the Docker image
build() {
    print_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
    docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
    print_info "Build completed successfully!"
}

# Run the container
run() {
    print_info "Starting container: ${CONTAINER_NAME}"
    
    # Stop existing container if running
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        print_warn "Stopping existing container..."
        docker stop "${CONTAINER_NAME}"
    fi
    
    # Remove existing container if exists
    if docker ps -aq -f name="${CONTAINER_NAME}" | grep -q .; then
        print_warn "Removing existing container..."
        docker rm "${CONTAINER_NAME}"
    fi
    
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:3000" \
        --restart unless-stopped \
        "${IMAGE_NAME}:${IMAGE_TAG}"
    
    print_info "Container started successfully!"
    print_info "Access the application at: http://localhost:${PORT}"
}

# Stop the container
stop() {
    print_info "Stopping container: ${CONTAINER_NAME}"
    docker stop "${CONTAINER_NAME}" 2>/dev/null || print_warn "Container not running"
}

# View logs
logs() {
    docker logs -f "${CONTAINER_NAME}"
}

# Show help
help() {
    echo "A2A Agent Inspector - Docker Management Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  build    Build the Docker image"
    echo "  run      Run the container (builds if image doesn't exist)"
    echo "  stop     Stop the running container"
    echo "  logs     View container logs"
    echo "  help     Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  PORT     Port to expose (default: 3000)"
    echo ""
    echo "Examples:"
    echo "  $0 build          # Build the image"
    echo "  $0 run            # Run on default port 3000"
    echo "  PORT=8080 $0 run  # Run on port 8080"
}

# Main
case "${1:-help}" in
    build)
        build
        ;;
    run)
        if ! docker images -q "${IMAGE_NAME}:${IMAGE_TAG}" | grep -q .; then
            build
        fi
        run
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
