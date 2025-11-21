import * as commas from 'commas:api/renderer'

const discoveredAddons = $(commas.ipcRenderer.inject('discovered-addons', []))

export function useDiscoveredAddons() {
  return $$(discoveredAddons)
}
