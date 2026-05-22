---
sidebar_position: 3
slug: /mcp_client
sidebar_custom_props: {
  categoryIcon: LucideBookMarked
}

---
# RAGFlow MCP 客户端示例

Python 和 curl MCP 客户端示例。

------

## MCP Python 客户端示例

我们在[此处](https://github.com/infiniflow/ragflow/blob/main/mcp/client/client.py)提供了一个*原型* MCP 客户端示例用于测试。

:::info 重要
如果您的 MCP 服务器在主机模式下运行，请在异步连接时在客户端的 `headers` 中包含您获取的 API 密钥：

```python
async with sse_client("http://localhost:9382/sse", headers={"api_key": "YOUR_KEY_HERE"}) as streams:
    # 其余代码...
```

或者，为了符合 [OAuth 2.1 第 5 节](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12#section-5) 的规定，您可以运行以下代码*替代*上述方式来连接到 MCP 服务器：

```python
async with sse_client("http://localhost:9382/sse", headers={"Authorization": "YOUR_KEY_HERE"}) as streams:
    # 其余代码...
```
:::

## 使用 curl 与 RAGFlow MCP 服务器交互

通过 HTTP 请求与 MCP 服务器交互时，请按照以下初始化顺序操作：

1. **客户端发送 `initialize` 请求**，包含协议版本和能力。
2. **服务器回复 `initialize` 响应**，包括支持的协议和能力。
3. **客户端发送 `initialized` 通知确认就绪**。
   *客户端与服务器之间的连接建立完成，后续操作（如列出工具）可以继续。*

:::tip 注意
有关此初始化过程的更多信息，请参见[此处](https://modelcontextprotocol.io/docs/concepts/architecture#1-initialization)。
:::

在以下章节中，我们将带您完成一个完整的工具调用流程。

### 1. 获取会话 ID

每个与 MCP 服务器的 curl 请求都必须包含会话 ID：

```bash
$ curl -N -H "api_key: YOUR_API_KEY" http://127.0.0.1:9382/sse
```

:::tip 注意
有关获取 API 密钥的信息，请参见[此处](../acquire_ragflow_api_key.md)。
:::

#### 传输

传输通道将流式传递工具结果、服务器响应和心跳保活等消息。

*服务器返回会话 ID：*

```bash
event: endpoint
data: /messages/?session_id=5c6600ef61b845a788ddf30dceb25c54
```

### 2. 发送 `Initialize` 请求

客户端发送 `initialize` 请求，包含协议版本和能力：

```bash
session_id="5c6600ef61b845a788ddf30dceb25c54" && \

curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "1.0",
      "capabilities": {},
      "clientInfo": {
        "name": "ragflow-mcp-client",
        "version": "0.1"
      }
    }
  }' && \
```

#### 传输

*服务器回复 `initialize` 响应，包括支持的协议和能力：*

```bash
event: message
data: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26","capabilities":{"experimental":{"headers":{"host":"127.0.0.1:9382","user-agent":"curl/8.7.1","accept":"*/*","api_key":"ragflow-xxxxxxxxxxxx","accept-encoding":"gzip"}},"tools":{"listChanged":false}},"serverInfo":{"name":"docker-ragflow-cpu-1","version":"1.9.4"}}}
```

### 3. 确认就绪

客户端发送 `initialized` 通知确认就绪：

```bash
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "notifications/initialized",
    "params": {}
  }' && \
```

*客户端与服务器之间的连接建立完成，后续操作（如列出工具）可以继续。*

### 4. 列出工具

```bash
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/list",
    "params": {}
  }' && \
```

#### 传输

```bash
event: message
data: {"jsonrpc":"2.0","id":3,"result":{"tools":[{"name":"ragflow_retrieval","description":"Retrieve relevant chunks from the RAGFlow retrieve interface based on the question, using the specified dataset_ids and optionally document_ids. Below is the list of all available datasets, including their descriptions and IDs. If you're unsure which datasets are relevant to the question, simply pass all dataset IDs to the function.","inputSchema":{"type":"object","properties":{"dataset_ids":{"type":"array","items":{"type":"string"}},"document_ids":{"type":"array","items":{"type":"string"}},"question":{"type":"string"}},"required":["dataset_ids","question"]}}]}}

```

### 5. 调用工具

```bash
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "ragflow_retrieval",
      "arguments": {
        "question": "How to install neovim?",
        "dataset_ids": ["DATASET_ID_HERE"],
        "document_ids": []
      }
    }
  }'
```

#### 传输

```bash
event: message
data: {"jsonrpc":"2.0","id":4,"result":{...}}

```

### 完整的 curl 示例

```bash
session_id="YOUR_SESSION_ID" && \

# 第 1 步：初始化请求
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "1.0",
      "capabilities": {},
      "clientInfo": {
        "name": "ragflow-mcp-client",
        "version": "0.1"
      }
    }
  }' && \

sleep 2 && \

# 第 2 步：就绪通知
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "notifications/initialized",
    "params": {}
  }' && \

sleep 2 && \

# 第 3 步：列出工具
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/list",
    "params": {}
  }' && \

sleep 2 && \

# 第 4 步：调用工具
curl -X POST "http://127.0.0.1:9382/messages/?session_id=$session_id" \
  -H "api_key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "ragflow_retrieval",
      "arguments": {
        "question": "How to install neovim?",
        "dataset_ids": ["DATASET_ID_HERE"],
        "document_ids": []
      }
    }
  }'

```
