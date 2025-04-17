@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
color 0D

echo =================================================
echo        动漫角色猜谜游戏 - 樱花内网穿透版
echo =================================================
echo.


:: 输入樱花穿透信息
echo 请输入樱花内网穿透的信息:
echo.
set /p SAKURA_DOMAIN=输入樱花提供的域名(不含http://): 
set /p SAKURA_CLIENT_PORT=输入前端穿透端口(默认为59887): 
set /p SAKURA_SERVER_PORT=输入后端穿透端口(默认为56172): 

:: 设置默认值
if "!SAKURA_CLIENT_PORT!"=="" set SAKURA_CLIENT_PORT=59887
if "!SAKURA_SERVER_PORT!"=="" set SAKURA_SERVER_PORT=56172

:: 确认信息
echo.
echo 您设置的樱花穿透信息:
echo - 域名: !SAKURA_DOMAIN!
echo - 前端穿透端口: !SAKURA_CLIENT_PORT!
echo - 后端穿透端口: !SAKURA_SERVER_PORT!
echo.
set /p CONFIRM=确认信息正确吗? (Y/N): 

if /i not "!CONFIRM!"=="Y" (
  echo 已取消操作。
  goto :normal_exit
)

echo.
echo 开始配置HTTPS模式...
echo.

:: 创建临时环境变量文件
echo 创建环境变量文件...
(
echo # 数据服务器URL
echo VITE_DB_SERVER_URL=https://!SAKURA_DOMAIN!:!SAKURA_SERVER_PORT!
echo.
echo # 游戏服务器URL
echo VITE_SERVER_URL=https://!SAKURA_DOMAIN!:!SAKURA_SERVER_PORT!
echo.
echo # AES加密密钥
echo VITE_AES_SECRET=my-secret-key
) > client_v3\.env.sakura
if errorlevel 1 (
  echo 创建环境变量文件失败！请检查client_v3目录是否存在。
  goto :error_exit
)

:: 创建临时vite配置文件
echo 创建Vite配置文件...
(
echo import { defineConfig } from 'vite';
echo import react from '@vitejs/plugin-react';
echo.
echo // https://vite.dev/config/
echo export default defineConfig({
echo   plugins: [react()],
echo   server: {
echo     host: '0.0.0.0',
echo     port: 5173,
echo     strictPort: true,
echo     https: true,
echo     hmr: {
echo       clientPort: !SAKURA_CLIENT_PORT!, // 樱花穿透的前端端口
echo       host: '!SAKURA_DOMAIN!'
echo     }
echo   }
echo });
) > client_v3\vite.config.sakura.js
if errorlevel 1 (
  echo 创建Vite配置文件失败！
  goto :error_exit
)

:: 创建Socket.IO客户端配置临时文件
echo 创建Socket.IO配置...
mkdir client_v3\src\config 2>nul
(
echo // Socket.IO配置
echo export const socketOptions = {
echo   withCredentials: true,
echo   transports: ['polling', 'websocket'],
echo   path: '/socket.io',
echo   secure: true
echo };
) > client_v3\src\config\socketConfig.js
if errorlevel 1 (
  echo 创建Socket.IO配置文件失败！
  goto :error_exit
)

echo 配置文件创建完成。

:: 创建启用HTTPS的服务器配置
echo 创建HTTPS服务器配置...
mkdir server_v3\ssl 2>nul
(
echo // 临时SSL自签名证书生成
echo // 这些证书仅用于本地开发，不应该在生产环境中使用
echo // 在实际部署时，请使用樱花内网穿透提供的SSL证书
) > server_v3\ssl\README.txt

:: 创建临时SSL环境变量文件
echo 创建服务器环境变量文件...
(
echo PORT=3000
echo CLIENT_URL=https://!SAKURA_DOMAIN!:!SAKURA_CLIENT_PORT!
echo SERVER_URL=https://!SAKURA_DOMAIN!:!SAKURA_SERVER_PORT!
echo ENABLE_HTTPS=true
) > server_v3\.env.sakura
if errorlevel 1 (
  echo 创建服务器环境变量文件失败！
  goto :error_exit
)

:: 检查generate-cert.js文件是否存在
if not exist server_v3\generate-cert.js (
  echo generate-cert.js 文件不存在，创建临时文件...
  (
  echo /**
  echo  * 生成开发环境下的自签名SSL证书
  echo  * 注意：此脚本仅用于开发测试，不要在生产环境中使用此生成的证书
  echo  * 在实际部署时，应使用樱花内网穿透提供的正式SSL证书
  echo  */
  echo.
  echo const fs = require^('fs'^);
  echo const path = require^('path'^);
  echo.
  echo // 确保ssl目录存在
  echo const sslDir = path.join^(__dirname, 'ssl'^);
  echo if ^(!fs.existsSync^(sslDir^)^) {
  echo   fs.mkdirSync^(sslDir, { recursive: true }^);
  echo }
  echo.
  echo // 检查是否已存在证书
  echo const keyPath = path.join^(sslDir, 'private.key'^);
  echo const certPath = path.join^(sslDir, 'certificate.crt'^);
  echo.
  echo if ^(fs.existsSync^(keyPath^) ^&^& fs.existsSync^(certPath^)^) {
  echo   console.log^('证书文件已存在，如需重新生成，请先删除ssl目录下的证书文件'^);
  echo   process.exit^(0^);
  echo }
  echo.
  echo console.log^('生成简单测试证书...'^);
  echo.
  echo try {
  echo   // 简单的自签名证书（仅用于测试，不安全）
  echo   const key = `-----BEGIN PRIVATE KEY-----
  echo MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZ4hX1qBIQjtDQ
  echo V/MvXAN5Im0BCZZxApPvK3aJV0GwJs+6K0UDcBBrhof8Y1CUvKBXpGwaE4CDpe2+
  echo nNYdljY7zPfBeD7T3NdIyY3NZDfY5rSnCt9flSuTDUdYJfQO0CdLsH3zBYB3y+/S
  echo xi51Mq9f8ZJ6lsScTxgbJJZokJXu7KQosOGx5xQQyRyW2a5vfflr0nnlKRXbNVW6
  echo 87jGl1pZyPDCXXxPvYxq/WHLSK6dIAeB5wPQmN9WUOLuYZCvPRDzLElQSSPYwFOq
  echo 9I7eMSIwl7h+e3ZMbvGdovDsP87lmECmXEPmb7ILMbKIB1MkxJszBXSKcNnU3SE0
  echo c2FO+4afAgMBAAECggEAA2Qe4VRSQzrwoYMGa35UL+GsSIcH68B1wPp8ydYJ0k7H
  echo rVVxoLSgXTHm3VJvVIiE7iryXJIGqP5oXrU7fPr0YCQtKUomX8xFhzQj+RlQ0KWr
  echo DPoOdQoJYA1axvySGxjPaHzxuVKFIOyLLYA+YZjGw1iCxcJAzw/nik8ZuCxP19sW
  echo OGxJn33zuXxQL7eVtYmMz6XN2ywrLea1y0L9YcJsaMJLYjLCnqHz9Y6Qk6igmK2w
  echo FyM+OIqCZiUQmZLTQnQmNAMRr/b6jrFBZ+ACGZhCFcKKmB+x/9k1Q4JMB3Nkhki3
  echo UVD5LoW1NmBWQKGjtY8iYGZQNEytbkHTMUHKBr/lAQKBgQD0FpFr/Iy7yMwPpbud
  echo 8fb8pvCV/Qf+sKhJccHcUQ6uD8zHlG07GwU4zpPDY0pu1Lma7q05Kx5JUDnK7F/m
  echo YveGeQDKEFoTeZD9in+LJ5n3Jkk54KkD9n7h6+OILQKCafRysCWKJHw6L3Ftg78X
  echo zD4vlB/0CtZPp9LgJl0kYFgOgQKBgQDkPMNth4aMsyz6XyJfOJmyVtFGcYm2Fmg3
  echo bRnqclkzBUvqdEd55VGbPG5SSc0MUr2qv0DBcaoaODqAuaLwvXKfOPZ3/9s6H9yz
  echo aD4BBJDhuTVXfOV3SjY6mI2IKPMzAUFRCgMPQDZlX2E5gzH7KMRCjtxh7wY54nF7
  echo sYBPmxjBHwKBgQDsG7z4YGIgGpJkRyhZwXOWw7HqKQQIYwzNBBQOQvGa9YJQhUUF
  echo GTnVnvUiQpUB3JXStsr0CunPzJ+ZL2QG4t+13VjdVFTWjN7t9okLW9aaXIgyjowC
  echo zYeZqSsZVO1K2TIQOiEBKAW+fGLvVpcMWBfhiF2AX1yP+J1mUmIEhAdNgQKBgQCq
  echo /K9hGKMRHR63C16lGS+VOXYp6L2MZpbuQwjzm5fGCVlTJ2Y+btfYJqJrG8+HYvQY
  echo zT695o/Lx1sd0BrSP7lwEzAOWSkVbNGzXKQvpD1ZzMDcI3cYPZrIxlFKF2+i7TQw
  echo Jd1LB5HzbXlvfn43BXYd6w0xI7zGKoNKQfn43Ts3YQKBgEfX3h7fYvXMOrz5MQdK
  echo vHjvmL1gy3Yd3/K5hbJVBzHau0FpV9RtjXwQfG0MLwJQZQLnx8Mc0nDqY9xzhkje
  echo kXO7GnHVz33XDbgjkLDHww+AkUC/A2eCVkgG9PuisM5vCv8YZWVeWUVk7BZwQdW1
  echo ptWNbWR8QAo27SVVYNd7MBZQ
  echo -----END PRIVATE KEY-----`;
  echo.
  echo   const cert = `-----BEGIN CERTIFICATE-----
  echo MIIDtDCCApygAwIBAgIUCvK2cj+amfI1ZYUeSbM2Vri7KoEwDQYJKoZIhvcNAQEL
  echo BQAwajELMAkGA1UEBhMCQ04xETAPBgNVBAgMCFNoYW5naGFpMREwDwYDVQQHDAhT
  echo aGFuZ2hhaTERMA8GA1UECgwIQW5pbWVBcHAxETAPBgNVBAsMCEFuaW1lQXBwMQ8w
  echo DQYDVQQDDAZBbmltZUgwHhcNMjQwNDAxMTYyNTUyWhcNMjUwNDAxMTYyNTUyWjBq
  echo MQswCQYDVQQGEwJDTjERMA8GA1UECAwIU2hhbmdoYWkxETAPBgNVBAcMCFNoYW5n
  echo aGFpMREwDwYDVQQKDAhBbmltZUFwcDERMA8GA1UECwwIQW5pbWVBcHAxDzANBgNV
  echo BAMMBkFuaW1lSDB3MA0GCSqGSIb3DQEBAQUAA4BnMDQGCSqGSIb3DQEBAQUAA4GP
  echo ADCCA9sCggODAoIBgQDZ4hX1qBIQjtDQV/MvXAN5Im0BCZZxApPvK3aJV0GwJs+6
  echo K0UDcBBrhof8Y1CUvKBXpGwaE4CDpe2+nNYdljY7zPfBeD7T3NdIyY3NZDfY5rSn
  echo Ct9flSuTDUdYJfQO0CdLsH3zBYB3y+/Sxi51Mq9f8ZJ6lsScTxgbJJZokJXu7KQo
  echo sOGx5xQQyRyW2a5vfflr0nnlKRXbNVW687jGl1pZyPDCXXxPvYxq/WHLSK6dIAeB
  echo 5wPQmN9WUOLuYZCvPRDzLElQSSPYwFOq9I7eMSIwl7h+e3ZMbvGdovDsP87lmECm
  echo XEPmb7ILMbKIB1MkxJszBXSKcNnU3SE0c2FO+4afAgMBAAGjUzBRMB0GA1UdDgQW
  echo BBQ5a3voGKiYyT3bCcfcEj4pQ96C9jAfBgNVHSMEGDAWgBQ5a3voGKiYyT3bCcfc
  echo Ej4pQ96C9jAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBESlST
  echo xRtvpIk9NZZ0LVRgDHKEPUEROvHjbgXVYsw6XDASzqZZ9a9EFq6xTVgbjiU8Jqaz
  echo 1oRJQasddORDFmiWfFRBNNDoRTKVnw35Gqr1EULnRkh8692Nzl9rjQTKxYOArN1G
  echo Y9CrT4DFrKPFQlHwdT2GIwTiwjlDSmHcBenT9R4T32y3KqMG1NHc8wb5x6iVZBxR
  echo aD8giN7siK/8YPm8Xtq6QfTQ5+B2Df99I+mI7WgbMzpHeu36XrMYQR97XFYWy3Q2
  echo HuMPdP26V8Bc2h2awHjv0QZTijbcLZPpfNppE6vgcjKk6XwICIMYiEqD1HV8fFIH
  echo vQJ1XNXZcMw0O+CG
  echo -----END CERTIFICATE-----`;
  echo.
  echo   fs.writeFileSync^(keyPath, key^);
  echo   fs.writeFileSync^(certPath, cert^);
  echo   console.log^('测试证书生成成功！'^);
  echo } catch ^(error^) {
  echo   console.error^('生成SSL证书失败：', error^);
  echo   process.exit^(1^);
  echo }
  echo.
  echo console.log^(`
  echo 证书文件已创建:
  echo - 私钥: ${keyPath}
  echo - 证书: ${certPath}
  echo.
  echo 注意：这些是自签名证书，仅用于开发测试。
  echo 在生产环境中，请使用樱花提供的SSL证书。
  echo `^);
  ) > server_v3\generate-cert.js
  if errorlevel 1 (
    echo 创建generate-cert.js文件失败！
    goto :error_exit
  )
)

:: 生成SSL证书
echo 生成SSL证书...
cd server_v3
node generate-cert.js
if errorlevel 1 (
  echo 生成SSL证书失败！
  cd ..
  goto :error_exit
)
cd ..

echo.
echo 证书生成完成，准备启动服务...
echo.

echo 启动数据服务器...
start "数据服务器" cmd /c "cd data_server && node server.js"
if errorlevel 1 (
  echo 启动数据服务器失败！
  goto :error_exit
)

echo 等待数据服务器启动...
timeout /t 3 /nobreak > nul

echo 启动游戏服务器(HTTPS模式)...
start "游戏服务器" cmd /c "cd server_v3 && set NODE_ENV=sakura && node server.js"
if errorlevel 1 (
  echo 启动游戏服务器失败！
  goto :error_exit
)

echo 等待游戏服务器启动...
timeout /t 3 /nobreak > nul

echo 启动客户端(樱花穿透HTTPS模式)...
start "客户端" cmd /c "cd client_v3 && set VITE_USER_NODE_ENV=development && npm run dev -- --config vite.config.sakura.js --mode sakura"
if errorlevel 1 (
  echo 启动客户端失败！
  goto :error_exit
)

echo.
echo =================================================
echo 所有服务已启动!
echo.
echo 樱花穿透访问信息：
echo - 前端访问地址: https://!SAKURA_DOMAIN!:!SAKURA_CLIENT_PORT!
echo - 后端服务地址: https://!SAKURA_DOMAIN!:!SAKURA_SERVER_PORT!
echo =================================================
echo.
echo 请确保樱花已正确设置以下穿透:
echo 1. 本地5173端口 → !SAKURA_DOMAIN!:!SAKURA_CLIENT_PORT! (HTTPS)
echo 2. 本地3000端口 → !SAKURA_DOMAIN!:!SAKURA_SERVER_PORT! (HTTPS)
echo.
echo 注意: 需要在樱花面板中为域名启用HTTPS并且隧道类型选择HTTPS
echo.
goto :normal_exit

:error_exit
echo.
echo 脚本执行出错。请查看上方错误信息，解决问题后再次尝试。
echo.

:normal_exit
echo 按任意键退出...
pause > nul 