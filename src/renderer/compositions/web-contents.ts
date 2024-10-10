import { ipcRenderer } from '@commas/electron-ipc'
import { globalHandler } from '../../shared/handler'

export interface RendererWebContentsView {
  id: number,
  url?: string,
  title?: string,
  icon?: string,
  loading?: boolean,
}

const webContentsViews = $ref<RendererWebContentsView[]>([])
export function useWebContentsViews() {
  return $$(webContentsViews)
}

export async function createWebContents(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const id = await ipcRenderer.invoke('create-web-contents', {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  })
  const view: RendererWebContentsView = { id }
  webContentsViews.push(view)
  return view
}

export function destroyWebContents(id: number) {
  const index = webContentsViews.findIndex(item => item.id === id)
  if (index !== -1) {
    webContentsViews.splice(index, 1)
  }
  return ipcRenderer.invoke('destroy-web-contents', id)
}

export function navigateWebContents(id: number, url: string) {
  const view = webContentsViews.find(item => item.id === id)
  if (view) {
    view.url = url
  }
  return ipcRenderer.invoke('navigate-web-contents', id, url)
}

export function resizeWebContents(id: number, element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return ipcRenderer.invoke('resize-web-contents', id, {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  })
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
  ipcRenderer.on('view-url-updated', (event, id, url) => {
    const view = webContentsViews.find(item => item.id === id)
    if (!view) return
    view.url = url
  })
  ipcRenderer.on('view-open-url', (event, url) => {
    globalHandler.invoke('global-renderer:open-url', url)
  })
}
