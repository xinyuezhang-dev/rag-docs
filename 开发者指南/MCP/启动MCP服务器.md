---
sidebar_position: 1
slug: /launch_mcp_server
sidebar_custom_props: {
  categoryIcon: LucideTvMinimalPlay
}
---
# 启动 RAGFlow MCP 服务器

从源码或通过 Docker 启动 MCP 服务器。

---

RAGFlow Model Context Protocol (MCP) 服务器设计为独立组件，与 RAGFlow 服务器配合使用。请注意，MCP 服务器必须与正常运行 RAGFlow 服务器一起工作。

MCP 服务器可以以自托管模式（默认）或主机模式启动：

- **自托管模式**：
  以自托管模式启动 MCP 服务器时，必须提供 API 密钥以认证 MCP 服务器与 RAGFlow 服务器。在此模式下，MCP 服务器只能访问 RAGFlow 服务器上指定租户的数据集。
- **主机模式**：
  在主机模式下，每个 MCP 客户端可以访问自己在 RAGFlow 服务器上的数据集。但是，每个客户端请求都必须包含有效的 API 密钥以认证客户端与 RAGFlow 服务器。

连接建立后，MCP 服务器以 MCP HTTP+SSE（Server-Sent Events）模式与其客户端通信，将 RAGFlow 服务器的响应单向实时推送给客户端。

## 前置条件

1. 确保 RAGFlow 已升级到 v0.18.0 或更高版本。
2. 准备好您的 RAGFlow API 密钥。请参阅[获取 RAGFlow API 密钥](../acquire_ragflow_api_key.md)。

:::tip 提示
如果您希望在不升级 RAGFlow 的情况下试用我们的 MCP 服务器，社区贡献者 [yiminghub2024](https://github.com/yiminghub2024) 👏 在[此处](#Launch-an-mcp-server-without-upgrading-ragflow)分享了推荐的步骤。
:::

## 启动 MCP 服务器

您可以从源码或通过 Docker 启动 MCP 服务器。

### 从源码启动

1. 确保 RAGFlow 服务器 v0.18.0+ 正在正常运行。
2. 启动 MCP 服务器：


```bash
# 以自托管模式启动 MCP 服务器，运行以下任一命令
uv run mcp/server/server.py --host=127.0.0.1 --port=9382 --base-url=http://127.0.0.1:9380 --api-key=ragflow-xxxxx
# uv run mcp/server/server.py --host=127.0.0.1 --port=9382 --base-url=http://127.0.0.1:9380 --mode=self-host --api-key=ragflow-xxxxx

# 要以主机模式启动 MCP 服务器，请改为运行以下命令：
# uv run mcp/server/server.py --host=127.0.0.1 --port=9382 --base-url=http://127.0.0.1:9380 --mode=host
```

其中：

- `host`：MCP 服务器的主机地址。
- `port`：MCP 服务器的监听端口。
- `base_url`：正在运行的 RAGFlow 服务器地址。
- `mode`：启动模式。
  - `self-host`：（默认）自托管模式。
  - `host`：主机模式。
- `api_key`：自托管模式必需，用于认证 MCP 服务器与 RAGFlow 服务器。有关获取 API 密钥的说明，请参见[此处](../acquire_ragflow_api_key.md)。

### 传输方式

RAGFlow MCP 服务器支持两种传输方式：旧版 SSE 传输（通过 `/sse` 提供服务），于 2024 年 11 月 5 日引入，2025 年 3 月 26 日弃用；以及 streamable-HTTP 传输（通过 `/mcp` 提供服务）。旧版 SSE 传输和带有 JSON 响应的 streamable HTTP 传输默认启用。要禁用任一传输，请使用 `--no-transport-sse-enabled` 或 `--no-transport-streamable-http-enabled` 标志。要禁用 streamable HTTP 传输的 JSON 响应，请使用 `--no-json-response` 标志。

### 从 Docker 启动

#### 1. 启用 MCP 服务器

MCP 服务器设计为与 RAGFlow 服务器配合使用的可选组件，默认禁用。要启用 MCP 服务器：

1. 导航到 **docker/docker-compose.yml**。
2. 按如下所示取消注释 `services.ragflow.command` 部分：

```yaml {6-13}
  services:
    ragflow:
      ...
      image: ${RAGFLOW_IMAGE}
      # 配置 MCP 服务器的示例配置：
      command:
        - --enable-mcpserver
        - --mcp-host=0.0.0.0
        - --mcp-port=9382
        - --mcp-base-url=http://127.0.0.1:9380
        - --mcp-script-path=/ragflow/mcp/server/server.py
        - --mcp-mode=self-host
        - --mcp-host-api-key=ragflow-xxxxxxx
        # RAGFlow MCP 服务器的可选传输标志。
        # 如果将 `mcp-mode` 设置为 `host`，则必须添加 --no-transport-streamable-http-enabled 标志，
        # 因为主机模式尚不支持 streamable-HTTP 传输。
        # 旧版 SSE 传输和带有 JSON 响应的 streamable-HTTP 传输默认启用。
        # 要禁用特定传输或 streamable-HTTP 传输的 JSON 响应，请使用相应的标志：
        #   - --no-transport-sse-enabled # 禁用旧版 SSE 端点 (/sse)
        #   - --no-transport-streamable-http-enabled # 禁用 streamable-HTTP 传输（通过 /mcp 端点提供服务）
        #   - --no-json-response # 禁用 streamable-HTTP 传输的 JSON 响应
```

其中：

- `mcp-host`：MCP 服务器的主机地址。
- `mcp-port`：MCP 服务器的监听端口。
- `mcp-base-url`：正在运行的 RAGFlow 服务器地址。
- `mcp-script-path`：MCP 服务器主脚本的文件路径。
- `mcp-mode`：启动模式。
  - `self-host`：（默认）自托管模式。
  - `host`：主机模式。
- `mcp-host-api_key`：自托管模式必需，用于认证 MCP 服务器与 RAGFlow 服务器。有关获取 API 密钥的说明，请参见[此处](../acquire_ragflow_api_key.md)。

:::tip 提示
如果将 `mcp-mode` 设置为 `host`，则必须添加 `--no-transport-streamable-http-enabled` 标志，因为主机模式尚不支持 streamable-HTTP 传输。
:::

#### 2. 启动带有 MCP 服务器的 RAGFlow 服务器

运行 `docker compose -f docker-compose.yml up` 来启动 RAGFlow 服务器和 MCP 服务器。

*以下 ASCII 艺术表示启动成功：*

```bash
  docker-ragflow-cpu-1  | Starting MCP Server on 0.0.0.0:9382 with base URL http://127.0.0.1:9380...
  docker-ragflow-cpu-1  | Starting 1 task executor(s) on host 'dd0b5e07e76f'...
  docker-ragflow-cpu-1  | 2025-04-18 15:41:18,816 INFO     27 ragflow_server log path: /ragflow/logs/ragflow_server.log, log levels: {'peewee': 'WARNING', 'pdfminer': 'WARNING', 'root': 'INFO'}
  docker-ragflow-cpu-1  | 
  docker-ragflow-cpu-1  | __  __  ____ ____       ____  _____ ______     _______ ____
  docker-ragflow-cpu-1  | |  \/  |/ ___|  _ \     / ___|| ____|  _ \ \   / / ____|  _ \
  docker-ragflow-cpu-1  | | |\/| | |   | |_) |    \___ \|  _| | |_) \ \ / /|  _| | |_) |
  docker-ragflow-cpu-1  | | |  | | |___|  __/      ___) | |___|  _ < \ V / | |___|  _ <
  docker-ragflow-cpu-1  | |_|  |_|\____|_|        |____/|_____|_| \_\ \_/  |_____|_| \_\
  docker-ragflow-cpu-1  |     
  docker-ragflow-cpu-1  | MCP launch mode: self-host
  docker-ragflow-cpu-1  | MCP host: 0.0.0.0
  docker-ragflow-cpu-1  | MCP port: 9382
  docker-ragflow-cpu-1  | MCP base_url: http://127.0.0.1:9380
  docker-ragflow-cpu-1  | INFO:     Started server process [26]
  docker-ragflow-cpu-1  | INFO:     Waiting for application startup.
  docker-ragflow-cpu-1  | INFO:     Application startup complete.
  docker-ragflow-cpu-1  | INFO:     Uvicorn running on http://0.0.0.0:9382 (Press CTRL+C to quit)
  docker-ragflow-cpu-1  | 2025-04-18 15:41:20,469 INFO     27 found 0 gpus
  docker-ragflow-cpu-1  | 2025-04-18 15:41:23,263 INFO     27 init database on cluster mode successfully
  docker-ragflow-cpu-1  | 2025-04-18 15:41:25,318 INFO     27 load_model /ragflow/rag/res/deepdoc/det.onnx uses CPU
  docker-ragflow-cpu-1  | 2025-04-18 15:41:25,367 INFO     27 load_model /ragflow/rag/res/deepdoc/rec.onnx uses CPU
  docker-ragflow-cpu-1  |         ____   ___    ______ ______ __               
  docker-ragflow-cpu-1  |        / __ \ /   |  / ____// ____// /____  _      __
  docker-ragflow-cpu-1  |       / /_/ // /| | / / __ / /_   / // __ \| | /| / /
  docker-ragflow-cpu-1  |      / _, _// ___ |/ /_/ // __/  / // /_/ /| |/ |/ / 
  docker-ragflow-cpu-1  |     /_/ |_|/_/  |_|\____//_/    /_/ \____/ |__/|__/                             
  docker-ragflow-cpu-1  | 
  docker-ragflow-cpu-1  |     
  docker-ragflow-cpu-1  | 2025-04-18 15:41:29,088 INFO     27 RAGFlow version: v0.18.0-285-gb2c299fa full
  docker-ragflow-cpu-1  | 2025-04-18 15:41:29,088 INFO     27 project base: /ragflow
  docker-ragflow-cpu-1  | 2025-04-18 15:41:29,088 INFO     27 Current configs, from /ragflow/conf/service_conf.yaml:
  docker-ragflow-cpu-1  |  ragflow: {'host': '0.0.0.0', 'http_port': 9380}
  ...
  docker-ragflow-cpu-1  |  * Running on all addresses (0.0.0.0)
  docker-ragflow-cpu-1  |  * Running on http://127.0.0.1:9380
  docker-ragflow-cpu-1  |  * Running on http://172.19.0.6:9380
  docker-ragflow-cpu-1  |   ______           __      ______                     __            
  docker-ragflow-cpu-1  |  /_  __/___ ______/ /__   / ____/  _____  _______  __/ /_____  _____
  docker-ragflow-cpu-1  |   / / / __ `/ ___/ //_/  / __/ | |/_/ _ \/ ___/ / / / __/ __ \/ ___/
  docker-ragflow-cpu-1  |  / / / /_/ (__  ) ,<    / /____>  </  __/ /__/ /_/ / /_/ /_/ / /    
  docker-ragflow-cpu-1  | /_/  \__,_/____/_/|_|  /_____/_/|_|\___/\___/\__,_/\__/\____/_/                               
  docker-ragflow-cpu-1  |     
  docker-ragflow-cpu-1  | 2025-04-18 15:41:34,501 INFO     32 TaskExecutor: RAGFlow version: v0.18.0-285-gb2c299fa full
  docker-ragflow-cpu-1  | 2025-04-18 15:41:34,501 INFO     32 Use Elasticsearch http://es01:9200 as the doc engine.
  ...
```

#### 在不升级 RAGFlow 的情况下启动 MCP 服务器

:::info 致谢
本节由社区贡献者 [yiminghub2024](https://github.com/yiminghub2024) 贡献。👏
:::

1. 准备所有 MCP 相关文件和目录。
   i. 将 [mcp/](https://github.com/infiniflow/ragflow/tree/main/mcp) 目录复制到本地工作目录。
   ii. 将 [docker/docker-compose.yml](https://github.com/infiniflow/ragflow/blob/main/docker/docker-compose.yml) 复制到本地。
   iii. 将 [docker/entrypoint.sh](https://github.com/infiniflow/ragflow/blob/main/docker/entrypoint.sh) 复制到本地。
   iv. 使用 `uv` 安装所需依赖：
       - 运行 `uv add mcp` 或
       - 将 [pyproject.toml](https://github.com/infiniflow/ragflow/blob/main/pyproject.toml) 复制到本地并运行 `uv sync --python 3.12`。
2. 编辑 **docker-compose.yml** 以启用 MCP（默认禁用）。
3. 启动 MCP 服务器：

```bash
docker compose -f docker-compose.yml up -d
```

### 检查 MCP 服务器状态

运行以下命令查看 RAGFlow 服务器和 MCP 服务器的日志：

```bash
docker logs docker-ragflow-cpu-1
```

## 安全注意事项

由于 MCP 技术仍处于早期阶段，官方尚未建立认证或授权的最佳实践，RAGFlow 目前使用 [API 密钥](../acquire_ragflow_api_key.md) 来验证上述操作的合法性。但是，在公共网络环境中，这种权宜方案可能会使您的 MCP 服务器面临潜在的网络攻击。因此，在运行本地 SSE 服务器时，建议仅绑定到 localhost（`127.0.0.1`）而非所有接口（`0.0.0.0`）。

更多指导请参见[官方 MCP 文档](https://modelcontextprotocol.io/docs/concepts/transports#security-considerations)。

## 常见问题

### 何时使用 API 密钥进行认证？

API 密钥的使用取决于您的 MCP 服务器运行模式。

- **自托管模式**（默认）：
  以自托管模式启动 MCP 服务器时，应在启动时提供 API 密钥以认证其与 RAGFlow 服务器：
  - 如果从源码启动，请在命令中包含 API 密钥。
  - 如果通过 Docker 启动，请在 **docker/docker-compose.yml** 中更新 API 密钥。
- **主机模式**：
  如果 RAGFlow MCP 服务器在主机模式下工作，请在客户端请求的 `headers` 中包含 API 密钥以认证客户端与 RAGFlow 服务器。[此处](https://github.com/infiniflow/ragflow/blob/main/mcp/client/client.py) 有一个示例。
