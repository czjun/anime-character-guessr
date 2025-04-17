@echo off
echo 正在为动漫角色猜谜游戏设置Windows防火墙规则...

REM 需要管理员权限
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

REM 添加入站规则
echo 正在添加入站规则...

REM 添加客户端端口
netsh advfirewall firewall add rule name="AnimeCharacterGuessr-Client" dir=in action=allow protocol=TCP localport=5173 profile=private,domain,public enable=yes

REM 添加游戏服务器端口
netsh advfirewall firewall add rule name="AnimeCharacterGuessr-GameServer" dir=in action=allow protocol=TCP localport=3000 profile=private,domain,public enable=yes

REM 添加数据服务器端口
netsh advfirewall firewall add rule name="AnimeCharacterGuessr-DataServer" dir=in action=allow protocol=TCP localport=3001 profile=private,domain,public enable=yes

echo 防火墙规则设置完成！
echo 已开放端口: 5173 (客户端), 3000 (游戏服务器), 3001 (数据服务器)
echo 您现在可以运行 start-lan.bat 启动局域网游戏服务了。

pause 