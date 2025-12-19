import { TextDecoder as NodeTextDecoder } from 'util'
import { HtmlDocument, HtmlParser } from '@HtmlParser'

// Jest / Node 环境下补齐 TextDecoder（jsdom 里未内置）
if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-expect-error Polyfill for tests
  globalThis.TextDecoder = NodeTextDecoder
}

function stringToArrayBuffer(input: string): ArrayBuffer {
  const nodeBuffer = Buffer.from(input, 'utf-8')
  const arrayBuffer = new ArrayBuffer(nodeBuffer.length)
  new Uint8Array(arrayBuffer).set(nodeBuffer)
  return arrayBuffer
}

describe('HtmlParser', () => {
  it('可以解析 HTML 文本节点并保留样式信息', async () => {
    const html =
      '<!doctype html><html><head><title>测试</title></head><body><p style="font-size:20px;font-weight:700;color:#111">你好</p><div>世界</div></body></html>'
    const buffer = stringToArrayBuffer(html)

    expect(buffer instanceof ArrayBuffer).toBe(true)
    expect(typeof TextDecoder).toBe('function')

    const doc = await HtmlParser.encode(buffer)

    expect(doc).toBeDefined()
    const pages = await doc!.getPages()
    expect(pages).toHaveLength(1)
    const page = pages[0]
    expect(page.getPureText()).toBe('你好\n世界')

    const intermediate = (doc as HtmlDocument).getIntermediateDocument()
    const [firstPage] = await intermediate.pages
    const [firstText, secondText] = firstPage.texts

    expect(firstText.fontSize).toBe(20)
    expect(firstText.fontWeight).toBe(700)
    expect(firstText.color).toBe('#111')
    expect(secondText.fontSize).toBe(16)
  })

  it('在缺少 DOMParser 时会按行拆分纯文本作为兜底', async () => {
    const html = '<p>行1</p>\n行2'
    const buffer = stringToArrayBuffer(html)

    const originalDomParser = (globalThis as { DOMParser?: typeof DOMParser }).DOMParser
    // @ts-expect-error 有意移除 DOMParser 以触发兜底逻辑
    ;(globalThis as { DOMParser?: undefined }).DOMParser = undefined

    const doc = await HtmlParser.encode(buffer)

    // 及时还原 DOMParser，避免影响其他用例
    ;(globalThis as { DOMParser?: typeof DOMParser }).DOMParser = originalDomParser

    expect(doc).toBeDefined()
    const intermediate = (doc as HtmlDocument).getIntermediateDocument()
    const [firstPage] = await intermediate.pages
    expect(firstPage.texts.map((t) => t.content)).toEqual(['<p>行1</p>', '行2'])
  })

  it('可以把中间文档渲染为包含页面与文本的 HTML 片段', async () => {
    const html = '<body><span>测试片段</span></body>'
    const buffer = stringToArrayBuffer(html)

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const doc = await HtmlParser.encode(buffer)
    expect(doc).toBeDefined()

    const intermediate = (doc as HtmlDocument).getIntermediateDocument()
    const fragment = await HtmlParser.decodeToHtml(intermediate)

    expect(fragment).toContain('hamster-note-document')
    expect(fragment).toContain('hamster-note-page')

    const [firstPage] = await intermediate.pages
    expect(fragment).toContain(firstPage.texts[0].id)
    expect(fragment).toContain('测试片段')

    logSpy.mockRestore()
  })
})
