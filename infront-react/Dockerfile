# ========== 第一步：构建阶段 ==========
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 👈 核心：接收构建参数并注入 Vite 环境变量
ARG VITE_APP_TITLE
ENV VITE_APP_TITLE=${VITE_APP_TITLE}

RUN npm run build

# ========== 第二步：生产运行阶段 ==========
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]