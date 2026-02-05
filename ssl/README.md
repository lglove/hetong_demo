# SSL 证书配置说明

本项目支持 HTTPS，需要配置 SSL 证书。有两种方式：

## 方式一：使用 Let's Encrypt 免费证书（生产环境推荐）

### 前置条件
- 域名已解析到服务器 IP
- 服务器可以访问外网

### 步骤

1. **安装 certbot**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# CentOS/RHEL
sudo yum install certbot
```

2. **获取证书**
```bash
# 替换 your-domain.com 为你的域名
sudo certbot certonly --standalone -d your-domain.com

# 或者使用通配符证书（需要 DNS 验证）
sudo certbot certonly --manual --preferred-challenges dns -d your-domain.com -d *.your-domain.com
```

3. **复制证书到项目目录**
```bash
# 创建 ssl 目录
mkdir -p ssl

# 复制证书文件
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# 设置权限
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
```

4. **自动续期（可选）**
创建续期脚本 `renew-cert.sh`：
```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
docker-compose restart frontend
```

添加到 crontab（每月执行一次）：
```bash
crontab -e
# 添加：0 3 1 * * /path/to/renew-cert.sh
```

## 方式二：使用自签名证书（开发/测试环境）

### 生成自签名证书

```bash
# 创建 ssl 目录
mkdir -p ssl

# 生成私钥
openssl genrsa -out ssl/key.pem 2048

# 生成证书签名请求
openssl req -new -key ssl/key.pem -out ssl/cert.csr

# 生成自签名证书（有效期 365 天）
openssl x509 -req -days 365 -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem

# 清理临时文件
rm ssl/cert.csr

# 设置权限
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

**注意**：自签名证书浏览器会显示警告，需要手动信任。仅用于开发/测试环境。

## 证书文件说明

- `cert.pem`: SSL 证书文件（公钥）
- `key.pem`: SSL 私钥文件（必须保密）

## 验证配置

启动服务后，访问：
- HTTP: http://your-domain.com（会自动重定向到 HTTPS）
- HTTPS: https://your-domain.com

如果使用自签名证书，浏览器会显示安全警告，需要点击"高级" -> "继续访问"。
