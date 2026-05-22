---
sidebar_position: 15
slug: /add_github_repo
sidebar_custom_props: {
  categoryIcon: SiGoogledrive
}
---

# 添加 GitHub 仓库

关联您的 GitHub 仓库以同步 pull request 或 issue。

---

本文档介绍如何将 GitHub 仓库关联到 RAGFlow 以同步 pull request 和 issue。

## 1. GitHub 配置

在配置 RAGFlow 之前，必须先准备 GitHub 账户并生成必要的凭证。

### 步骤 a：公开邮箱配置

为确保组织与 RAG 引擎之间的身份匹配和权限同步顺畅，建议将邮箱设为可见。

1. 进入 GitHub **Settings** > **Emails**。
2. 取消勾选"Keep my email addresses private"。
3. 进入 **Public profile**，确保在 **Public email** 下拉菜单中选择了您的主邮箱。

### 步骤 b：生成个人访问令牌（PAT）

1. 导航到 **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**。
2. 点击 **Generate new token (classic)**。
3. **所需作用域：**
   - **`repo`（完全控制）：** 访问私有仓库、PR 和 issue 所必需。
   - **`read:org`（可选）：** 如果您要同步整个组织的仓库。
   - **`workflow`（可选）：** 如果您打算索引 GitHub Action 日志或 CI/CD 元数据，建议勾选。
4. **复制令牌：** 立即保存，此令牌不会再次显示。

## 2. RAGFlow 连接器设置

GitHub 令牌准备就绪后，在 RAGFlow 实例中注册外部数据源。

1. **访问数据源：** 在 RAGFlow 中点击您的个人头像，选择 **Data source**。
2. **添加 GitHub 连接器：** 点击 **+ Add** 并选择 **GitHub** 图标。
3. **输入配置：**
   - **Source name：** 根据仓库命名（例如 `ragflow-repo`）。
   - **Repo owner：** 用户名或组织名（例如 `infiniflow`）。
   - **Repo name：** 仓库标识符（例如 `ragflow`）。
   - **Access token：** 粘贴在第 1 节中生成的 PAT。
   - **Include Pull Request**：是否包含所选仓库中的 pull request。
   - **Include Issues**：是否包含所选仓库中的 issue。
4. 点击 **Save** 确认更改。
   *RAGFlow 会立即验证连接。*

:::tip 注意
目前，已删除或修改的文件不会自动同步。此功能即将推出。感谢 Gisselle-Gonzalez 提出[此功能请求](https://github.com/infiniflow/ragflow/issues/13708)。
:::

## 3. 数据集绑定与数据摄入

最后，将连接器关联到特定知识库以启动 RAG 流程。

1. **创建/选择数据集：** 进入 **Dataset** 选项卡，进入目标数据集。
2. **关联外部源：** 点击 **+ Add file** 并选择 **External data source**。
3. **选择 GitHub 源：** 选择刚刚创建的连接器。
4. **触发初始同步：**
   - 仓库中的文件将出现在文件列表中。
   - 选择文件并点击 **Run/parsing**。
   - **解析器选择：** 对于代码库，使用 **"Naive"** 解析器进行通用文本提取，或使用当前版本中可用的特定代码感知模板。
