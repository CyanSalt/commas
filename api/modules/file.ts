import { getAddonPaths, resolveAddon } from '../../src/main/lib/addon'
import { useFile, useYAMLFile } from '../../src/main/utils/compositions'
import { userFile } from '../../src/main/utils/directory'

export * from '../shim'

export {
  userFile,
  useFile,
  useYAMLFile,
  getAddonPaths,
  resolveAddon,
}
