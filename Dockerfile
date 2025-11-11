# Stage 1: Build the React Vite application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

# Copy env files before build
COPY .env* ./

# Copy rest of the source
COPY . .

RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
