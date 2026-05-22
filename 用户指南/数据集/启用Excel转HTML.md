---
sidebar_position: 4
slug: /enable_excel2html
sidebar_custom_props: {
  categoryIcon: LucideToggleRight
}
---
# 启用 Excel2HTML

将复杂的 Excel 电子表格转换为 HTML 表格。

---

使用 **General** 分块方法时，可以启用 **Excel to HTML** 开关将电子表格文件转换为 HTML 表格。如果禁用，电子表格将以键值对形式表示。对于无法简单以这种方式表示的复杂表格，必须启用此功能。

:::caution 警告
此功能默认禁用。如果数据集中包含复杂表格的电子表格且未启用此功能，RAGFlow 不会报错，但表格很可能会错乱。
:::

## 适用场景

适用于无法表示为键值对的复杂表格。例如，多列表格、含合并单元格的表格或一个工作表中包含多个表格的情况。在这些情况下，考虑将这些电子表格转换为 HTML 表格。

## 注意事项

- Excel2HTML 功能仅适用于电子表格文件（XLSX 或 XLS (Excel 97-2003)）。
- 此功能与 **General** 分块方法关联。换句话说，*仅当*选择 **General** 分块方法时可用。
- 启用此功能后，超过 12 行的电子表格将被分割为每块 12 行的分块。

## 操作步骤

1. 在数据集的 **Configuration** 页面上，选择 **General** 作为分块方法。

   _此时出现 **Excel to HTML** 开关。_

2. 如果数据集中包含无法表示为键值对的复杂电子表格，启用 **Excel to HTML**。
3. 如果数据集中没有电子表格或其表格可以用键值对表示，保持 **Excel to HTML** 禁用。
4. 如果复杂表格的问答效果不理想，请检查 **Excel to HTML** 是否已启用。

## 常见问题

### 是否应该为包含复杂表格的 PDF 启用此功能？

不需要。此功能仅适用于电子表格文件。启用 **Excel to HTML** 不会影响 PDF 文件。
