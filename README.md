# 用明白 - 智能物品残值管理工具

一个基于React和Supabase的智能物品残值计算和管理应用。

## 功能特性

- 🧮 **智能残值计算** - 基于物品类别、购买价格、使用时间等因素计算残值
- 📊 **数据分析** - 提供详细的残值趋势分析和统计图表
- 📱 **响应式设计** - 支持桌面端和移动端访问
- 🔐 **用户认证** - 基于Supabase的安全用户认证系统
- 📈 **历史记录** - 完整的物品管理和残值计算历史
- 🎨 **现代UI** - 使用Material-UI构建的美观界面

## 技术栈

- **前端**: React 18, Material-UI, React Router
- **后端**: Supabase (PostgreSQL + Auth + API)
- **部署**: Zeabur
- **开发工具**: Create React App, ESLint, Prettier

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd bulangfei
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件，填入你的Supabase配置：
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **启动开发服务器**
   ```bash
   npm start
   ```

   应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── Account.js      # 账户管理
│   ├── Admin.js        # 管理员面板
│   ├── Analytics.js    # 数据分析
│   ├── Auth.js         # 用户认证
│   ├── Calculator.js   # 残值计算器
│   ├── CategoryManager.js # 类别管理
│   └── History.js      # 历史记录
├── contexts/           # React Context
│   ├── AuthContext.js  # 认证上下文
│   └── LanguageContext.js # 语言上下文
├── services/           # 业务逻辑服务
│   ├── aiClassificationService.js
│   ├── categoryDurationService.js
│   └── categoryOptimizationService.js
├── supabaseClient.js   # Supabase客户端配置
├── theme.js           # Material-UI主题
├── App.js             # 主应用组件
└── index.js           # 应用入口
```

## 部署

### Zeabur部署

1. 推送代码到GitHub
2. 在Zeabur中连接你的GitHub仓库
3. 配置环境变量
4. 部署应用

### Docker部署

```bash
# 构建镜像
docker build -t bulangfei .

# 运行容器
docker run -p 3000:3000 bulangfei
```

## 开发指南

### 代码规范

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循React Hooks最佳实践

### 提交规范

使用约定式提交格式：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues: [GitHub Issues](repository-url/issues)
- 邮箱: your-email@example.com

---

**用明白** - 让物品价值管理更智能 🚀