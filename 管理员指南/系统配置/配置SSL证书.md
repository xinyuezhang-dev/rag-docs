---
sidebar_position: 1
slug: /config_ssl_cert
sidebar_custom_props: {
  categoryIcon: LucideCog
}
---
# 配置 SSL 证书

为通过 Docker 部署的 RAGFlow 实例配置 SSL 证书。

---

本指南详细介绍如何为通过 Docker 部署的 RAGFlow 实例配置 SSL 证书，以容器名称 `docker-ragflow-cpu-1` 为例。

## 1. 准备证书文件

确保您已准备好 Nginx 格式的证书文件：

- **公钥**：通常命名为 `fullchain.pem` 或 `server.crt`。
- **私钥**：通常命名为 `privkey.pem` 或 `server.key`。

如有必要，请重命名文件以符合标准：

```bash
# 将证书包重命名为 fullchain.pem
cp XXXXX_bundle.pem fullchain.pem
# 将私钥重命名为 privkey.pem
cp XXXXX.key privkey.pem
```

## 2. 确认容器状态

验证容器是否正在运行：

```bash
docker ps
```

## 3. 将证书复制到容器

将文件从宿主机传输到容器的临时目录：

```bash
docker cp ./fullchain.pem docker-ragflow-cpu-1:/tmp/fullchain.pem
docker cp ./privkey.pem docker-ragflow-cpu-1:/tmp/privkey.pem
```

## 4. 在容器内部署证书

进入容器的交互式终端：

```bash
docker exec -it docker-ragflow-cpu-1 /bin/bash
```

进入后，移动文件并设置适当的权限：

```bash
mkdir -p /etc/nginx/ssl
mv /tmp/fullchain.pem /etc/nginx/ssl/
mv /tmp/privkey.pem /etc/nginx/ssl/

# 设置权限：公钥为 644，私钥为 600
chmod 644 /etc/nginx/ssl/fullchain.pem
chmod 600 /etc/nginx/ssl/privkey.pem
```

## 5. 将 Nginx 切换到 HTTPS 配置

将默认的 HTTP 配置替换为 HTTPS 模板：

1. 进入配置目录：`cd /etc/nginx/conf.d/`。
2. 备份原始配置：`mv ragflow.conf ragflow.conf.bak`。
3. 启用 HTTPS 模板：`cp /etc/nginx/ragflow.https.conf ./ragflow.conf`。

## 6. 编辑 HTTPS 模板

1. 打开配置文件：`vi ragflow.conf`。
2. 确保 `ssl_certificate` 和 `ssl_certificate_key` 路径指向 `/etc/nginx/ssl/` 中的文件。
3. 验证 Nginx 语法：`nginx -t`。

## 7. 应用配置

重新加载 Nginx 以应用更改：

```bash
nginx -s reload
```

如果更改未生效，退出容器并重启：

```bash
exit
docker restart docker-ragflow-cpu-1
```

## 配置持久化

:::tip 重要
通过 `docker cp` 和 `docker exec` 所做的更改在容器被移除或通过 `docker-compose down` 停止后将会丢失。
**建议**：测试成功后，将证书存储在宿主机上，并在 `docker-compose.yaml` 中使用 `volumes` 挂载证书和 `ragflow.conf`，以实现持久化。
:::
