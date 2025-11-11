# Figma AI Ticket Generator - Production Docker Image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for security and performance
RUN apk add --no-cache \
    ca-certificates \
    tini \
    && rm -rf /var/cache/apk/*

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S figma && \
    adduser -S figma -u 1001

# Set ownership of the app directory
RUN chown -R figma:figma /app
USER figma

# Expose the application port
EXPOSE 3000

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "app/server.js"]