# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package specs
COPY package*.json ./
RUN npm ci

# Copy source code and assets
COPY . .

# Build client bundle
RUN npm run build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets, server, and data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/data ./data

# Expose standard port for Coolify / Docker
EXPOSE 3000

# Start the Node.js production server
CMD ["npm", "start"]
