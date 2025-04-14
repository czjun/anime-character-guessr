@echo off
echo 启动动漫角色猜谜游戏服务...

REM 设置颜色
color 0A

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
echo 客户端: http://localhost:5173
echo 游戏服务器: http://localhost:3000
echo 数据服务器: http://localhost:3001
echo 请确保已在data_server/.env文件中配置有效的MongoDB连接字符串

pause 