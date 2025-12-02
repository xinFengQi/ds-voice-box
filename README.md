# Home Voice Box (Cloudflare Pages Version)

这是一个基于 **Cloudflare Pages** 的全栈 Serverless 项目。

## 架构特点

- **前端**: 纯 HTML + Tailwind CSS (CDN) + Alpine.js (CDN)。**无构建步骤**。
- **后端**: Cloudflare Pages Functions。
- **部署**: 推送到 Git 即可自动部署。

## 目录结构

- `index.html`: 前端入口。
- `functions/`: 后端 API 逻辑。
  - `index.js`: 处理根路径 POST 请求 (天猫精灵指令)。
  - `api/hello.js`: 测试接口。
  - `aligenie/[filename].js`: 动态处理天猫精灵域名校验文件。

## 本地开发

1. 安装 Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. 运行开发服务器:
   ```bash
   # 在 new-project 目录下运行
   cd new-project
   npx wrangler pages dev .
   ```

3. 访问 `http://localhost:8788`

## 部署设置

在 Cloudflare Pages 后台设置以下环境变量：

- `ALIGENIE_NAME`: `********.txt`
- `ALIGENIE_CONTENT`: `****************************************************************`

