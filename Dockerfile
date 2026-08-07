FROM node:20-alpine AS frontend-builder

RUN npm install -g pnpm

WORKDIR /app

COPY frontend/package.json ./
COPY frontend/package-lock.json ./
COPY frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./

RUN pnpm run build
 
 
FROM node:20-alpine

RUN apk add --no-cache ffmpeg

RUN npm install -g pnpm
 
WORKDIR /app

COPY backend/package.json ./
COPY backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ ./

COPY --from=frontend-builder /app/dist /app/public

RUN pnpm run build

CMD ["pnpm","run","start"]