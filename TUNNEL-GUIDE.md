# 动漫角色猜谜游戏 - 内网穿透指南

本指南将帮助你设置内网穿透，将游戏部署到公网上，以便与朋友一起玩多人模式。

## 准备工作

1. 确保你已经安装了内网穿透工具，如 frp、ngrok 等
2. 确保你拥有一个可用的公网 IP 或域名
3. 确保你的本地防火墙允许相关端口的访问

## 端口映射配置

您需要映射两个端口：

1. 前端服务端口：**5173** (localhost:5173)
2. 后端服务端口：**3000** (localhost:3000)

## 使用方法

本项目提供了两种内网穿透启动脚本：

1. **start-tunnel.bat** - HTTPS 模式（推荐，但需要证书）
2. **start-tunnel-http.bat** - HTTP 模式（兼容性更好但安全性较低）

### 步骤 1: 配置内网穿透参数

在使用前，请先编辑脚本文件（`start-tunnel.bat` 或 `start-tunnel-http.bat`），修改以下参数：

```batch
:: 设置内网穿透参数
set "PUBLIC_SERVER_IP=你的公网IP或域名"
set "PUBLIC_SERVER_PORT=映射到后端的公网端口"
set "PUBLIC_CLIENT_PORT=映射到前端的公网端口"
```

### 步骤 2: 配置内网穿透工具

以 frp 为例，配置 frpc.ini 文件：

```ini
[common]
server_addr = 你的frp服务器地址
server_port = 7000
token = 你的frp令牌

[web-front]
type = tcp
local_ip = 127.0.0.1
local_port = 5173
remote_port = 你的前端公网端口 (PUBLIC_CLIENT_PORT)

[web-back]
type = tcp
local_ip = 127.0.0.1
local_port = 3000
remote_port = 你的后端公网端口 (PUBLIC_SERVER_PORT)
```

### 步骤 3: 启动内网穿透

1. 先启动内网穿透工具
2. 再运行 `start-tunnel.bat` 或 `start-tunnel-http.bat`

### 步骤 4: 访问游戏

现在，你和你的朋友可以通过以下地址访问游戏：

- HTTPS 模式：`https://你的公网IP或域名:前端公网端口`
- HTTP 模式：`http://你的公网IP或域名:前端公网端口`

## 故障排除

### 1. 网页显示无法连接

- 检查内网穿透工具是否正常运行
- 检查端口映射是否正确
- 检查防火墙设置

### 2. CORS 错误

如果遇到 CORS 错误，尝试使用 HTTP 模式的脚本 `start-tunnel-http.bat`

### 3. 501 Not Implemented 错误

出现此错误表示内网穿透服务在尝试将 HTTP 请求重定向至 HTTPS。请使用 `start-tunnel.bat` (HTTPS 模式)，或者在内网穿透工具中禁用 HTTPS 强制跳转。

### 4. WebSocket 连接失败

尝试在浏览器中访问 `http(s)://你的公网IP或域名:后端公网端口/socket.io/`，检查是否返回类似 `{"code":0,"message":"Transport unknown"}` 的响应。如果无法访问，检查内网穿透的 WebSocket 配置。

## 注意事项

- 公网部署可能面临安全风险，仅推荐临时使用
- 使用完毕后请及时关闭内网穿透服务
- 内网穿透质量取决于你的网络环境和穿透服务质量 