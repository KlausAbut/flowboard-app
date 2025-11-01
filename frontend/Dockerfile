## Production-ready Dockerfile for frontend (multi-stage + nginx)
## Fait par Cl@udiu — build with Node, serve with nginx

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Copier le reste et builder
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner

# Copier la build statique vers nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx (fournie dans frontend/nginx/default.conf)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
