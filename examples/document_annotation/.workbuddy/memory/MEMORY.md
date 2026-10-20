# 项目长期记忆 — examples/document_annotation

## 工程性质
Dynamsoft 官方示例：Web 文档查看/注解 Demo（Dynamsoft Document Viewer + Capture Vision + Dynamic Web TWAIN）。
是一个**纯静态**页面（无构建步骤），直接 `index.html` + `main.js` + `css` 运行；所有 SDK 走 CDN。

## 关键约定
- **SDK 全部走 CDN 且必须固定版本号**（不使用 `@latest`），便于复现。当前固定：
  - `dynamsoft-capture-vision-bundle@3.6.3200`
  - `dynamsoft-document-viewer@5.0.1`（含 `dist/plugins/ddv-plugin-annotation.js`、`dist/plugins/ddv-plugin-image-pdf.js`）
  - `dwt@19.4.4`
- **DDV 4.0+ 是插件架构**：注解与 PDF/图像解析必须通过 `Dynamsoft.DDV.use(...)` 在 `Dynamsoft.DDV.Core.init()` 之前注册；DDV 5.0.0 需单独设置 `Dynamsoft.DDV.Core.license`。
- **不要在脚本顶层访问 `Dynamsoft.DDV.annotationManager`**（插件注册前为 undefined，会中断 main.js）。相关监听统一在 `activate()` 内注册（`registerAnnotationEvents()`）。
- `full.json` 是自定义 Capture Vision 模板（`ReadMRZ`、`ReadVINText`），通过 `cvRouter.initSettings("./full.json")` 加载；不是内置预设模板。
- 运行/验证必须起 http 服务（DWT 不支持 file://）。
- 页面的 license 输入框留空时回退到内置公共试用 key（会弹 24h 试用提示，属正常现象）。

## 验证清单（改动后用浏览器实测）
1. 起 `python -m http.server`，打开页面点 "Activate SDK"。
2. 检查控制台无 error。
3. 验证：载入 png/pdf、注解创建与渲染、条码识别（`ReadBarcodes_ReadRateFirst`）、MRZ（`full.json` + `ReadMRZ`）。
4. DWT 实际扫描需真机扫描仪 + 本机 Dynamic Web TWAIN Service，无法在本环境验证。
