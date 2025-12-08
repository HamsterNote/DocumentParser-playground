import React from 'react'
import { HamsterPage, RenderViews } from '@DocumentParser'
import './index.css'
import { Number2 } from '@math'

interface Props {
  page: HamsterPage
  scale: number
}

interface State {
  size: Number2 | undefined
}

export class HamsterPageComponent extends React.Component<Props, State> {
  private containerRef = React.createRef<HTMLDivElement>()
  private observer?: IntersectionObserver
  private hasRendered = false
  state: State = {
    size: undefined
  }

  renderPage() {
    const el = this.containerRef.current
    if (!el) return
    console.log('renderPage')
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
    // // 渲染触发后即可取消监听，避免重复调用
    // if (this.observer) {
    // 	this.observer.unobserve(entry.target);
    // 	this.observer.disconnect();
    // 	this.observer = undefined;
    // }
  }

  componentDidMount() {
    const el = this.containerRef.current
    if (!el) return
    this.setState({
      size: this.props.page.getSize(this.props.scale)
    })

    // 仅当元素进入视口（与页面有交集）时触发渲染
    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.state.size) {
          for (const entry of entries) {
            if (entry.isIntersecting && !this.hasRendered) {
              this.renderPage()
              break
            }
          }
        }
      },
      { root: null, threshold: 0 }
    )

    this.observer.observe(el)
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (this.state.size && this.state.size !== prevState.size) {
      const el = this.containerRef.current
      if (el) {
        // 主动判断是否在视口中
        const rect = el.getBoundingClientRect()
        if (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        ) {
          this.renderPage()
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
  }

  render() {
    return (
      <div
        ref={this.containerRef}
        className='hamster-page'
        style={{ width: this.state.size?.x, height: this.state.size?.y }}
      />
    )
  }
}
