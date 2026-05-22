---
sidebar_position: 1
slug: /llm_api_key_setup
sidebar_custom_props: {
  categoryIcon: LucideKey
}
---
# 配置模型 API 密钥

RAGFlow 与在线 AI 模型交互需要 API 密钥。本指南介绍如何在 RAGFlow 中设置模型 API 密钥。

## 获取模型 API 密钥

RAGFlow 支持大多数主流的 LLM。请参阅[支持的模型](../../guides/models/supported_models.md)获取完整的支持模型列表。您需要在线申请模型 API 密钥。请注意，大多数 LLM 提供商会为新创建的账户提供试用额度（几个月后到期）或一定数量的免费配额。

:::note
如果您发现您的在线 LLM 不在列表中，不要气馁。列表正在不断扩展，您可以[提交功能请求](https://github.com/infiniflow/ragflow/issues/new?assignees=&labels=feature+request&projects=&template=feature_request.yml&title=%5BFeature+Request%5D%3A+)告诉我们！或者，如果您有定制或本地部署的模型，可以[使用 Ollama、Xinference 或 LocalAI 将它们绑定到 RAGFlow](./deploy_local_llm.md)。
:::

## 配置模型 API 密钥

您有两个选项来配置模型 API 密钥：

- 在启动 RAGFlow 之前在 **service_conf.yaml.template** 中配置。
- 登录 RAGFlow 后在 **Model providers** 页面上配置。

### 在启动 RAGFlow 前配置模型 API 密钥

1. 导航到 **./docker/ragflow**。
2. 找到条目 **user_default_llm**：
   - 将 `factory` 更新为您选择的 LLM。
   - 将 `api_key` 更新为您的密钥。
   - 如果使用代理连接到远程服务，更新 `base_url`。
3. 重启系统以使更改生效。
4. 登录 RAGFlow。
   _登录 RAGFlow 后，您会发现所选模型出现在 **Model providers** 页面的 **Added models** 下。_

### 登录 RAGFlow 后配置模型 API 密钥

:::caution 警告
登录 RAGFlow 后，通过 **service_conf.yaml.template** 文件配置模型 API 密钥将不再生效。
:::

登录 RAGFlow 后，*只能*在 **Model providers** 页面上配置 API Key：

1. 点击页面右上角的 Logo **>** **Model providers**。
2. 在 **Models to be added** 下找到您的模型卡片，点击 **Add the model**。
3. 粘贴您的模型 API 密钥。
4. 如果使用代理连接远程服务，填写您的 Base URL。
5. 点击 **OK** 确认更改。
