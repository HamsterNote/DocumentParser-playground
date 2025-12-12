import React, { useState } from 'react'
import { HamsterDocument, parse } from '@DocumentParser'
import { HamsterDocumentComponent } from '@src/components/Document'
import { HtmlParser } from './parser/HtmlParser'

export default function App() {
  const [doc] = useState<HamsterDocument>()
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    parse(file)?.then(async (res) => {
      if (res) {
        HtmlParser.decodeToHtml(res).then((html) => {
          const wrap = document.createElement('div')
          wrap.innerHTML = html
          document.body.append(wrap)
        })
      }
      console.log(await res?.getPageByPageNumber(7)?.())
      // setDoc(res)
    })
  }
  return (
    <div className='app'>
      <h1>DocumentParser Playground</h1>
      <p>
        技术栈：React + TypeScript + Vite。开发服务器端口：<code>6673</code>
      </p>
      <input type='file' onChange={(e) => onUpload(e)} placeholder='file' />
      {doc && <HamsterDocumentComponent doc={doc} />}
    </div>
  )
}
