---
sidebar_position: 4
slug: /add_confluence
sidebar_custom_props: {
  categoryIcon: SiGoogledrive
}
---

# 添加 Confluence

将 Confluence 集成为数据源。

---

本指南介绍如何将 Confluence 集成为 RAGFlow 的数据源。

## 前提条件

在配置连接器之前，请从 Atlassian 账户获取以下凭证：

- **Confluence 用户邮箱**：执行索引操作的账户的电子邮件地址。
- **Atlassian API Token**：通过 [Atlassian 账户设置](https://id.atlassian.com/manage-profile/security/api-tokens)生成。
- **Confluence base URL**：实例 URL（例如 `https://<your-org>.atlassian.net/wiki`）。

## 配置步骤

### 将 Confluence 定义为外部数据源

导航到 RAGFlow 管理面板中的 **Connectors** 或 **External Data Source** 部分，选择 **Confluence**。在弹出的窗口中输入以下内容：

- **Is Cloud** - 表示是否为 Confluence Cloud 实例的开关。
  - `Yes`（默认）：Confluence Cloud。
  - `False`：Confluence Server/Data Center。
- **Name**：*必填* Confluence 连接器的唯一标识符（例如 `Engineering-Wiki`）。
- **Confluence Username**：*必填*
  - 对于 Confluence Cloud：登录 Confluence 时使用的完整电子邮件地址。
  - 对于 Confluence Server/Data Center：您的登录 ID，通常是简写名称。
- **Confluence Access Token**：*必填* 允许 RAGFlow 代表您读取和索引 Wiki 页面的认证密钥。
  - 对于 Confluence Cloud：Atlassian API Token，通过全局 Atlassian 账户生成的安全字符串。可从 id.atlassian.com/manage-profile/security/api-tokens 创建。
  - 对于 Confluence Server/Data Center：您的个人访问令牌（PAT）。需要登录公司的 Confluence，点击右上角的个人头像，选择 Settings，然后在左侧边栏中找到 Personal Access Tokens。
- **Wiki Base URL**：Confluence 实例的基础 URL，例如 https://your-domain.atlassian.net/wiki。
- **Index Mode**
  - `Everything`：（默认）索引提供的凭证有权访问的所有页面。
  - `Space`：RAGFlow 仅索引您在配置中明确列出的 Space Key。
    - **Space Keys**：指定键（如 `ENG, HR`），以逗号分隔来限制索引范围。留空则索引所有可访问的空间。

配置完成后，点击 **Confirm** 保存更改。

*RAGFlow 会立即验证连接。*

### 关联到数据集

仅凭凭证不会触发索引。您必须将数据源关联到特定数据集：

1. 导航到 **Dataset** 选项卡。
2. 选择或创建目标数据集。
3. 导航到数据集的 **Configuration** 页面，选择 **Link data source**。
4. 在弹出的窗口中选择之前创建的 Confluence 连接器。
