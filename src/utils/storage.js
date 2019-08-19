import {readFileSync, watch, promises as fs} from 'fs'
import {dirname, resolve} from 'path'
import {parse} from 'json5'
import {debounce} from 'lodash'
import {assetsDir, userDataDir} from './electron'

export default {
  directory: userDataDir,
  assets() {
    return Object.assign(Object.create(this), {
      directory: assetsDir,
    })
  },
  async load(basename) {
    try {
      return parse(await this.read(basename))
    } catch (err) {
      return null
    }
  },
  loadSync(basename) {
    try {
      return parse(this.readSync(basename))
    } catch (err) {
      return null
    }
  },
  save(basename, data) {
    return this.write(basename, JSON.stringify(data, null, 2))
  },
  async read(basename) {
    try {
      return await fs.readFile(this.filename(basename))
    } catch (err) {
      return null
    }
  },
  async write(basename, content) {
    const filename = this.filename(basename)
    try {
      await fs.mkdir(dirname(filename))
    } catch (err) {
      // ignore error
    }
    return fs.writeFile(filename, content)
  },
  watch(basename, updater) {
    // `chokidar` is too large; `gaze` seems to be OK. Use native currently.
    try {
      return watch(this.filename(basename), debounce(updater, 500))
    } catch (err) {
      return null
    }
  },
  readSync(basename) {
    try {
      return readFileSync(this.filename(basename))
    } catch (err) {
      return null
    }
  },
  require(basename) {
    const filename = this.filename(basename)
    try {
      return global.require(filename)
    } catch (err) {
      return null
    }
  },
  async download(basename, url) {
    try {
      const data = await fetch(url).then(response => response.json())
      await this.save(basename, data)
      return data
    } catch (err) {
      return null
    }
  },
  filename(basename) {
    return resolve(this.directory, basename)
  },
}
