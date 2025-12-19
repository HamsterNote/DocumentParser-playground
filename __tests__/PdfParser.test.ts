import { PdfParser } from '@PdfParser'
import {
  IntermediateOutlineDestType,
  type IntermediateOutlineDestPage,
  type IntermediateOutlineDestUrl
} from '@typesCommon/HamsterDocument/IntermediateOutline'
import { TextDir } from '@typesCommon/HamsterDocument/IntermediateText'
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  TextContent,
  TextItem
} from 'pdfjs-dist'

jest.mock('pdfjs-dist', () => {
  const getDocument = jest.fn()
  return { getDocument }
})

const { getDocument } = jest.requireMock('pdfjs-dist') as {
  getDocument: jest.MockedFunction<typeof import('pdfjs-dist').getDocument>
}

function stringToArrayBuffer(input: string): ArrayBuffer {
  const nodeBuffer = Buffer.from(input, 'utf-8')
  const arrayBuffer = new ArrayBuffer(nodeBuffer.length)
  new Uint8Array(arrayBuffer).set(nodeBuffer)
  return arrayBuffer
}

function createTextContent(): TextContent {
  const items: TextItem[] = [
    {
      str: 'Hello',
      dir: 'ltr',
      transform: [1, 0, 0, 1, 10, 20],
      height: 12,
      width: 30,
      fontName: 'F1',
      hasEOL: true
    },
    {
      str: 'مرحبا',
      dir: 'rtl',
      transform: [1, 0, 0, 1, 40, 50],
      height: 10,
      width: 25,
      fontName: 'F2',
      hasEOL: false
    }
  ]

  return {
    items,
    styles: {
      F1: { ascent: 9, descent: -3, fontFamily: 'Arial' },
      F2: { ascent: 8, descent: -2, fontFamily: 'Noto Sans Arabic' }
    }
  }
}

describe('PdfParser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('可以将 PDF 页面的文字与尺寸转为中间结构', async () => {
    const textContent = createTextContent()
    const mockPage: PDFPageProxy = {
      getViewport: jest.fn().mockReturnValue({ width: 600, height: 800 }),
      getTextContent: jest.fn().mockResolvedValue(textContent),
      render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
      cleanup: jest.fn()
      // 其他字段在测试中不需要
    } as unknown as PDFPageProxy

    const mockPdf: PDFDocumentProxy = {
      numPages: 1,
      getPage: jest.fn().mockResolvedValue(mockPage),
      getMetadata: jest
        .fn()
        .mockResolvedValue({ info: { Title: '示例 PDF' } }),
      fingerprints: ['mock-fingerprint'],
      getOutline: jest.fn().mockResolvedValue([])
    } as unknown as PDFDocumentProxy

    getDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) })

    const buffer = stringToArrayBuffer('fake-pdf-binary')
    const doc = await PdfParser.encode(buffer)

    expect(getDocument).toHaveBeenCalledTimes(1)
    const [[firstArg]] = getDocument.mock.calls
    expect(firstArg.data).toBeInstanceOf(Uint8Array)

    expect(doc?.id).toBe('mock-fingerprint')
    expect(doc?.title).toBe('示例 PDF')

    const pages = await doc!.pages
    expect(pages).toHaveLength(1)

    const [page] = pages
    expect(page.id).toBe('mock-fingerprint-page-1')
    expect(page.number).toBe(1)
    expect(page.width).toBe(600)
    expect(page.height).toBe(800)
    expect(page.texts).toHaveLength(2)

    const [firstText, secondText] = page.texts
    expect(firstText.content).toBe('Hello')
    expect(firstText.dir).toBe(TextDir.LTR)
    expect(firstText.x).toBe(10)
    expect(firstText.y).toBe(20)
    expect(firstText.fontFamily).toBe('Arial')
    expect(firstText.fontSize).toBe(12)
    expect(firstText.isEOL).toBe(true)

    expect(secondText.content).toBe('مرحبا')
    expect(secondText.dir).toBe(TextDir.RTL)
    expect(secondText.fontFamily).toBe('Noto Sans Arabic')
    expect(secondText.isEOL).toBe(false)

    // 验证通过 pageId 也能拿到页实例（缓存函数正常工作）
    const pageGetter = doc!.getPageById('mock-fingerprint-page-1')
    const lazyPage = await pageGetter?.()
    expect(lazyPage?.number).toBe(1)
  })

  it('可以解析包含页码跳转与外链的 PDF 大纲', async () => {
    const textContent = createTextContent()
    const mockPage: PDFPageProxy = {
      getViewport: jest.fn().mockReturnValue({ width: 400, height: 300 }),
      getTextContent: jest.fn().mockResolvedValue(textContent),
      render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
      cleanup: jest.fn()
    } as unknown as PDFPageProxy

    const pageRef = { num: 0 }
    const mockPdf: PDFDocumentProxy = {
      numPages: 1,
      getPage: jest.fn().mockResolvedValue(mockPage),
      getMetadata: jest.fn().mockResolvedValue({ info: { Title: '' } }),
      fingerprints: ['outline-fp'],
      getOutline: jest.fn().mockResolvedValue([
        {
          title: '跳转到第一页',
          dest: 'p1-dest',
          items: [
            {
              title: '外部链接',
              url: 'https://example.com',
              unsafeUrl: 'https://example.com',
              newWindow: true,
              items: []
            }
          ]
        }
      ]),
      getDestination: jest.fn().mockResolvedValue([pageRef]),
      getPageIndex: jest.fn().mockResolvedValue(0)
    } as unknown as PDFDocumentProxy

    getDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) })

    const doc = await PdfParser.encode(stringToArrayBuffer('pdf-with-outline'))
    expect(doc).toBeDefined()

    const outline = doc!.getOutline()
    expect(outline).toBeDefined()
    expect(outline).toHaveLength(1)

    const [first] = outline!
    expect(first.content).toBe('跳转到第一页')
    expect(first.dest.targetType).toBe(IntermediateOutlineDestType.PAGE)
    expect((first.dest as IntermediateOutlineDestPage).pageId).toBe(
      'outline-fp-page-1'
    )

    const childDest = first.dest.items?.[0]
    expect(childDest?.targetType).toBe(IntermediateOutlineDestType.URL)
    expect((childDest as IntermediateOutlineDestUrl).url).toBe(
      'https://example.com'
    )
  })
})
