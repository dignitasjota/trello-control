# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tini && mkdir -p /data

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/kanban.db

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
