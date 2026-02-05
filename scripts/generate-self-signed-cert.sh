#!/bin/bash

# 生成自签名 SSL 证书脚本（用于开发/测试环境）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SSL_DIR="$PROJECT_ROOT/ssl"

echo "生成自签名 SSL 证书..."

# 创建 ssl 目录
mkdir -p "$SSL_DIR"

# 生成私钥
echo "1. 生成私钥..."
openssl genrsa -out "$SSL_DIR/key.pem" 2048

# 生成证书签名请求
echo "2. 生成证书签名请求..."
openssl req -new -key "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.csr" \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"

# 生成自签名证书（有效期 365 天）
echo "3. 生成自签名证书..."
openssl x509 -req -days 365 -in "$SSL_DIR/cert.csr" \
    -signkey "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.pem"

# 清理临时文件
rm -f "$SSL_DIR/cert.csr"

# 设置权限
chmod 644 "$SSL_DIR/cert.pem"
chmod 600 "$SSL_DIR/key.pem"

echo "✅ SSL 证书生成完成！"
echo "   证书文件: $SSL_DIR/cert.pem"
echo "   私钥文件: $SSL_DIR/key.pem"
echo ""
echo "⚠️  注意：这是自签名证书，浏览器会显示安全警告，仅用于开发/测试环境。"
echo "   生产环境请使用 Let's Encrypt 证书（见 ssl/README.md）。"
