---
sidebar_position: 16
slug: /add_confluence
sidebar_custom_props: {
  categoryIcon: SiGoogledrive
}
---

# 添加 Bitbucket

将 Bitbucket 集成为数据源。

---

本指南介绍如何将 Bitbucket 集成为 RAGFlow 的数据源。

## 前提条件

开始之前，请确保具备以下条件：

- **Bitbucket API token：** 具有适当作用域或权限的个人访问令牌（PAT）。
- **仓库 URL：** 要索引的仓库的完整 URL。
- **Workspace ID：** Bitbucket 工作区的唯一标识符。

## 配置步骤

### 将 Bitbucket 定义为外部数据源

导航到 RAGFlow 管理面板中的 **Connectors** 或 **External Data Source** 部分，选择 **Bitbucket**。在弹出的窗口中填写连接器详情：

- **Name**：此连接器的描述性名称。
- **Bitbucket Account Email**：Bitbucket 账户的电子邮件地址。
- **Bitbucket API Token**：在上一步中创建且具有适当权限的 API 令牌。
- **Workspace**：Bitbucket URL 中的 `WORKSPACE_NAME`，例如 `https://bitbucket.org/{WORKSPACE_NAME}/...`
- **Index Mode**
  - **Workspace**：（默认）索引工作区中的所有仓库。
  - **Repositories**：索引工作区中指定的仓库。
    - **Repository Slugs**：逗号分隔的仓库 slug 列表，例如 `repo2,repo2`。
  - **Projects**：索引工作区中指定的项目。
    - **Projects**：逗号分隔的项目键列表，例如 `PROJ1,PROJ2`。

*RAGFlow 会立即验证连接并索引指定仓库或项目中的所有 pull request。*

### 关联到数据集

仅凭凭证不会触发索引。您必须将数据源关联到特定数据集：

1. 导航到 **Dataset** 选项卡。
2. 选择或创建目标数据集。
3. 导航到数据集的 **Configuration** 页面，选择 **Link data source**。
4. 在弹出的窗口中选择之前创建的 Bitbucket 连接器。
