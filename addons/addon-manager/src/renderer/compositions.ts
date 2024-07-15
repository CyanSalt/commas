import type { AddonInfo } from '@commas/types/addon'
import * as commas from 'commas:api/renderer'

const discoveredAddons = $(commas.ipcRenderer.inject<AddonInfo[]>('discovered-addons', []))

export function useDiscoveredAddons() {
  return $$(discoveredAddons)
}
