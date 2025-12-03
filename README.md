# Home Voice Box

一个基于 Cloudflare Pages 的 Serverless 智能家居语音控制平台，连接天猫精灵和 Home Assistant。

## ✨ 特性

- 🎤 **语音控制**：通过天猫精灵语音指令控制 Home Assistant 设备
- 🗺️ **意图映射管理**：可视化界面管理意图与设备操作的映射关系
- ⚡ **内存缓存**：意图映射数据存储在内存中，查询速度极快
- 🔒 **安全认证**：管理员密码保护，所有接口和页面都需要登录
- 🏠 **设备支持**：支持灯光、风扇和开关设备的开关、切换等操作
- 🎯 **自定义回复**：可以为每个意图配置自定义的语音回复内容
- ☁️ **Serverless**：基于 Cloudflare Pages，无需维护服务器

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/xinFengQi/ds-voice-box.git
cd ds-voice-box
```

### 2. 安装依赖

   ```bash
   npm install -g wrangler
   ```

### 3. 配置环境变量

复制示例配置文件并填入实际值：

```bash
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 文件，填入你的配置
```

### 4. 本地开发

   ```bash
# 基本启动
   npx wrangler pages dev . --ip 0.0.0.0

# 如果需要使用 KV（本地开发）
npx wrangler pages dev . --ip 0.0.0.0 --kv INTENTS_KV=your_kv_namespace_id
   ```

访问 `http://localhost:8788`

### 5. 部署到 Cloudflare Pages

1. 将项目推送到 Git 仓库
2. 在 Cloudflare Dashboard 中创建 Pages 项目并连接到 Git 仓库
3. 在项目设置中配置环境变量（见下方配置说明）

## ⚙️ 配置说明

### 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `ALIGENIE_NAME` | 天猫精灵校验文件名 | 天猫精灵开放平台 → 技能开发 → 域名校验 |
| `ALIGENIE_CONTENT` | 天猫精灵校验文件内容 | 同上 |
| `HA_URL` | Home Assistant 服务器地址 | 如：`http://192.168.1.100:8123` |
| `HA_TOKEN` | Home Assistant 长期访问令牌 | Home Assistant → 设置 → 人员与区域 → 长期访问令牌 |
| `ADMIN_PASSWORD` | 管理员登录密码 | 自定义 |
| `LOGIN_PATH` | 登录页面的访问路径 | 自定义，如 `aaa` |
| `KV_BINDING_NAME` | KV Namespace 绑定名称 | 见下方 KV 配置 |
| `TOMI_SECRET_KEY` | 天猫精灵接口验证密钥（可选，强烈推荐） | 自定义随机字符串 |
| `TOMI_SECRET_KEY` | 天猫精灵接口验证密钥（可选） | 自定义随机字符串，强烈推荐设置 |

### KV 配置步骤

1. **创建 KV Namespace**
   - Dashboard: Workers & Pages → KV → Create a namespace
   - 或 CLI: `wrangler kv:namespace create "INTENTS_KV"`

2. **绑定到项目**
   - Dashboard → 你的项目 → Settings → Variables → KV Namespace Bindings
   - 添加绑定，变量名可以是任意名称（如 `INTENTS_KV`）

3. **设置 KV_BINDING_NAME**
   - 在环境变量中设置 `KV_BINDING_NAME`，值必须与步骤 2 中的绑定名称一致

## 📖 使用指南

1. **登录系统**：访问 `https://your-domain.pages.dev/LOGIN_PATH`，使用配置的 `ADMIN_PASSWORD` 登录
2. **创建意图映射**：在管理页面添加意图标识、选择设备、选择接口、配置回复内容
3. **配置天猫精灵**：在天猫精灵开放平台中配置技能，设置服务地址为 `https://your-domain.pages.dev/api/tomi`。如果配置了 `TOMI_SECRET_KEY`，需要在平台中配置相同的请求头（详见使用指南）
4. **测试语音控制**：对天猫精灵说出配置的语音指令

## 📚 文档

详细文档请访问：[https://ds-voice-box.pages.dev/docs.html](https://ds-voice-box.pages.dev/docs.html)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

GitHub 仓库：[https://github.com/xinFengQi/ds-voice-box](https://github.com/xinFengQi/ds-voice-box)

## 📄 许可证

MIT License
