@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
echo 启动动漫角色猜谜游戏局域网服务...

REM 设置颜色
color 0E

echo 正在检查并关闭已占用的端口...
REM 关闭占用3000端口的进程(游戏服务器)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 关闭占用3000端口的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM 关闭占用3001端口的进程(数据服务器)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo 关闭占用3001端口的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM 关闭占用5173端口的进程(客户端)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo 关闭占用5173端口的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo 端口清理完成!

REM 获取本机IP地址
echo 正在获取本机IP地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 地址" /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    goto :found_ip
)
:found_ip

REM 显示本机IP地址
echo ===========================================================
echo 您的本地IP地址是: %IP%
echo 其他玩家应该使用以下URL连接到游戏:
echo http://%IP%:5173
echo ===========================================================

REM 在客户端环境变量中设置服务器地址
echo 正在更新客户端环境变量...
(
    echo # 数据服务器URL
    echo VITE_DB_SERVER_URL=http://%IP%:3001
    echo.
    echo # 游戏服务器URL
    echo VITE_SERVER_URL=http://%IP%:3000
    echo.
    echo # AES加密密钥
    echo VITE_AES_SECRET=my-secret-key
) > client_v3\.env

REM 创建新窗口启动游戏服务器
echo 正在启动游戏服务器...
start "游戏服务器 - 端口3000" cmd /c "cd /d %~dp0server_v3 && npm run dev"

REM 创建新窗口启动数据服务器
echo 正在启动数据服务器...
start "数据服务器 - 端口3001" cmd /c "cd /d %~dp0data_server && npm run dev"

REM 创建新窗口启动客户端
echo 正在启动客户端...
start "客户端 - 端口5173" cmd /c "cd /d %~dp0client_v3 && npm run dev"

echo 所有服务已启动!
echo 局域网服务器地址: http://%IP%:3000
echo 局域网数据服务器地址: http://%IP%:3001
echo 本地客户端地址: http://localhost:5173
echo.
echo 请告知其他玩家使用此URL连接: http://%IP%:5173
echo 请确保Windows防火墙已允许Node.js应用通过
pause 