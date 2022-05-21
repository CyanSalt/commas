import { getAddonPaths, resolveAddon } from '../../src/main/lib/addon'
import { useYAMLFile } from '../../src/main/utils/compositions'
import { userFile } from '../../src/main/utils/directory'

export * from '../shim'

export {
  userFile,
  useYAMLFile,
  getAddonPaths,
  resolveAddon,
}
