import { getAddonPaths, resolveAddon } from '../../src/main/lib/addon'
import { useFile, useJSONFile, useYAMLFile } from '../../src/main/utils/compositions'
import { userFile } from '../../src/main/utils/directory'
import { readFile, writeFile } from '../../src/main/utils/file'

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
