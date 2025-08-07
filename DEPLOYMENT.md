# 部署说明

## 问题描述
部署时遇到 `react-scripts: Permission denied` 错误，这是因为 Docker 容器中的 `react-scripts` 没有执行权限。

## 解决方案

### 方案 1：使用自定义 Dockerfile（推荐）
项目已包含 `Dockerfile`，它会：
1. 正确设置 `node_modules/.bin/` 目录的权限
2. 使用多阶段构建优化镜像大小
3. 使用 nginx 服务静态文件

### 方案 2：使用简化 Dockerfile
如果主 Dockerfile 有问题，可以使用 `Dockerfile.simple`：
```bash
# 重命名文件
mv Dockerfile.simple Dockerfile
```

### 方案 3：修改部署平台设置
在部署平台（如 Zeabur、Vercel 等）中：
1. 确保使用 Node.js 18 或更高版本
2. 在构建命令前添加权限设置：
   ```bash
   chmod -R 755 node_modules/.bin/ && npm run build
   ```

## 环境变量
确保在部署平台中设置以下环境变量：
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 文件说明
- `Dockerfile`: 生产环境多阶段构建
- `Dockerfile.simple`: 简化版本，用于开发/测试
- `nginx.conf`: Nginx 配置，支持 React Router
- `.dockerignore`: 优化构建过程