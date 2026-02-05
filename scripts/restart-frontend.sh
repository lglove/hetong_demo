#!/bin/bash

# 快速重启前端服务脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔄 重启前端服务..."

# 停止前端服务
echo "1. 停止前端服务..."
docker-compose stop frontend
docker-compose rm -f frontend

# 重新构建前端镜像
echo "2. 重新构建前端镜像..."
docker-compose build --no-cache frontend

# 启动前端服务
echo "3. 启动前端服务..."
docker-compose up -d frontend

# 等待启动
echo "4. 等待服务启动..."
sleep 5

# 显示日志
echo ""
echo "📝 前端服务日志："
docker-compose logs --tail=30 frontend

echo ""
echo "✅ 前端服务重启完成！"
