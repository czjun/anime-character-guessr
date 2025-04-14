@echo off
echo 设置并启动动漫角色猜谜游戏...

REM 设置颜色
color 0B

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

REM 安装所有依赖
echo 正在安装所有依赖，这可能需要几分钟时间...
call npm run install-all

REM 检查.env文件是否存在
if not exist "client_v3\.env" (
    echo 创建客户端环境变量文件...
    (
        echo # 数据服务器URL
        echo VITE_DB_SERVER_URL=http://localhost:3001
        echo.
        echo # 游戏服务器URL(可选)
        echo VITE_SERVER_URL=http://localhost:3000
        echo.
        echo # AES加密密钥
        echo VITE_AES_SECRET=my-secret-key
    ) > client_v3\.env
)

if not exist "server_v3\.env" (
    echo 创建游戏服务器环境变量文件...
    (
        echo # 服务器端口
        echo PORT=3000
    ) > server_v3\.env
)

if not exist "data_server\.env" (
    echo 创建数据服务器环境变量文件...
    (
        echo # MongoDB连接URI
        echo MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true^&w=majority
        echo # 可选：端口设置
        echo PORT=3001
    ) > data_server\.env
    
    echo 警告: 请务必更新data_server\.env文件中的MongoDB连接字符串!
)

REM 启动所有服务
echo 正在启动所有服务...
call npm run dev

pause 