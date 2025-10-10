@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo 🚀 20-20-20 护眼助手 - 部署工具
echo ================================
echo.

:menu
echo 请选择部署方式：
echo.
echo 1. GitHub Pages
echo 2. Vercel
echo 3. Netlify
echo 4. 生成压缩包（手动上传）
echo 5. 退出
echo.
set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto github
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto netlify
if "%choice%"=="4" goto zip
if "%choice%"=="5" goto end
echo 无效选项，请重新选择
goto menu

:github
echo.
echo 📦 部署到 GitHub Pages...
echo.

if not exist .git (
    echo 初始化 Git 仓库...
    git init
    echo node_modules/ > .gitignore
    echo .DS_Store >> .gitignore
)

git add .
git commit -m "Deploy: %date% %time%" 2>nul || echo 没有新的更改

echo.
echo ⚠️ 请确保已创建 GitHub 仓库并配置了远程地址
echo 如果还没有配置，请运行：
echo   git remote add origin https://github.com/你的用户名/eye-care-20-20-20.git
echo.
set /p confirm="是否继续推送? (y/n): "

if /i "%confirm%"=="y" (
    git push -u origin main 2>nul || git push -u origin master
    echo.
    echo ✓ 部署完成！
    echo 请在 GitHub 仓库设置中启用 GitHub Pages
    echo 访问: https://github.com/你的用户名/eye-care-20-20-20/settings/pages
)
goto done

:vercel
echo.
echo 📦 部署到 Vercel...
echo.

where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ 未安装 Vercel CLI
    echo 请先安装: npm install -g vercel
    pause
    goto menu
)

echo 开始部署...
vercel --prod

echo.
echo ✓ 部署完成！
goto done

:netlify
echo.
echo 📦 部署到 Netlify...
echo.

where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ 未安装 Netlify CLI
    echo 请先安装: npm install -g netlify-cli
    pause
    goto menu
)

echo 开始部署...
netlify deploy --prod

echo.
echo ✓ 部署完成！
goto done

:zip
echo.
echo 📦 生成部署压缩包...
echo.

set timestamp=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set zipname=eye-care-20-20-20_%timestamp%.zip

if exist temp_deploy rmdir /s /q temp_deploy
mkdir temp_deploy

echo 复制文件...
xcopy /E /I /Q index.html temp_deploy\ >nul
xcopy /E /I /Q css temp_deploy\css\ >nul
xcopy /E /I /Q js temp_deploy\js\ >nul
if exist README.md copy README.md temp_deploy\ >nul

echo 创建压缩包...
powershell -command "Compress-Archive -Path temp_deploy\* -DestinationPath %zipname% -Force"

rmdir /s /q temp_deploy

echo.
echo ✓ 压缩包已生成: %zipname%
echo.
echo 部署方法：
echo 1. 解压缩文件
echo 2. 上传到你的 Web 服务器
echo 3. 确保 index.html 在根目录
goto done

:done
echo.
echo 🎉 完成！
echo.
echo 访问 DEPLOYMENT.md 查看详细部署文档
echo.
pause
goto menu

:end
echo.
echo 再见！
echo.
exit /b 0