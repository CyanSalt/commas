import type { Dirent } from 'fs'
import * as fs from 'fs'
import * as path from 'path'
import { shallowRef } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { uniq } from 'lodash'
import type { AddonInfo } from '../../../../src/typings/addon'

const discoveredAddonsRef = shallowRef<AddonInfo[]>([])

function useDiscoveredAddons() {
  return discoveredAddonsRef
}

async function discoverAddons() {
  const paths = commas.file.getAddonPaths()
  let entries: Dirent[] = []
  for (const { base } of paths) {
    try {
      const dirents = await fs.promises.readdir(base, { withFileTypes: true })
      entries = entries.concat(dirents)
    } catch {
      // ignore
    }
  }
  const names = entries
    .filter(dirent => dirent.isDirectory() || path.extname(dirent.name) === '.asar')
    .map(dirent => path.basename(dirent.name, '.asar'))
  const result = uniq(names)
    .map(name => commas.file.resolveAddon(name))
    .filter((item): item is AddonInfo => Boolean(item))
  discoveredAddonsRef.value = result
}

export {
  useDiscoveredAddons,
  discoverAddons,
}
