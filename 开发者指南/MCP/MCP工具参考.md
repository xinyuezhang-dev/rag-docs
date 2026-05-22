---
sidebar_position: 2
slug: /mcp_tools
sidebar_custom_props: {
  categoryIcon: LucideToolCase
}
---
# RAGFlow MCP 工具

MCP 服务器目前提供一个专用工具，帮助用户基于 RAGFlow DeepDoc 技术搜索相关信息：

- **retrieve**：根据给定的问题，使用 RAGFlow 检索接口从指定的 `dataset_ids` 和可选的 `document_ids` 获取相关分块。所有可用数据集的详细信息（即 `id` 和 `description`）在每个单独数据集的工具描述中提供。

更多信息请参见我们的 [MCP 服务器](https://github.com/infiniflow/ragflow/blob/main/mcp/server/server.py) Python 实现。
