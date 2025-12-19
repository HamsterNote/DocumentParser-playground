import React from 'react'
import { HamsterDocument, HamsterPage } from '@DocumentParser'
import { HamsterPageComponent } from '@src/components/Page'
import { Number2 } from '@math'

interface Props {
  doc: HamsterDocument
}

interface PageWithSize {
  page: HamsterPage
  size: Number2
}

interface State {
  pagesWithSize: PageWithSize[]
}

export class HamsterDocumentComponent extends React.Component<Props, State> {
  state: State = {
    pagesWithSize: []
  }
  componentDidMount() {
    this.getPages()
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.doc !== prevProps.doc) {
      this.getPages()
    }
  }

  async getPages() {
    const pages = await this.props.doc.getPages()
    const scale = 1

    // 预先获取每个页面的尺寸
    const pagesWithSize = pages.map((page) => ({
      page,
      size: page.getSize(scale)
    }))

    this.setState({
      pagesWithSize
    })
  }

  render() {
    console.log(this.state.pagesWithSize)
    return (
      <div className='hamster-document'>
        {this.state.pagesWithSize.map(({ page, size }) => {
          return (
            <HamsterPageComponent
              key={page.getNumber()}
              page={page}
              scale={1}
              initialSize={size}
            />
          )
        })}
      </div>
    )
  }
}
