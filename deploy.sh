#!/bin/bash

# 20-20-20 护眼助手 - 快速部署脚本
# 使用方法: ./deploy.sh [platform]
# 平台选项: github, vercel, netlify, server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 20-20-20 护眼助手 - 部署工具"
echo "================================"
echo ""

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}请选择部署平台：${NC}"
    echo "1) GitHub Pages"
    echo "2) Vercel"
    echo "3) Netlify"
    echo "4) 生成压缩包（用于手动上传）"
    echo ""
    read -p "请输入选项 (1-4): " choice
    
    case $choice in
        1) PLATFORM="github" ;;
        2) PLATFORM="vercel" ;;
        3) PLATFORM="netlify" ;;
        4) PLATFORM="zip" ;;
        *) echo -e "${RED}无效选项${NC}"; exit 1 ;;
    esac
else
    PLATFORM=$1
fi

echo ""
echo -e "${GREEN}部署平台: $PLATFORM${NC}"
echo ""

# GitHub Pages 部署
deploy_github() {
    echo "📦 部署到 GitHub Pages..."
    
    # 检查是否已初始化 Git
    if [ ! -d .git ]; then
        echo "初始化 Git 仓库..."
        git init
        echo "node_modules/" > .gitignore
        echo ".DS_Store" >> .gitignore
    fi
    
    # 添加文件
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有新的更改"
    
    # 推送到 GitHub
    echo ""
    echo -e "${YELLOW}请确保已创建 GitHub 仓库并配置了远程地址${NC}"
    echo "如果还没有配置，请运行："
    echo "  git remote add origin https://github.com/你的用户名/eye-care-20-20-20.git"
    echo ""
    read -p "是否继续推送? (y/n): " confirm
    
    if [ "$confirm" = "y" ]; then
        git push -u origin main || git push -u origin master
        echo ""
        echo -e "${GREEN}✓ 部署完成！${NC}"
        echo "请在 GitHub 仓库设置中启用 GitHub Pages"
        echo "访问: https://github.com/你的用户名/eye-care-20-20-20/settings/pages"
    fi
}

# Vercel 部署
deploy_vercel() {
    echo "📦 部署到 Vercel..."
    
    # 检查 Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}未安装 Vercel CLI，正在安装...${NC}"
        npm install -g vercel
    fi
    
    echo "开始部署..."
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✓ 部署完成！${NC}"
}

# Netlify 部署
deploy_netlify() {
    echo "📦 部署到 Netlify..."
    
    # 检查 Netlify CLI
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}未安装 Netlify CLI，正在安装...${NC}"
        npm install -g netlify-cli
    fi
    
    echo "开始部署..."
    netlify deploy --prod
    
    echo ""
    echo -e "${GREEN}✓ 部署完成！${NC}"
}

# 生成压缩包
create_zip() {
    echo "📦 生成部署压缩包..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ZIPNAME="eye-care-20-20-20_${TIMESTAMP}.zip"
    
    # 创建临时目录
    TEMP_DIR="temp_deploy"
    mkdir -p $TEMP_DIR
    
    # 复制必要文件
    cp -r index.html css js $TEMP_DIR/
    [ -f README.md ] && cp README.md $TEMP_DIR/
    
    # 创建压缩包
    cd $TEMP_DIR
    zip -r ../$ZIPNAME *
    cd ..
    
    # 清理临时目录
    rm -rf $TEMP_DIR
    
    echo ""
    echo -e "${GREEN}✓ 压缩包已生成: $ZIPNAME${NC}"
    echo ""
    echo "部署方法："
    echo "1. 解压缩文件"
    echo "2. 上传到你的 Web 服务器"
    echo "3. 确保 index.html 在根目录"
}

# 执行部署
case $PLATFORM in
    github)
        deploy_github
        ;;
    vercel)
        deploy_vercel
        ;;
    netlify)
        deploy_netlify
        ;;
    zip)
        create_zip
        ;;
    *)
        echo -e "${RED}错误: 不支持的平台 '$PLATFORM'${NC}"
        echo "支持的平台: github, vercel, netlify, zip"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 完成！${NC}"
echo ""
echo "访问 DEPLOYMENT.md 查看详细部署文档"