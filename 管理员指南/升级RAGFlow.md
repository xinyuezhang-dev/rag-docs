---
sidebar_position: 1
slug: /upgrade_ragflow
sidebar_custom_props: {
  categoryIcon: LucideArrowBigUpDash
}
---
# 升级
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

将 RAGFlow 升级到 `nightly` 或最新的正式发布版本。

:::info 注意
升级 RAGFlow 本身*不会*删除您上传的/历史数据。但请注意，`docker compose -f docker/docker-compose.yml down -v` 会删除 Docker 容器卷，导致数据丢失。
:::

## 将 RAGFlow 升级到 `nightly`（最新的测试版 Docker 镜像）

`nightly` 指不包含嵌入模型的 RAGFlow Docker 镜像。

要升级 RAGFlow，您必须同时升级**代码**和 **Docker 镜像**：

1. 停止服务器

   ```bash
   docker compose -f docker/docker-compose.yml down
   ```

2. 更新本地代码

   ```bash
   git pull
   ```

3. 更新 **ragflow/docker/.env**：

   ```bash
   RAGFLOW_IMAGE=infiniflow/ragflow:nightly
   ```

4. 更新 RAGFlow 镜像并重启 RAGFlow：

   ```bash
   docker compose -f docker/docker-compose.yml pull
   docker compose -f docker/docker-compose.yml up -d
   ```

## 将 RAGFlow 升级到指定版本

要升级 RAGFlow，您必须同时升级**代码**和 **Docker 镜像**：

1. 停止服务器

   ```bash
   docker compose -f docker/docker-compose.yml down
   ```

2. 更新本地代码

   ```bash
   git pull
   ```

3. 切换到最新的正式发布版本，例如 `v0.25.4`：

   ```bash
   git checkout -f v0.25.4
   ```

4. 更新 **ragflow/docker/.env**：

   ```bash
   RAGFLOW_IMAGE=infiniflow/ragflow:v0.25.4
   ```

5. 更新 RAGFlow 镜像并重启 RAGFlow：

   ```bash
   docker compose -f docker/docker-compose.yml pull
   docker compose -f docker/docker-compose.yml up -d
   ```

## 常见问题

### 升级 RAGFlow 前需要备份数据集吗？

不需要。升级 RAGFlow 本身*不会*删除您上传的数据或数据集设置。但请注意，`docker compose -f docker/docker-compose.yml down -v` 会删除 Docker 容器卷，导致数据丢失。

### 在离线环境（无互联网访问）中升级 RAGFlow

1. 在有互联网访问的环境中拉取所需的 Docker 镜像。
2. 将 Docker 镜像保存为 **.tar** 文件。
   ```bash
   docker save -o ragflow.v0.25.4.tar infiniflow/ragflow:v0.25.4
   ```
3. 将 **.tar** 文件复制到目标服务器。
4. 将 **.tar** 文件加载到 Docker：
   ```bash
   docker load -i ragflow.v0.25.4.tar
   ```
