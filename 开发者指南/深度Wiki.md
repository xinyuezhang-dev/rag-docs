---
sidebar_position: 1
slug: /deepwiki
sidebar_custom_props: {
  categoryIcon: LucideBookOpen
}
---

# 在 DeepWiki 上探索 RAGFlow

一个由 AI 生成、始终保持最新的知识库，用于理解 RAGFlow 的代码库——专为进行二次开发或深入研究 RAGFlow 内部机制的开发人员设计。

---

:::caution 注意
DeepWiki 上的 RAGFlow 内容由 DeepWiki 维护，而非 RAGFlow 团队。它可能会滞后于最新的官方版本。请始终参考官方的 [RAGFlow 文档](https://ragflow.io/docs/dev/) 和[源代码](https://github.com/infiniflow/ragflow) 获取最新信息。
:::

## 什么是 DeepWiki？

[DeepWiki](https://deepwiki.com) 是一个 AI 驱动的工具，可自动读取 GitHub 仓库的源代码、测试和文档，生成结构化的交互式 Wiki。它绘制架构图、模块关系、数据流和设计原理——无需手动编写文档。

## RAGFlow DeepWiki 页面

RAGFlow 项目的索引地址为：

**[https://deepwiki.com/infiniflow/ragflow](https://deepwiki.com/infiniflow/ragflow)**

## 目标受众

此资源主要面向：

- **二次开发人员**：希望扩展或自定义 RAGFlow（例如添加新的文档解析器、集成新的 LLM 供应商或修改检索流程）。
- **贡献者**：需要在提交 PR 之前了解特定模块在整体架构中的位置。
- **研究人员和工程师**：希望研究 RAGFlow 的内部设计原理——分块策略、嵌入流程、基于图的检索和 Agent 编排。

:::tip 注意
对于 RAGFlow 的常规使用（配置知识库、运行聊天等），[指南](../guides/) 部分是更好的起点。
:::

## 在 DeepWiki 上可以找到什么

| 主题 | 关注内容 |
|---|---|
| **整体架构** | 展示 `api/`、`rag/`、`deepdoc/`、`agent/` 和 `web/` 之间关系的高层组件图 |
| **文档导入流程** | 文件如何从上传 → 解析 (`deepdoc/`) → 分块 → 嵌入 → 存储 |
| **检索流程** | 查询如何处理，混合搜索（关键词 + 向量）如何工作，以及如何应用重排序 |
| **Agent 框架** | `agent/` 如何编排多步推理、工具调用和记忆 |
| **LLM / 嵌入抽象** | `rag/llm/` 如何在统一接口背后封装不同的模型供应商 |
| **API 层** | `api/apps/` Blueprint 路由如何映射到内部服务调用 |

## 在本地开发中使用 DeepWiki

当您对代码库进行更改时，DeepWiki 可以帮助您快速回答以下问题：

- *"任务执行的入口点在哪里？"*
- *"哪个类处理 PDF 页面分割？"*
- *"知识图谱检索与稠密向量路径有何不同？"*

您还可以使用 DeepWiki 内置的聊天界面用自然语言提出问题——它将基于实际源代码给出答案。

## 保持 Wiki 更新

DeepWiki 会在上游 `main` 分支更新时自动重新索引仓库。如果您发现索引内容滞后于最近的版本，可以从 DeepWiki 页面手动触发重新索引。

## 相关资源

- [从源码启动服务](./launch_ragflow_from_source.md) — 搭建本地 RAGFlow 开发环境。
- [构建 RAGFlow Docker 镜像](./build_docker_image.md) — 在代码更改后构建自定义镜像。
- [贡献指南](./contributing.md) — 了解代码库后如何提交 PR。
