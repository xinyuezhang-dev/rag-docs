---
sidebar_position: 5
slug: /add_notion
sidebar_custom_props: {
  categoryIcon: SiGoogledrive
}
---

# 添加 Notion

将 Notion 工作区连接到 RAGFlow，您可以将笔记、数据库和文档直接同步到数据集中。配置完成后，RAGFlow 会从指定的 Notion 页面获取数据，为您的 RAG 应用提供上下文。

## 前提条件

开始之前，请确保您具备：
* 具有 **Workspace Owner** 权限的 Notion 账户（创建集成所必需）。
* 要同步的特定页面或数据库。

---

## 创建内部集成

要允许 RAGFlow 访问您的 Notion 数据，必须先在 Notion 开发者门户中创建内部集成以生成密钥令牌。

1. 导航到 [Notion My Integrations](https://www.notion.com/my-integrations) 页面。
2. 点击 **+ New integration**。
3. 在 **Name** 字段中，输入名称（例如 "RAGFlow Connector"）。
4. 选择数据所在的 **Associated workspace**。
5. 在 **Capabilities** 下，确保选中 **Read content**。RAGFlow 不需要写入或用户相关权限。
6. 点击 **Submit**。
7. 在 **Secrets** 选项卡下，点击 **Show** 然后 **Copy** 保存您的 **Internal Integration Token**。

---

## 授予页面访问权限

默认情况下，集成对工作区中的任何页面都没有访问权限。您必须显式共享希望 RAGFlow 索引的页面。

1. 打开要用作数据源根目录的 Notion 页面或数据库。
2. 点击右上角的 **...**（三点）菜单。
3. 向下滚动到 **Connect to**（或 **Add connections**）。
4. 搜索您创建的集成（例如 "RAGFlow Connector"）并选择它。
5. 出现提示后确认连接。

:::tip 注意
如果共享了父页面，其所有嵌套子页面和数据库将自动对集成可访问。
:::

---

## 确定根页面 ID

**Root Page Id** 告诉 RAGFlow 从哪里开始索引。您可以在 Notion 页面的 URL 中找到它。

1. 在网页浏览器中打开目标根页面。
2. 查看地址栏中的 URL。页面 ID 是 URL 末尾的 32 位字母数字字符串。
   * **格式：** `https://www.notion.so/workspace-name/Page-Title-`**`11a047149aef80578303e705001bb90e`**
3. 仅复制 32 位字符串（排除 `?` 后面的任何参数）。

---

## 在 RAGFlow 中配置 Notion 连接器

获得令牌和 ID 后，在 RAGFlow 界面中添加连接器。

| 字段 | 描述 | 是否必填 |
| :--- | :--- | :--- |
| **Name**                     | 此数据源的唯一标签（例如 `Engineering Wiki`）。             | 是 |
| **Notion Integration Token** | 从 Notion 开发者门户复制的"Internal Integration Secret"。 | 是 |
| **Root Page Id**             | 要同步的顶级页面的 32 位 ID。                               | 否 |

配置完成后，点击 **Confirm** 保存更改。

*RAGFlow 会立即验证连接。*

### 关联到数据集

仅凭凭证不会触发索引。您必须将数据源关联到特定数据集：

1. 导航到 **Dataset** 选项卡。
2. 选择或创建目标数据集。
3. 导航到数据集的 **Configuration** 页面，选择 **Link data source**。
4. 在弹出的窗口中选择之前创建的 Notion 连接器。
