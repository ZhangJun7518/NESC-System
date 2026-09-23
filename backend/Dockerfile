
# 构建镜像的文件

# 使用轻量的 Node.js 20 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 先复制依赖清单，安装依赖（利用Docker缓存，加快后续构建）
COPY package*.json ./
RUN npm install --production

# 再复制所有后端代码
COPY . .

# 暴露后端端口
EXPOSE 3001

# 启动后端服务
CMD ["node", "app.js"]