import * as fs from 'fs'
import * as path from 'path'
import { customRef, effect } from '@vue/reactivity'
import { app } from 'electron'
import * as JSON5 from 'json5'
import debounce from 'lodash/debounce'
import { downloadFile } from './net'
import { Writer } from './writer'

class Directory {

  declare path: string

  constructor(dir: string) {
    this.path = dir
  }

  file(basename: string) {
    return path.resolve(this.path, basename)
  }

  async ensure(basename: string) {
    const file = this.file(basename)
    try {
      await fs.promises.mkdir(path.dirname(file))
    } catch {
      // ignore error
    }
  }

  async read(basename: string) {
    try {
      const content = await fs.promises.readFile(this.file(basename))
      return content.toString()
    } catch {
      return null
    }
  }

  async write(basename: string, content: string) {
    await this.ensure(basename)
    const file = this.file(basename)
    return fs.promises.writeFile(file, content + '\n')
  }

  async load<T>(basename: string) {
    try {
      const content = await this.read(basename)
      if (!content) return null
      return JSON5.parse(content) as T
    } catch {
      return null
    }
  }

  save(basename: string, data: any) {
    return this.write(basename, JSON.stringify(data, null, 2))
  }

  watch(basename: string, updater: (event: string, filename: string) => void) {
    // `chokidar` is too large; `gaze` seems to be OK. Use native currently.
    try {
      return fs.watch(this.file(basename), debounce(updater, 500))
    } catch {
      return null
    }
  }

  async entries(basename?: string) {
    return fs.promises.readdir(basename ? this.file(basename) : this.path)
  }

  require<T>(basename: string) {
    const file = this.file(basename)
    try {
      return __non_webpack_require__(file) as T
    } catch {
      return null
    }
  }

  async download<T>(basename: string, url: string, force?: boolean) {
    if (!force) {
      const data = await this.load<T>(basename)
      if (data) return data
    }
    await this.ensure(basename)
    const file = this.file(basename)
    await downloadFile(url, file)
    return this.load(basename) as Promise<T>
  }

  async fetch<T>(basename: string) {
    const source = await this.read(basename)
    if (!source) return null
    const writer = new Writer(source)
    try {
      const data: T = JSON5.parse(source)
      return { writer, data }
    } catch {
      return null
    }
  }

  update(basename: string, { writer, data }: { writer?: Writer, data: any }) {
    if (writer) {
      writer.write(data)
      return this.write(basename, writer.toSource())
    } else {
      return this.save(basename, data)
    }
  }

  use<T>(basename: string, defaultValue: T, afterTriggered?: () => void) {
    return customRef<T>((track, trigger) => {
      let data = defaultValue
      let writer: Writer | undefined
      const reactiveEffect = effect(async () => {
        const result = await this.fetch<T>(basename)
        if (result) {
          data = result.data
          writer = result.writer
        } else {
          // file deleted for example
          data = defaultValue
          writer = undefined
        }
        trigger()
        if (afterTriggered) afterTriggered()
      })
      this.watch(basename, () => {
        reactiveEffect()
      })
      return {
        get: () => {
          track()
          return data
        },
        set: value => {
          this.update(basename, {
            data: value,
            writer,
          })
        },
      }
    })
  }

}

const rootDir = path.join(__dirname, '../../')

const userDataDir = app.isPackaged
  ? app.getPath('userData') : path.join(rootDir, 'userdata/')
const resourcesDir = path.join(rootDir, 'resources/')

const userData = new Directory(userDataDir)
const resources = new Directory(resourcesDir)

export {
  Directory,
  rootDir,
  userData,
  resources,
}
