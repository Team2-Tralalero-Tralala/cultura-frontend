# ---- Stage 1: Build (Debian/glibc) ----
  FROM node:20-bookworm-slim AS builder
  WORKDIR /app

  # 1) Copy ONLY package.json first
  COPY package.json ./

  # 2) Create a fresh Linux-native lockfile and install exactly
  RUN npm install --package-lock-only
  RUN npm ci

  # 3) Bring in the rest of the source and build
  COPY . .
  # Vite reads VITE_* at build time (not runtime), so pass it here if needed
  ARG VITE_API_URL
  ENV VITE_API_URL=${VITE_API_URL}
  RUN npm run build

  # ---- Stage 2: Serve ----
  FROM nginx:stable-alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf

  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
