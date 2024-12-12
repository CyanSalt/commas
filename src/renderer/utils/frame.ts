import { ipcRenderer } from '@commas/electron-ipc'
import type { MenuItem } from '@commas/types/menu'

function flattenContextMenu(template: (MenuItem | MenuItem[])[]) {
  let groups: MenuItem[][] = []
  let ungrouped = template
  while (ungrouped.length) {
    const targetIndex = ungrouped.findIndex(item => Array.isArray(item))
    if (targetIndex === -1) {
      groups.push(ungrouped as MenuItem[])
      ungrouped = []
    } else if (targetIndex === 0) {
      groups.push(ungrouped[0] as MenuItem[])
      ungrouped = ungrouped.slice(1)
    } else {
      groups.push(
        ungrouped.slice(0, targetIndex) as MenuItem[],
        ungrouped[targetIndex] as MenuItem[],
      )
      ungrouped = ungrouped.slice(targetIndex + 1)
    }
  }
  return groups.reduce((items, group) => {
    if (!group.length) return items
    return items.length
      ? [...items, { type: 'separator' }, ...group]
      : group
  }, [])
}

export function openContextMenu(
  template: (MenuItem | MenuItem[])[],
  position: [number, number] | MouseEvent,
  defaultIndex = -1,
) {
  const items = flattenContextMenu(template)
  if (!items.length) return
  const coords = Array.isArray(position)
    ? { x: position[0], y: position[1] }
    : { x: position.clientX, y: position.clientY }
  return ipcRenderer.invoke('contextmenu', items, {
    positioningItem: defaultIndex,
    ...coords,
  })
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
          command: 'global-main:look-up',
          args: [text.length > 50 ? text.slice(0, 50) + '...' : text],
        },
      ]
    }
  }
  const editingItems: MenuItem[] = [
    {
      label: process.platform === 'darwin'
        ? 'Copy#!menu.copy.darwin'
        : 'Copy#!menu.copy',
      role: 'copy',
    },
    {
      label: 'Paste#!menu.paste',
      role: 'paste',
    },
  ]
  return {
    definitionItems,
    editingItems,
  }
}
