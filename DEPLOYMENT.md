# 部署说明

## 常见问题及解决方案

### 问题 1: react-scripts 权限错误
**错误信息**: `react-scripts: Permission denied`
**解决方案**: 项目已包含修复的 `Dockerfile`，使用 `serve` 替代 nginx 来避免权限问题。

### 问题 2: Tailwind CSS CDN 警告
**错误信息**: `cdn.tailwindcss.com should not be used in production`
**解决方案**: 
1. 如果项目使用了 Tailwind，安装本地版本：
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. 在 `src/index.css` 中添加：
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### 问题 3: 502 服务器错误
**可能原因**: 
- 端口配置不正确
- 服务器启动失败
- 静态文件路径错误

**解决方案**: 
1. 确保 Dockerfile 中的端口与部署平台匹配
2. 使用简化的单阶段构建
3. 检查构建日志确认没有错误

## 部署配置

### 推荐 Dockerfile（当前版本）
- 使用 Node.js 18-alpine
- 单阶段构建，避免复杂性
- 使用 `serve` 包服务静态文件
- 监听端口 3000

### 备用方案
如果当前 Dockerfile 有问题，可以使用 `Dockerfile.simple`：
```bash
cp Dockerfile.simple Dockerfile
```

### 环境变量
确保在部署平台中设置：
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

### 部署平台特定设置

#### Zeabur
- 构建命令: `npm run build`
- 启动命令: `serve -s build -l $PORT`
- 端口: 自动检测

#### Vercel
- 框架预设: Create React App
- 构建命令: `npm run build`
- 输出目录: `build`

#### Railway
- 构建命令: `npm run build`
- 启动命令: `serve -s build -l $PORT`

## 文件说明
- `Dockerfile`: 生产环境构建（使用 serve）
- `Dockerfile.simple`: 备用简化版本
- `nginx.conf`: Nginx 配置（如需要）
- `.dockerignore`: 优化构建过程