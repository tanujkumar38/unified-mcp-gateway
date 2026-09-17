# Multi-Stage Dockerfile for Unified MCP Gateway Hub
# Optimized for Render Cloud, Railway, Fly.io, and Local Docker

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifests and local package dependencies
COPY package*.json ./
COPY tickertape-mcp ./tickertape-mcp

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy source code and configurations
COPY tsconfig.json ./
COPY src/ ./src/
COPY mcp-gateway.config.json ./

# Compile TypeScript
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

# Create non-root user for security
RUN addgroup -S mcp && adduser -S mcp -G mcp

WORKDIR /home/mcp/app

# Install production dependencies only
COPY package*.json ./
COPY tickertape-mcp ./tickertape-mcp
RUN npm ci --only=production && npm cache clean --force

# Copy compiled artifacts and runtime config from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/mcp-gateway.config.json ./

# Set permissions
RUN chown -R mcp:mcp /home/mcp/app

# Switch to non-root user
USER mcp

# Set runtime environment
ENV NODE_ENV=production
ENV MCP_TRANSPORT=http
ENV PORT=10000
ENV HOST=0.0.0.0
ENV MCP_LOG_LEVEL=info

EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-10000}/health || exit 1

# Start Unified MCP Gateway
CMD ["node", "dist/gateway/index.js"]
