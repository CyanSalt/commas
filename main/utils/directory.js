const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const http = require('http')
const https = require('https')
const JSON5 = require('json5')
const debounce = require('lodash/debounce')
const Writer = require('./writer')

/**
 * @typedef {import('./writer').default} Writer
 */

class Directory {
  /**
   * @param {string} path
   */
  constructor(path) {
    this.path = path
  }
  /**
   * @param {string} basename
   */
  file(basename) {
    return path.resolve(this.path, basename)
  }
  /**
   * @param {string} basename
   */
  async read(basename) {
    try {
      const content = await fs.promises.readFile(this.file(basename))
      return content.toString()
    } catch {
      return null
    }
  }
  /**
   * @param {string} basename
   * @param {string} content
   */
  async write(basename, content) {
    const file = this.file(basename)
    try {
      await fs.promises.mkdir(path.dirname(file))
    } catch {
      // ignore error
    }
    return fs.promises.writeFile(file, content)
  }
  /**
   * @param {string} basename
   */
  async load(basename) {
    try {
      return JSON5.parse(await this.read(basename))
    } catch {
      return null
    }
  }
  /**
   * @param {string} basename
   * @param {any} data
   */
  save(basename, data) {
    return this.write(basename, JSON.stringify(data, null, 2))
  }
  /**
   * @param {string} basename
   * @param {(event: string, filename: string) => void} updater
   */
  watch(basename, updater) {
    // `chokidar` is too large; `gaze` seems to be OK. Use native currently.
    try {
      return fs.watch(this.file(basename), debounce(updater, 500))
    } catch {
      return null
    }
  }
  /**
   * @param {string} basename
   */
  require(basename) {
    const file = this.file(basename)
    try {
      return require(file)
    } catch {
      return null
    }
  }
  /**
   * @param {string} basename
   * @param {string} url
   * @param {boolean} [force]
   */
  async download(basename, url, force) {
    if (!force) {
      const data = await this.load(basename)
      if (data) return data
    }
    const file = this.file(basename)
    const stream = fs.createWriteStream(file)
    const client = new URL(url).protocol === 'https:' ? https : http
    await new Promise((resolve, reject) => {
      const request = client.get(url, response => {
        response.pipe(stream)
        stream.on('finish', () => {
          stream.close(resolve)
        })
      })
      request.on('error', async error => {
        if (!force) {
          try {
            await fs.promises.unlink(file)
          } catch {
            // ignore error
          }
        }
        reject(error)
      })
    })
    return this.load(basename)
  }
  /**
   * @param {string} basename
   */
  async fetch(basename) {
    const source = await this.read(basename)
    if (!source) return null
    const writer = new Writer(source)
    try {
      const data = JSON5.parse(source)
      return { writer, data }
    } catch {
      return null
    }
  }
  /**
   * @param {string} basename
   * @param {{writer?: Writer, data: any}} context
   */
  update(basename, { writer, data }) {
    if (writer) {
      writer.write(data)
      return this.write(basename, writer.toSource())
    } else {
      return this.save(basename, data)
    }
  }
}

const rootDir = path.join(__dirname, '../../')

const userDataDir = app.isPackaged
  ? app.getPath('userData') : path.join(rootDir, 'userdata/')
const resourcesDir = path.join(rootDir, 'resources/')

const userData = new Directory(userDataDir)
const resources = new Directory(resourcesDir)

module.exports = {
  Directory,
  rootDir,
  userData,
  resources,
}
