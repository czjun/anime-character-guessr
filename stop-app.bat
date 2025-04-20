@echo off
chcp 65001 >nul
echo 正在停止动漫角色猜谜游戏服务...

REM 设置颜色
color 0C

echo 正在关闭占用端口的进程...

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

echo 所有服务已停止!
pause 