---
sidebar_position: 4
slug: /build_docker_image
sidebar_custom_props: {
  categoryIcon: LucidePackage
}
---
# 构建 RAGFlow Docker 镜像
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本指南说明如何从源代码构建 RAGFlow Docker 镜像。按照本指南，您将能够创建用于开发、调试或测试目的的本地 Docker 镜像。

## 目标受众

- 添加了新功能或修改了现有代码，需要 Docker 镜像来查看和调试其变更的开发人员。
- 需要为 ARM64 平台构建 RAGFlow Docker 镜像的开发人员。
- 希望体验 RAGFlow 最新功能并生成 Docker 镜像的测试人员。

## 前置条件

- CPU &ge; 4 核
- 内存 &ge; 16 GB
- 磁盘 &ge; 50 GB
- Docker &ge; 24.0.0 & Docker Compose &ge; v2.26.1

## 构建 Docker 镜像

该镜像大小约为 2 GB，依赖外部 LLM 和嵌入服务。

:::danger 重要
- 我们也在 ARM64 平台上测试 RAGFlow，但我们不维护 ARM 架构的 RAGFlow Docker 镜像。不过，您也可以在 `linux/arm64` 或 `darwin/arm64` 主机上自行构建镜像。
- 对于 ARM64 平台，请将 **pyproject.toml** 中的 `xgboost` 版本升级到 `1.6.0`，并确保 **unixODBC** 已正确安装。
:::

```bash
git clone https://github.com/infiniflow/ragflow.git
cd ragflow/
uv run python3 download_deps.py
docker build -f Dockerfile.deps -t infiniflow/ragflow_deps .
docker build -f Dockerfile -t infiniflow/ragflow:nightly .
```

## 从 Docker 启动 MacOS 版 RAGFlow 服务

构建完 infiniflow/ragflow:nightly 镜像后，您即可启动包含所有必需组件（如 Elasticsearch、MySQL、MinIO、Redis 等）的全功能 RAGFlow 服务。

## 示例：Apple M2 Pro (Sequoia)

1. 编辑 Docker Compose 配置

打开 `docker/.env` 文件。找到 `RAGFLOW_IMAGE` 设置，将镜像引用从 `infiniflow/ragflow:v0.25.4` 改为 `infiniflow/ragflow:nightly` 以使用预构建镜像。


2. 启动服务

```bash
cd docker
$ docker compose -f docker-compose-macos.yml up -d
```

3. 访问 RAGFlow 服务

设置完成后，打开 Web 浏览器，导航到 http://127.0.0.1 或您服务器的 \<IP_ADDRESS\>（默认端口为 \<PORT\> = 80）。您将被引导到 RAGFlow 欢迎页面。尽情使用！🍻
