import { ipcRenderer } from 'electron'

/**
 * @typedef {import('electron').MenuItemConstructorOptions} MenuItemConstructorOptions
 */

/**
 * @param {MenuItemConstructorOptions[]} template
 * @param {Event} event
 */
export function openContextMenu(template, event) {
  return ipcRenderer.invoke('contextmenu', template, {
    x: event.clientX,
    y: event.clientY,
  })
}
