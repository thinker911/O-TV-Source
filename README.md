# O-TV-Source

O-TV 独立资源订阅配置仓库。与 O-TV 主项目分离。

## 订阅地址

**Base58 订阅：**

`https://raw.githubusercontent.com/thinker911/O-TV-Source/main/subscription.b58`

将以上地址作为订阅 URL 导入支持 O-TV Base58 配置订阅的版本。

## 当前资源

- 共 78 个启用的视频采集源
- 配置包含 O-TV 兼容字段：`cache_time`、`api_site`、`custom_category`
- 内部管理字段（分组、启用状态、优先级）不会写入最终订阅，避免影响 O-TV 配置解析
- 订阅内容以 Base58 编码的 UTF-8 JSON 提供

## 更新订阅

更新 `config/subscription.json` 后，需重新生成并提交 `subscription.b58`。订阅 URL 保持不变。

## 说明

- 本仓库为公开仓库，任何人均可读取、复制订阅配置及其中的资源站 API 地址。
- 资源站可用性、内容质量及第三方服务条款由各资源站运营方决定；资源地址可能变化或失效。
- 本项目仅整理订阅配置，不托管、不存储、不分发资源站提供的媒体内容。
- O-TV 对该订阅地址的实际导入兼容性仍需在目标 O-TV 版本中验证。
