@echo off
echo ====================
echo 动漫角色猜谜游戏 - 内网穿透模式 (HTTP)
echo ====================

:: 设置内网穿透参数
set "PUBLIC_SERVER_IP=60.215.128.117"
set "PUBLIC_SERVER_PORT=56172"
set "PUBLIC_CLIENT_PORT=59887"

:: 停止已有的服务
call stop-app.bat

:: 创建临时环境变量文件
echo # 数据服务器URL> client_v3/.env.tunnel-http
echo VITE_DB_SERVER_URL=http://%PUBLIC_SERVER_IP%:%PUBLIC_SERVER_PORT%>> client_v3/.env.tunnel-http
echo.>> client_v3/.env.tunnel-http
echo # 游戏服务器URL>> client_v3/.env.tunnel-http
echo VITE_SERVER_URL=http://%PUBLIC_SERVER_IP%:%PUBLIC_SERVER_PORT%>> client_v3/.env.tunnel-http
echo.>> client_v3/.env.tunnel-http
echo # AES加密密钥>> client_v3/.env.tunnel-http
echo VITE_AES_SECRET=my-secret-key>> client_v3/.env.tunnel-http

:: 创建临时vite配置文件
echo import { defineConfig } from 'vite'> client_v3/vite.config.tunnel-http.js
echo import react from '@vitejs/plugin-react'>> client_v3/vite.config.tunnel-http.js
echo.>> client_v3/vite.config.tunnel-http.js
echo // https://vite.dev/config/>> client_v3/vite.config.tunnel-http.js
echo export default defineConfig({>> client_v3/vite.config.tunnel-http.js
echo   plugins: [react()],>> client_v3/vite.config.tunnel-http.js
echo   server: {>> client_v3/vite.config.tunnel-http.js
echo     host: '0.0.0.0',>> client_v3/vite.config.tunnel-http.js
echo     port: 5173,>> client_v3/vite.config.tunnel-http.js
echo     strictPort: true,>> client_v3/vite.config.tunnel-http.js
echo     hmr: {>> client_v3/vite.config.tunnel-http.js
echo       clientPort: %PUBLIC_CLIENT_PORT% // 内网穿透的端口>> client_v3/vite.config.tunnel-http.js
echo     }>> client_v3/vite.config.tunnel-http.js
echo   }>> client_v3/vite.config.tunnel-http.js
echo })>> client_v3/vite.config.tunnel-http.js

:: 创建Socket.IO客户端配置临时文件
mkdir client_v3\src\config 2>nul
echo // Socket.IO配置> client_v3\src\config\socketConfig.js
echo export const socketOptions = {>> client_v3\src\config\socketConfig.js
echo   withCredentials: true,>> client_v3\src\config\socketConfig.js
echo   transports: ['polling', 'websocket'],>> client_v3\src\config\socketConfig.js
echo   path: '/socket.io'>> client_v3\src\config\socketConfig.js
echo };>> client_v3\src\config\socketConfig.js

echo 启动数据服务器...
start "数据服务器" cmd /c "cd data_server && node server.js"

echo 等待数据服务器启动...
timeout /t 3 /nobreak > nul

echo 启动游戏服务器...
start "游戏服务器" cmd /c "cd server_v3 && node server.js"

echo 等待游戏服务器启动...
timeout /t 3 /nobreak > nul

echo 启动客户端(内网穿透HTTP模式)...
start "客户端" cmd /c "cd client_v3 && set VITE_USER_NODE_ENV=development && npm run dev -- --config vite.config.tunnel-http.js --mode tunnel-http"

echo 所有服务已启动!
echo.
echo 内网穿透信息：
echo 前端内网穿透地址: http://%PUBLIC_SERVER_IP%:%PUBLIC_CLIENT_PORT%
echo 后端内网穿透地址: http://%PUBLIC_SERVER_IP%:%PUBLIC_SERVER_PORT%
echo.
echo 请确保已经正确设置了内网穿透工具，将本地端口映射到公网地址
echo - 前端: 127.0.0.1:5173 → %PUBLIC_SERVER_IP%:%PUBLIC_CLIENT_PORT%
echo - 后端: 127.0.0.1:3000 → %PUBLIC_SERVER_IP%:%PUBLIC_SERVER_PORT%
echo.
echo 按任意键退出...
pause > nul 