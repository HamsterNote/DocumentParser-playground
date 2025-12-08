### DocumentParser Playground 项目简介

本仓库是 HamsterNote 文档解析与渲染能力的实验性 Playground。目标是在浏览器中将不同格式的文档（当前以 PDF 为主）解析为统一的 HamsterDocument 抽象模型，并提供基础的页面渲染组件，便于后续在产品中集成和演进。

#### 技术栈

- 构建与开发：Vite + TypeScript + React 18
- PDF 解析：pdf.js（pdfjs-dist）
- OCR 实验：tesseract.js（目前处于探索阶段）

---

### 快速开始

1. 安装依赖

```
yarn
```

2. 启动开发服务器（默认端口 6673）

```
yarn dev
```

3. 构建与本地预览

```
yarn build
yarn preview  # 端口 6673
```

首次打开页面后，点击“选择文件”上传一个 `.pdf` 文件即可在页面中看到解析与渲染结果。

---

### 目录结构概览

仓库为单一应用，内含两个工作空间包（workspaces）：

```
documentparser-playground/
├─ public/
│  └─ pdf.worker.mjs             # pdf.js worker（运行时通过 document.baseURI 加载）
├─ src/
│  ├─ parser/
│  │  ├─ DocumentParser/         # 文档解析核心抽象与注册机制（workspace 包）
│  │  └─ PdfParser/              # PDF 具体实现（workspace 包）
│  ├─ components/
│  │  ├─ Document/               # 文档级渲染组件（遍历页面）
│  │  └─ Page/                    # 单页渲染组件（Canvas + TextLayer）
│  ├─ types/                      # 通用类型与中间结构（Intermediate*）
│  ├─ App.tsx                     # 示例应用入口（上传文件 + 渲染）
│  └─ main.tsx                    # 应用启动、pdf.js worker 与解析器注册
├─ vite.config.ts                 # 别名与 dev/preview 端口等配置
├─ package.json                   # scripts 与 workspaces 配置
└─ README.md                      # 本文档
```

Vite 路径别名（见 `vite.config.ts`）：

- `@src` → `src`
- `@parser` → `src/parser`
- `@DocumentParser` → `src/parser/DocumentParser`
- `@PdfParser` → `src/parser/PdfParser`
- `@math` → `src/types/common/math`
- `@typesCommon` → `src/types/common`

---

### 核心架构与数据模型

1. 统一抽象：`HamsterDocument` / `HamsterPage`

- 位于 `src/parser/DocumentParser/src/Document/`。
- `HamsterDocument` 抽象了跨格式的文档接口：
  - `getPages(): Promise<HamsterPage[]>`
  - `getPage(pageNumber: number): Promise<HamsterPage | undefined>`
  - `getOutline(): Promise<{ title: string; anchor?: DocumentAnchor } | undefined>`
  - `getCover(): Promise<HTMLCanvasElement | HTMLImageElement>`
- `HamsterPage` 提供页面级能力（如 `render()`、`getNumber()`、`getSize(scale)` 等，具体实现由各解析器提供）。

2. 解析器基类：`DocumentParser`

- 位于 `src/parser/DocumentParser/src/Parser/`。
- 抽象出从 `File | ArrayBuffer` → `HamsterDocument` 的过程。

3. 解析器注册与选择

- `src/parser/DocumentParser/src/register/` 提供：
  - `registerParser(ParserClass)`：注册解析器（类），依赖其静态属性 `ext`（文件扩展名）。
  - `parse(file)`：根据文件后缀匹配解析器，返回 `HamsterDocument`。
- 在 `src/main.tsx` 中通过 `registerParser(PdfParser)` 注册 PDF 解析器。

4. PDF 实现：`PdfParser` + `PdfDocument` + `PdfPage`

- `PdfParser`（`src/parser/PdfParser/src/Parser/`）：继承 `DocumentParser`，将输入加载为 `ArrayBuffer` 后创建 `PdfDocument`。
- `PdfDocument`（`src/parser/PdfParser/src/Document/`）：基于 `pdfjs-dist` 加载文档、获取页、大纲与封面。
- `PdfPage`（`src/parser/PdfParser/src/Page/`）：
  - 通过 `pdfjs-dist` 在 `<canvas>` 渲染位图；
  - 可选择启用文字层（`TextLayer`）渲染；
  - 尝试引入 `tesseract.js` 做 OCR 实验（暂未用于 UI 展示）。

5. 中间数据结构（可选）

- `src/types/common/HamsterDocument/Intermediate*`：为后续统一抽象输出准备的中间结构与序列化/反序列化能力。

---

### 运行时要点与示例

1. 配置 pdf.js worker

- 在 `src/main.tsx` 中：
  ```ts
  import { GlobalWorkerOptions } from 'pdfjs-dist';
  const pdfWorkerUrl = new URL('pdf.worker.mjs', document.baseURI).toString();
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  ```
- 将 `pdf.worker.mjs` 放在 `public/` 根目录，dev 与 build 后的预览均可通过 `document.baseURI` 正确解析路径。

2. 页面示例（用户代码片段）

```tsx
import { HamsterDocument, parse } from '@DocumentParser';
import { HamsterDocumentComponent } from '@src/components/Document';

export default function App() {
  const [doc, setDoc] = React.useState<HamsterDocument>();
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parse(file)?.then((res) => setDoc(res));
  };
  return (
    <>
      <input type='file' onChange={onUpload} />
      {doc && <HamsterDocumentComponent doc={doc} />}
    </>
  );
}
```

3. 渲染细节

- `HamsterDocumentComponent`：拉取 `doc.getPages()` 并循环渲染 `HamsterPageComponent`。
- `HamsterPageComponent`：
  - 使用 `IntersectionObserver` 懒加载，进入视口时触发 `page.render(container, { scale, views })`；
  - 通过 `RenderViews.TEXT` 可启用文字层；默认会渲染到一个绝对定位的 `<canvas>` 上。

---

### 脚本与工作区

根目录 `package.json`：

- `workspaces`: `./src/parser/DocumentParser`, `./src/parser/PdfParser`
- `scripts`：
  - `yarn dev`：启动开发服务器
  - `yarn build`：TypeScript 构建 + Vite 打包
  - `yarn preview`：本地预览（端口 6673）

---

### 当前进展与限制

- 目前仅实现了 PDF 的基础解析与渲染：
  - 支持获取页码与基础渲染（Canvas）
  - 支持文字层（TextLayer）叠加
  - 大纲与封面 API 已有接口定义，PDF 的大纲获取已打通；封面仍为占位实现
- OCR（tesseract.js）处于实验状态：
  - 代码中会创建 worker 并识别当前页 Canvas，但结果仅做日志输出，未集成到 UI
- 类型与中间结构（`Intermediate*`）基础已具备，但尚未在渲染链路中全面采用

---

### Roadmap（规划）

- 渲染
  - [ ] 封面生成功能完善（从第一页渲染封面图）
  - [ ] 页内交互（文本选择、高亮、跳转锚点）
  - [ ] 分页虚拟化与更精细的懒加载策略
- 解析
  - [ ] 完善 `HamsterPage.getPureText()` 等抽象能力
  - [ ] 中间结构（Intermediate）全面落地与序列化/反序列化流程
  - [ ] 扩展更多文档格式解析器（如图片集/Office 等）
- OCR / 结构化
  - [ ] 将 OCR 结果与 PDF 文字层对齐，用于版面/结构识别
  - [ ] 提供可插拔的识别管线与调试面板
- 工程
  - [ ] 简单自动化测试（快照/渲染）与示例文档集
  - [ ] 文档完善（开发指南、贡献指南、FAQ）

---

### 常见问题（FAQ）

1. 为什么要将 `pdf.worker.mjs` 放在 `public/`？

- 避免使用 `import.meta.url`，同时确保 dev 与生产预览都能通过 `document.baseURI` 解析正确路径，兼容子路径部署。

2. 解析器是如何选择的？

- 通过文件扩展名（例如 `pdf`）在注册表中匹配，返回对应解析器类实例，然后调用其 `parse()` 生成 `HamsterDocument`。

3. 可以只用解析能力，不使用内置组件吗？

- 可以。你可以直接调用 `parse(file)` 拿到 `HamsterDocument` 后，自行遍历 `getPages()` 并调用 `page.render(container, options)` 将结果渲染到你自己的容器中。

---

### 许可证

本仓库遵循仓库根目录的 `LICENSE` 文件所述协议。
