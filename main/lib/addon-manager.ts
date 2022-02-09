import type { Dirent } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { computed, shallowRef, unref } from '@vue/reactivity'
import { ipcMain } from 'electron'
import { provideIPC } from '../utils/compositions'
import { userData } from '../utils/directory'
import { useEnabledAddons } from './settings'

interface AddonInfo {
  entry: string,
  manifest: any,
  type: 'builtin' | 'user',
}

const discoveredAddonsRef = shallowRef<Record<string, AddonInfo>>({})

function useDiscoveredAddons() {
  return discoveredAddonsRef
}

async function discoverAddons() {
  const paths = [
    { type: 'user' as const, base: userData.file('addons') },
    { type: 'builtin' as const, base: path.join(__dirname, '../../addons') },
  ]
  const result: Record<string, AddonInfo> = {}
  for (const { type, base } of paths) {
    let dirents: Dirent[] = []
    try {
      dirents = await fs.promises.readdir(base, { withFileTypes: true })
    } catch {
      // ignore
    }
    const directories = dirents
      .filter(dirent => dirent.isDirectory() || path.extname(dirent.name) === '.asar')
      .map(dirent => dirent.name)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      .filter(name => !result[name])
    for (const file of directories) {
      try {
        const entry = path.join(base, file)
        const manifest = require(path.join(entry, 'package.json'))
        const name = path.basename(file, '.asar')
        result[name] = { type, entry, manifest }
      } catch {
        // continue
      }
    }
  }
  discoveredAddonsRef.value = result
}

const enabledAddonsRef = useEnabledAddons()
const addonsRef = computed(() => {
  const discoveredAddons = unref(discoveredAddonsRef)
  const enabledAddons = unref(enabledAddonsRef)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return enabledAddons.filter(item => discoveredAddons[item])
})

function useAddons() {
  return addonsRef
}

function handleAddonMessages() {
  provideIPC('discovered-addons', discoveredAddonsRef)
  provideIPC('addons', addonsRef)
  ipcMain.handle('refresh-addons', () => {
    discoverAddons()
  })
  ipcMain.handle('get-addon-info', (event, name: string) => {
    const discoveredAddons = unref(discoveredAddonsRef)
    event.returnValue = discoveredAddons[name]
  })
  discoverAddons()
}

export {
  useDiscoveredAddons,
  discoverAddons,
  useAddons,
  handleAddonMessages,
}
