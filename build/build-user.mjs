import dotenv from 'dotenv'
import buildAddonMain from './atomics/build-addon-main.mjs'
import buildAddonRenderer from './atomics/build-addon-renderer.mjs'
import getAddons from './utils/get-addons.mjs'
import getVersions from './utils/get-versions.mjs'

dotenv.config()

getVersions().then(versions => Promise.all([
  getAddons('userdata/addons').then(dirs => Promise.all(dirs.flatMap(dir => [
    buildAddonMain(versions, dir, true),
    buildAddonRenderer(versions, dir, true),
  ]))),
]))
