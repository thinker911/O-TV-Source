# O-TV-Source

O-TV 的独立私人影视源订阅服务。与 O-TV 主仓库完全分离。

## 目标

- 私有 GitHub 仓库保存完整订阅配置。
- Cloudflare Worker 提供单一订阅 URL。
- URL 路径携带随机访问密钥，O-TV 拉取时无需额外输入密码。
- Worker 使用仅有 Contents: Read 权限的 GitHub Fine-grained token 读取本仓库配置。
- 将完整 JSON 配置编码为 Base58，并以纯文本返回，符合 O-TV README 描述的订阅格式。

## 当前状态

代码骨架已建立；订阅配置目前为空模板，尚未导入真实资源站数据，也尚未部署 Worker。**当前没有可用订阅链接。**

## Worker 环境变量

在 Cloudflare Worker Secrets 中设置：

- `SUBSCRIPTION_TOKEN`：至少 32 字符的随机高强度 URL 密钥。
- `GITHUB_TOKEN`：仅允许读取本仓库 Contents 的 Fine-grained token。

普通变量在 `wrangler.toml` 中设置：`GITHUB_OWNER`、`GITHUB_REPO`、`GITHUB_BRANCH`、`CONFIG_PATH`。

请勿把任何 Token 或真实订阅 URL 提交到 Git 仓库、Issue 或公开日志。

## 订阅接口

- `GET /health`：健康检查，不返回订阅内容。
- `GET /s/{SUBSCRIPTION_TOKEN}`：返回 Base58 编码后的完整配置。
- 错误密钥返回 404；订阅响应禁用缓存。

部署完成后，O-TV 中只需填写一个 URL：`https://<worker-domain>/s/<token>`。

## 本地开发

需要 Node.js 与 Wrangler：

```bash
npm install --save-dev wrangler
npx wrangler dev
```

本地秘密放在未跟踪的 `.dev.vars` 文件中。

## 安全与限制

订阅 URL 本身就是凭证。任何获得完整 URL 的人都可以拉取订阅；不要公开分享。若 URL 泄露，应轮换 `SUBSCRIPTION_TOKEN`。

GitHub 私有仓库不会令 Worker 的订阅响应自动私有；访问控制由 Worker 校验 URL 密钥实现。
