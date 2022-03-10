import * as commas from 'commas:api/renderer'
import type { AddonInfo } from '../../../../typings/addon'

const discoveredAddons = $(commas.ipcRenderer.inject<AddonInfo[]>('discovered-addons', []))

export function useDiscoveredAddons() {
  return $$(discoveredAddons)
}
