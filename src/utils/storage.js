import {readFileSync, watch, promises as fs} from 'fs'
import {dirname, resolve} from 'path'
import {parse} from 'json5'
import {debounce} from 'lodash'
import {assetsDir, userDataDir} from './electron'
import Writer from './writer'

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
    } catch {
      return null
    }
  },
  loadSync(basename) {
    try {
      return parse(this.readSync(basename))
    } catch {
      return null
    }
  },
  save(basename, data) {
    return this.write(basename, JSON.stringify(data, null, 2))
  },
  async read(basename) {
    try {
      return await fs.readFile(this.filename(basename))
    } catch {
      return null
    }
  },
  readSync(basename) {
    try {
      return readFileSync(this.filename(basename))
    } catch {
      return null
    }
  },
  async write(basename, content) {
    const filename = this.filename(basename)
    try {
      await fs.mkdir(dirname(filename))
    } catch {
      // ignore error
    }
    return fs.writeFile(filename, content)
  },
  watch(basename, updater) {
    // `chokidar` is too large; `gaze` seems to be OK. Use native currently.
    try {
      return watch(this.filename(basename), debounce(updater, 500))
    } catch {
      return null
    }
  },
  require(basename) {
    const filename = this.filename(basename)
    try {
      return global.require(filename)
    } catch {
      return null
    }
  },
  // TODO: remove
  async download(basename, url) {
    try {
      const data = await fetch(url).then(response => response.json())
      await this.save(basename, data)
      return data
    } catch {
      return null
    }
  },
  // fetch and update API
  async fetch(name) {
    const source = await this.read(name)
    if (!source) return null
    const writer = new Writer(source)
    try {
      const data = parse(source)
      return {writer, data}
    } catch {
      return null
    }
  },
  update(name, {writer, data}) {
    if (writer) {
      writer.write(data)
      return this.write(name, writer.toSource())
    } else {
      return this.save(name, data)
    }
  },
  filename(basename) {
    return resolve(this.directory, basename)
  },
}
