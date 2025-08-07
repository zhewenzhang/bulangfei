FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用 serve 来服务静态文件
RUN npm install -g serve

# 暴露端口
EXPOSE 3000

# 启动应用（支持动态端口）
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]