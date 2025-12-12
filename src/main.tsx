import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GlobalWorkerOptions } from 'pdfjs-dist'
import { registerParser } from '@DocumentParser'
import { PdfParser } from '@PdfParser'
import { HtmlParser } from '@HtmlParser'

// 设置 pdf.js 的 worker 文件路径
// 要求：不能使用 import.meta.url，并且在 dev 与 production 环境都可用
// 方案：将 worker 文件放在项目 public 根目录（public/pdf.worker.mjs），
// 通过 document.baseURI 计算出基于 <base> 的绝对地址，适配子路径部署场景。
const pdfWorkerUrl = new URL('pdf.worker.mjs', document.baseURI).toString()
GlobalWorkerOptions.workerSrc = pdfWorkerUrl

registerParser(PdfParser)
registerParser(HtmlParser)

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found in index.html')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
