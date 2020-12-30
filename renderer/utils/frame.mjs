import { ipcRenderer } from 'electron'

/**
 * @typedef {import('electron').MenuItemConstructorOptions} MenuItemConstructorOptions
 */

/**
 * @param {MenuItemConstructorOptions[]} template
 * @param {[number, number] | MouseEvent} position
 */
export function openContextMenu(template, position, defaultIndex = -1) {
  const coords = Array.isArray(position)
    ? { x: position[0], y: position[1] }
    : { x: position.clientX, y: position.clientY }
  return ipcRenderer.invoke('contextmenu', template, {
    positioningItem: defaultIndex,
    ...coords,
  })
}
