import { getAddonPaths, resolveAddon } from '../../main/lib/addon'
import { useFile, useJSONFile, useYAMLFile } from '../../main/utils/compositions'
import { userFile } from '../../main/utils/directory'
import { readFile, writeFile } from '../../main/utils/file'

export * from '../shim'

export {
  userFile,
  readFile,
  writeFile,
  useFile,
  useJSONFile,
  useYAMLFile,
  getAddonPaths,
  resolveAddon,
}
