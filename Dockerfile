# A2A Agent Inspector - All-in-one Docker Image
# Frontend (Next.js static export) + Backend (FastAPI) + Nginx

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

# Copy source code
COPY frontend/ ./

# Set API URL to empty string for relative path (nginx will proxy /api)
ENV NEXT_PUBLIC_API_URL=""

# Build Next.js static export
RUN npm run build

# ============================================
# Stage 2: Production Image
# ============================================
FROM python:3.11-slim AS production

# Install nginx, supervisor, and curl (for healthcheck)
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python dependency management
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy backend source (including README.md required by pyproject.toml)
COPY backend/pyproject.toml backend/uv.lock backend/README.md ./backend/
COPY backend/src ./backend/src
COPY backend/__main__.py ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN uv pip install --system .

WORKDIR /app

# Copy frontend static files from builder
COPY --from=frontend-builder /app/frontend/out ./frontend/out/
COPY --from=frontend-builder /app/frontend/public ./frontend/public/

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/log/supervisor /var/log/nginx /var/run \
    && chown -R www-data:www-data /var/log/nginx \
    && chmod 755 /var/log/nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start supervisor (manages nginx + uvicorn)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
