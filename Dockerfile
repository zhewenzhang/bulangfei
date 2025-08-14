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

# 接收构建时的环境变量
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

# 构建应用
RUN npm run build

# 全局安装 serve
RUN npm install -g serve

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]