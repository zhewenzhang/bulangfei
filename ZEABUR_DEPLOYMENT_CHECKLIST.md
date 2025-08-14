# 🚀 Zeabur 部署检查清单

## 📋 部署前检查

### ✅ 1. 环境变量配置
- [ ] 在Zeabur控制台设置了 `REACT_APP_SUPABASE_URL`
- [ ] 在Zeabur控制台设置了 `REACT_APP_SUPABASE_ANON_KEY`
- [ ] 环境变量值正确无误（无多余空格或换行）

### ✅ 2. 代码配置
- [ ] Dockerfile包含ARG和ENV指令
- [ ] supabaseClient.js正确处理环境变量
- [ ] 本地测试通过（`npm start`正常运行）

### ✅ 3. Git仓库
- [ ] 所有更改已提交到Git
- [ ] 代码已推送到远程仓库
- [ ] Zeabur连接到正确的Git仓库和分支

## 🔧 部署步骤

### 步骤1：设置环境变量
1. 登录 [Zeabur控制台](https://zeabur.com)
2. 选择项目 → Settings → Environment Variables
3. 添加环境变量：
   ```
   REACT_APP_SUPABASE_URL=https://uwvlduprxppwdkjkvwby.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dmxkdXByeHBwd2Rramt2d2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDYxMTMsImV4cCI6MjA2NTUyMjExM30.IT_7wL-0Buf1iyGKI1cw2PY0GtlKFljFiNOVYBvA_o0
   ```
4. 点击 **Save** 保存

### 步骤2：触发部署
1. 推送代码到Git仓库，或
2. 在Zeabur控制台手动触发重新部署

### 步骤3：监控构建过程
1. 在Zeabur控制台查看构建日志
2. 确认环境变量在构建时正确传递
3. 等待构建完成

## 🔍 部署后验证

### ✅ 检查项目
- [ ] 网站可以正常访问
- [ ] 页面不是空白
- [ ] 浏览器控制台无错误
- [ ] Supabase连接正常
- [ ] 应用功能正常

### 🐛 常见错误排查

#### 错误1：页面空白 + "Supabase URL or Anon Key is missing"
**原因**：环境变量未正确传递到构建过程
**解决**：
1. 检查Zeabur环境变量设置
2. 确认变量名拼写正确
3. 重新部署

#### 错误2："Cannot read properties of null (reading 'get')"
**原因**：Supabase客户端初始化失败
**解决**：
1. 检查Supabase URL和Key是否有效
2. 确认网络连接正常
3. 检查Supabase项目状态

#### 错误3：构建失败
**原因**：依赖安装或构建过程出错
**解决**：
1. 检查package.json依赖
2. 查看构建日志详细错误
3. 确认Node.js版本兼容性

## 📞 获取帮助

如果遇到问题：
1. 查看Zeabur构建日志
2. 检查浏览器控制台错误
3. 运行本地环境变量检查：`node check-env.js`
4. 参考 `DEPLOYMENT.md` 详细说明

---

**💡 提示**：每次修改环境变量后都需要重新部署才能生效！