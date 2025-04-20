@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title 动漫角色猜谜游戏 - 局域网模式 (简易版)
color 0A
cls

echo =================================================
echo             动漫角色猜谜游戏 - 局域网模式
echo =================================================
echo.

:: 关闭现有服务
echo 正在关闭现有服务...
taskkill /f /im node.exe >nul 2>&1

:: 提取并显示所有IPv4地址
echo 您的本机IP地址信息:
echo.
echo [选择序号] IP地址
echo -------------------

set "index=0"
set "iplist="

:: 创建临时文件存储IP信息
ipconfig | findstr /i "IPv4" > "%TEMP%\iplist.txt"

:: 读取IP列表并为每个IP分配序号
for /f "tokens=*" %%a in (%TEMP%\iplist.txt) do (
  set /a index+=1
  set "line=%%a"
  set "ip=!line:*: =!"
  echo [!index!] !ip!
  set "iplist=!iplist!!ip!,"
)

:: 删除临时文件
del "%TEMP%\iplist.txt" >nul 2>&1

echo.
echo 请输入IP地址前面的序号来选择要使用的IP地址
echo 例如: 输入"2"选择列表中第2个IP地址
echo 通常选择以192.168开头的地址用于局域网连接
echo.

:: 用户输入IP序号
set /p USER_SELECTION="请输入序号> "

:: 检查是否输入有效
if "!USER_SELECTION!"=="" (
  set USER_IP=localhost
  echo 未输入序号，将使用默认值: localhost
) else (
  :: 检查输入是否为数字且在范围内
  set "valid=true"
  set "num=!USER_SELECTION!"
  for /f "delims=0123456789" %%i in ("!num!") do set "valid=false"
  
  if not "!valid!"=="true" (
    echo 无效输入，将使用默认值: localhost
    set USER_IP=localhost
  ) else if !num! LSS 1 (
    echo 序号太小，将使用默认值: localhost
    set USER_IP=localhost
  ) else if !num! GTR !index! (
    echo 序号超出范围，将使用默认值: localhost
    set USER_IP=localhost
  ) else (
    :: 根据序号获取对应的IP
    set "count=0"
    for /f "tokens=*" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
      set /a count+=1
      if !count!==!num! (
        set "line=%%a"
        set "USER_IP=!line:*: =!"
      )
    )
  )
)

echo.
echo 将使用IP地址: !USER_IP!
echo.

:: 创建临时环境变量文件
echo 创建环境变量文件...
echo # 数据服务器URL> client_v3\.env.lan
echo VITE_DB_SERVER_URL=http://!USER_IP!:3001>> client_v3\.env.lan
echo.>> client_v3\.env.lan
echo # 游戏服务器URL>> client_v3\.env.lan
echo VITE_SERVER_URL=http://!USER_IP!:3000>> client_v3\.env.lan
echo.>> client_v3\.env.lan
echo # AES加密密钥>> client_v3\.env.lan
echo VITE_AES_SECRET=my-secret-key>> client_v3\.env.lan

:: 创建服务器环境变量文件
echo 创建服务器环境变量文件...
echo # 服务器端口> server_v3\.env.lan
echo PORT=3000>> server_v3\.env.lan
echo.>> server_v3\.env.lan
echo # 客户端URL（用于CORS）>> server_v3\.env.lan
echo CLIENT_URL=http://!USER_IP!:5173>> server_v3\.env.lan
echo SERVER_URL=http://!USER_IP!:3000>> server_v3\.env.lan

:: 创建临时vite配置文件
echo 创建Vite配置文件...
echo import { defineConfig } from 'vite'> client_v3\vite.config.lan.js
echo import react from '@vitejs/plugin-react'>> client_v3\vite.config.lan.js
echo.>> client_v3\vite.config.lan.js
echo // https://vite.dev/config/>> client_v3\vite.config.lan.js
echo export default defineConfig({>> client_v3\vite.config.lan.js
echo   plugins: [react()],>> client_v3\vite.config.lan.js
echo   server: {>> client_v3\vite.config.lan.js
echo     host: '0.0.0.0',>> client_v3\vite.config.lan.js
echo     port: 5173>> client_v3\vite.config.lan.js
echo   }>> client_v3\vite.config.lan.js
echo })>> client_v3\vite.config.lan.js

echo 配置文件创建完成。

echo 启动数据服务器...
start "数据服务器" cmd /c "cd data_server && node server.js"

echo 等待数据服务器启动...
timeout /t 3 /nobreak > nul

echo 启动游戏服务器...
start "游戏服务器" cmd /c "cd server_v3 && set NODE_ENV=lan && node -r dotenv/config server.js dotenv_config_path=.env.lan"

echo 等待游戏服务器启动...
timeout /t 3 /nobreak > nul

echo 启动客户端(局域网模式)...
start "客户端" cmd /c "cd client_v3 && set VITE_USER_NODE_ENV=development && npm run dev -- --config vite.config.lan.js --mode lan"

echo 所有服务已启动!
echo.
echo 局域网访问信息：
echo - 本机访问: http://localhost:5173
echo - 局域网设备访问: http://!USER_IP!:5173
echo.
echo 如果您的局域网设备无法访问游戏：
echo 1. 确保设备连接到同一网络
echo 2. 检查防火墙设置并确保允许应用程序通过防火墙
echo 3. 尝试使用另一个IP地址重新启动
echo.
goto :normal_exit

:error_exit
echo.
echo 脚本执行出错。请查看上方错误信息，解决问题后再次尝试。
echo.

:normal_exit
echo 按任意键退出...
pause > nul 

