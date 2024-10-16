import { ipcRenderer } from '@commas/electron-ipc'
import { openURL } from './shell'

const webContentsViews = $ref<RendererWebContentsView[]>([])
export function useWebContentsViews() {
  return $$(webContentsViews)
}

export class RendererWebContentsView {

  id: number
  url?: string
  title?: string
  icon?: string
  loading?: boolean
  canGoBack?: boolean

  constructor(id: number) {
    this.id = id
  }

  static async create(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    const borderRadius = getComputedStyle(element).getPropertyValue('border-radius')
    const id = await ipcRenderer.invoke('create-web-contents', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      borderRadius: parseInt(borderRadius, 10) || 0,
    })
    const view = new RendererWebContentsView(id)
    webContentsViews.push(view)
    return view
  }

  async navigate(url: string) {
    if (url === this.url) return
    this.url = url
    return ipcRenderer.invoke('navigate-web-contents', this.id, url)
  }

  resize(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    return ipcRenderer.invoke('resize-web-contents', this.id, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    })
  }

  goToOffset(offset: number) {
    return ipcRenderer.invoke('go-to-offset-web-contents', this.id, offset)
  }

  destroy() {
    const index = webContentsViews.indexOf(this)
    if (index !== -1) {
      webContentsViews.splice(index, 1)
    }
    return ipcRenderer.invoke('destroy-web-contents', this.id)
  }

}

export function handleWebContentsMessages() {
  ipcRenderer.on('view-title-updated', (event, id, title) => {
    const view = webContentsViews.find(item => item.id === id)
    if (!view) return
    view.title = title
  })
  ipcRenderer.on('view-icon-updated', (event, id, icon) => {
    const view = webContentsViews.find(item => item.id === id)
    if (!view) return
    view.icon = icon
  })
  ipcRenderer.on('view-url-updated', (event, id, url, canGoBack) => {
    const view = webContentsViews.find(item => item.id === id)
    if (!view) return
    view.url = url
    view.canGoBack = canGoBack
  })
  ipcRenderer.on('view-loading-updated', (event, id, loading) => {
    const view = webContentsViews.find(item => item.id === id)
    if (!view) return
    view.loading = loading
  })
  ipcRenderer.on('view-open-url', (event, url) => {
    openURL(url)
  })
}
