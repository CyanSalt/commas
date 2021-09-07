import { ipcRenderer } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'
import { memoize } from 'lodash-es'

export const getAppVersion = memoize(() => {
  return ipcRenderer.invoke('get-app-version')
})

export function openContextMenu(
  template: MenuItemConstructorOptions[],
  position: [number, number] | MouseEvent,
  defaultIndex = -1,
): Promise<void> {
  const coords = Array.isArray(position)
    ? { x: position[0], y: position[1] }
    : { x: position.clientX, y: position.clientY }
  return ipcRenderer.invoke('contextmenu', template, {
    positioningItem: defaultIndex,
    ...coords,
  })
}
