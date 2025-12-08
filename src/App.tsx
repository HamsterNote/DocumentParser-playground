import React, { useState } from 'react'
import { HamsterDocument, parse } from '@DocumentParser'
import { HamsterDocumentComponent } from '@src/components/Document'

export default function App() {
  const [doc, setDoc] = useState<HamsterDocument>()
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    parse(file)?.then(async (res) => {
      console.log(await res?.getPage(1))
      setDoc(res)
    })
  }
  return (
    <div className='app'>
      <h1>DocumentParser Playground</h1>
      <p>
        技术栈：React + TypeScript + Vite。开发服务器端口：<code>6673</code>
      </p>
      <input type='file' onChange={(e) => onUpload(e)} />
      {doc && <HamsterDocumentComponent doc={doc} />}
    </div>
  )
}
