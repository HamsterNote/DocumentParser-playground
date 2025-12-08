import React from 'react'
import { HamsterDocument, HamsterPage } from '@DocumentParser'
import { HamsterPageComponent } from '@src/components/Page'

interface Props {
  doc: HamsterDocument
}

interface State {
  pages: HamsterPage[]
}

export class HamsterDocumentComponent extends React.Component<Props, State> {
  state: State = {
    pages: []
  }
  componentDidMount() {
    this.getPages()
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.doc !== prevProps.doc) {
      this.getPages()
    }
  }

  getPages() {
    this.props.doc.getPages().then((pages) => {
      this.setState({
        pages
      })
    })
  }

  render() {
    console.log(this.state.pages)
    return this.state.pages.map((page) => {
      return (
        <HamsterPageComponent key={page.getNumber()} page={page} scale={1} />
      )
    })
  }
}
