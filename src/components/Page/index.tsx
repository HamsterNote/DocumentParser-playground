import React from 'react'
import { HamsterPage, RenderViews } from '@DocumentParser'
import './index.css'
import { Number2 } from '@math'

interface Props {
  page: HamsterPage
  scale: number
  initialSize: Number2
}

export class HamsterPageComponent extends React.Component<Props> {
  private containerRef = React.createRef<HTMLDivElement>()
  private observer?: IntersectionObserver
  private hasRendered = false

  renderPage() {
    const el = this.containerRef.current
    if (!el) return
    console.log('renderPage', this.props.page.getNumber())
    this.hasRendered = true
    // 使用 page.render 渲染到容器元素
    this.props.page
      .render(el, {
        scale: this.props.scale,
        views: [RenderViews.TEXT, RenderViews.THUMBNAIL]
      })
      .catch(() => {
        // 渲染失败时允许再次尝试
        this.hasRendered = false
      })
  }

  componentDidMount() {
    const el = this.containerRef.current
    if (!el) return

    // 仅当元素进入视口（与页面有交集）时触发渲染
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.hasRendered) {
            this.renderPage()
            break
          }
        }
      },
      { root: null, threshold: 0 }
    )

    this.observer.observe(el)
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
  }

  render() {
    const { initialSize } = this.props
    return (
      <div
        ref={this.containerRef}
        className='hamster-page'
        style={{ width: initialSize.x, height: initialSize.y }}
      />
    )
  }
}
