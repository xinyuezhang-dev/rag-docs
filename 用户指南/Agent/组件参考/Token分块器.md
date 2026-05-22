---
sidebar_position: 32
slug: /chunker_token_component
sidebar_custom_props: {
  categoryIcon: LucideBlocks
}
---
# Token chunker 组件

将文本分割为分块的组件，遵循最大 token 限制并使用分隔符找到最佳分割点。

---

**Token chunker** 组件是一种文本分割器，在推荐的最大 token 长度内创建分块，使用分隔符确保逻辑上的分割点。它将长文本分割为大小适当、语义相关的分块。

## 适用场景

**Token chunker** 组件是可选的，通常紧跟在 **Parser** 或 **Title chunker** 之后。

## 配置说明

### 推荐分块大小

每个创建的分块的推荐最大 token 限制。**Token chunker** 组件在指定的分隔符处分块。如果在达到分隔符之前达到了 token 限制，则在此时创建分块。

### 重叠百分比 (%)

定义分块之间的重叠百分比。适当的重叠可以确保语义连贯性，同时避免为 LLM 产生过多冗余 token。

- 默认值：0
- 最大值：30%

### 分隔符

默认为 `\n`。点击右侧的**回收站**按钮可删除它，或点击 **+ 添加**来添加分隔符。

### 输出

**Token chunker** 组件输出的全局变量名称，可以被数据摄入管道中的后续组件引用。

- 默认值：`chunks`
- 类型：`Array<Object>`
