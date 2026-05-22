---
sidebar_position: 3
slug: /add_google_drive
sidebar_custom_props: {
  categoryIcon: SiGoogledrive
}
---

# 添加 Google Drive

将 Google Drive 添加为 RAGFlow 的数据源之一。

---

本文档提供将 Google Drive 集成为 RAGFlow 数据源的分步说明。

## 1. 创建 Google Cloud 项目

您可以为 RAGFlow 创建专用项目，也可以使用现有的 Google Cloud 外部项目。本例中，我们从零开始创建 Google Cloud 项目：

1. 打开项目创建页面 `https://console.cloud.google.com/projectcreate`：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image1.jpeg?raw=true)
2. 在 **App Information** 下，提供应用名称和您的 Gmail 账户作为用户支持邮箱：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image2.png?raw=true)
3. 选择 **External**：
   _您的应用将以测试模式启动，仅对选定的用户列表可用。_
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image3.jpeg?raw=true)
4. 点击 **Create** 确认创建。

## 2. 配置 OAuth 同意屏幕

您需要配置 OAuth 同意屏幕，因为在此步骤中，您需要定义应用如何请求权限以及希望代表用户访问哪些具体数据。这是设置 Google OAuth 2.0 认证的必需步骤。可以将其理解为为应用创建标准化的权限申请单。没有它，Google 将不允许您的应用请求访问用户数据。

1. 进入 **APIs & Services** → **OAuth consent screen**。
2. 确保 **User Type** 设置为 **External**：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image4.jpeg?raw=true)
3. 在 **Test Users** 下，点击 **+ Add users** 添加测试用户：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image5.jpeg?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image6.jpeg?raw=true)

## 3. 创建 OAuth 客户端凭证

1. 导航到 `https://console.cloud.google.com/auth/clients`。
2. 为创建的项目选择 **Web Application** 作为 **Application type**：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image7.png?raw=true)
3. 输入客户端名称。
4. 添加 `http://localhost:9380/api/v1/connectors/google-drive/oauth/web/callback` 作为 **Authorised redirect URIs**：
5. 添加 **Authorised JavaScript origins**：
   - 如果通过 Docker 部署 RAGFlow，使用 `http://localhost:80`：
     ![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image8.png?raw=true)
   - 如果从源码构建 RAGFlow，使用 `http://localhost:9222`
     ![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image9.png?raw=true)
6. 保存后，在弹出的窗口中点击 **Download JSON**；此凭证文件将随后上传到 RAGFlow 中。

![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image10.png?raw=true)

## 4. 添加作用域

您需要添加作用域来明确定义应用程序需要从用户 Google Drive 获取的具体访问级别，例如文件的只读访问权限。这些作用域会在同意屏幕上展示给用户，确保透明度，让用户清楚知道被授予了哪些权限。操作步骤如下：

1. 点击 **Data Access** → **Add or remove scopes**，添加以下条目并点击 **Update**：

```
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
https://www.googleapis.com/auth/admin.directory.group.readonly
https://www.googleapis.com/auth/admin.directory.user.readonly
```

![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image11.jpeg?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image12.jpeg?raw=true)

2. 点击 **Save** 保存数据访问更改：

![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image13.jpeg?raw=true)

## 5. 启用所需 API

您需要启用所需的 API（如 Google Drive API），正式授予 Google Cloud 项目代表您的应用与 Google 服务通信的权限。这些 API 充当网关；即使拥有有效的 OAuth 凭证，Google 也会阻止对已禁用 API 的请求。启用它们可确保 RAGFlow 尝试列出或检索文件时，Google 的服务器能够识别并授权该请求。

1. 导航到 Google API Library `https://console.cloud.google.com/apis/library`：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image14.png?raw=true)

2. 启用以下 API：
   - Google Drive API
   - Admin SDK API
   - Google Sheets API
   - Google Docs API

![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image15.png?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image16.png?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image17.png?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image18.png?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image19.png?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image21.png?raw=true)

## 6. 在 RAGFlow 中添加 Google Drive 作为数据源

1. 在 RAGFlow 中进入 **Data Sources** 并选择 **Google Drive**。
2. 在 **OAuth Token JSON** 下，上传之前在[第 2 节](#2-配置-oauth-同意屏幕)中保存的 JSON 凭证：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image22.jpeg?raw=true)
3. 输入共享的 Google Drive 文件夹链接 URL：
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image23.png?raw=true)
4. 点击 **Authorize with Google**
   _浏览器窗口弹出，显示 Google 尚未验证此应用。_
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image25.jpeg?raw=true)
5. 点击 **Continue** → **Select All** → **Continue**。
6. 授权成功后，选择 **OK** 添加数据源。
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image26.jpeg?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image27.jpeg?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image28.png?raw=true)
![](https://github.com/infiniflow/ragflow-docs/blob/040e4acd4c1eac6dc73dc44e934a6518de78d097/images/google_drive/image29.png?raw=true)
