# ========== 第一步：构建阶段 ==========
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 打包成静态文件（生成 dist 文件夹）
RUN npm run build

# ========== 第二步：生产运行阶段 ==========
FROM nginx:alpine
# 把构建好的 dist 复制到 Nginx 的静态资源目录
COPY --from=build /app/dist /usr/share/nginx/html
# 把自定义的 nginx 配置复制过去，覆盖默认配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]