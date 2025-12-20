# CHANGELOG

## 2025-12-20
- 修复 PdfParser 文本坐标映射，使用 viewport.transform 确保 y 轴以页面左上角为原点，避免文本上下颠倒。
- 补充 PdfParser 文本坐标单元测试，验证坐标翻转修正。
- 更新 eslint 配置忽略构建产物目录，保障 lint 流程通过。
