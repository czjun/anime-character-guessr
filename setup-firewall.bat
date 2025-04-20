@echo off
echo ====================
echo 动漫角色猜谜游戏 - 防火墙配置
echo ====================

:: 需要管理员权限
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo 请求管理员权限...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

:: 添加防火墙规则
echo 正在配置防火墙规则...

echo 添加前端服务(5173端口)...
netsh advfirewall firewall add rule name="Anime Character Guessr - Frontend" dir=in action=allow protocol=TCP localport=5173

echo 添加游戏服务器(3000端口)...
netsh advfirewall firewall add rule name="Anime Character Guessr - Game Server" dir=in action=allow protocol=TCP localport=3000

echo 添加数据服务器(3001端口)...
netsh advfirewall firewall add rule name="Anime Character Guessr - Data Server" dir=in action=allow protocol=TCP localport=3001

echo 防火墙配置完成!
echo.
echo 现在您可以运行start-lan.bat开始局域网游戏，其他设备应该能够连接到您的电脑了。
echo.
echo 按任意键退出...
pause > nul 