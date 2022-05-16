import { ipcRenderer } from 'electron'
import type { MenuItem } from '../../../typings/menu'

export function openContextMenu(
  template: MenuItem[],
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
