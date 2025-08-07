FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# 构建应用
RUN npm run build

# 全局安装 serve
RUN npm install -g serve

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["serve", "-s", "build", "-l", "3000"]