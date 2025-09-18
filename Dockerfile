# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm ci

# คัดลอกโค้ดทั้งหมด
COPY . .

# build production
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app

# ติดตั้ง serve สำหรับเสิร์ฟ static files
RUN npm install -g serve

# คัดลอกไฟล์ build มาจาก stage แรก
COPY --from=builder /app/dist ./dist

# expose port 3000
EXPOSE 3000

# ใช้ serve เสิร์ฟ dist
CMD ["serve", "-s", "dist", "-l", "3000"]
