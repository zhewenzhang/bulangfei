# 使用官方 Node.js 运行时作为父镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖并设置权限
RUN npm ci && \
    chmod -R 755 node_modules/.bin/

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 使用 nginx 来服务静态文件
FROM nginx:alpine

# 复制构建的文件到 nginx
COPY --from=0 /app/build /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]