import { ipcRenderer } from '@commas/electron-ipc'
import type { MenuItem } from '@commas/types/menu'

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

export function withContextMenuSeparator(previousItems: MenuItem[], nextItems: MenuItem[]) {
  if (!previousItems.length && !nextItems.length) return []
  return [...previousItems, { type: 'separator' as const }, ...nextItems]
}

export function createContextMenu() {
  let definitionItems: MenuItem[] = []
  if (process.platform === 'darwin') {
    const selection = getSelection()
    const text = selection ? selection.toString() : ''
    if (text) {
      definitionItems = [
        {
          label: 'Look Up "${0}"#!menu.lookup',
          command: 'global:look-up',
          args: [text],
        },
      ]
    }
  }
  const editingItems: MenuItem[] = [
    {
      label: 'Copy#!menu.copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy',
    },
    {
      label: 'Paste#!menu.paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste',
    },
  ]
  return {
    definitionItems,
    editingItems,
  }
}
