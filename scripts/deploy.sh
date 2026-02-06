#!/bin/bash

# 部署脚本 - 重新构建并启动服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 开始部署合同管理系统..."
echo ""

# 检查 SSL 证书文件
echo "📋 检查 SSL 证书..."
if [ ! -f "/root/ssl/full_chain.pem" ] || [ ! -f "/root/ssl/private.key" ]; then
    echo "❌ 错误：SSL 证书文件不存在！"
    echo "   请确保以下文件存在："
    echo "   - /root/ssl/full_chain.pem"
    echo "   - /root/ssl/private.key"
    exit 1
fi
echo "✅ SSL 证书文件检查通过"
echo ""

# 停止现有服务
echo "🛑 停止现有服务..."
docker compose down
echo ""

# 重新构建镜像（不使用缓存）
echo "🔨 重新构建镜像..."
docker compose build --no-cache
echo ""

# 启动所有服务
echo "🚀 启动服务..."
docker compose up -d
echo ""

# 等待服务启动
echo "⏳ 等待服务启动（10秒）..."
sleep 10
echo ""

# 检查服务状态
echo "📊 检查服务状态..."
docker compose ps
echo ""

# 显示日志（最后20行）
echo "📝 服务日志（最后20行）："
docker compose logs --tail=20
echo ""

echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址："
echo "   - HTTPS: https://lige.website"
echo "   - HTTPS: https://www.lige.website"
echo ""
echo "💡 提示：如果遇到问题，可以查看日志："
echo "   docker compose logs -f frontend"
