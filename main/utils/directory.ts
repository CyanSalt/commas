import * as fs from 'fs'
import * as path from 'path'
import { customRef, effect } from '@vue/reactivity'
import chokidar from 'chokidar'
import { app } from 'electron'
import debounce from 'lodash/debounce'
import YAML from 'yaml'
import { downloadFile } from './net'
import { updateDocument } from './yaml-updater'

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

  watch(basename: string, updater: (event: string, filename: string) => void) {
    const watcher = chokidar.watch(this.file(basename))
    try {
      return watcher.on('all', debounce(updater, 500))
    } catch {
      return null
    }
  }

  require<T>(basename: string) {
    const file = this.file(basename)
    try {
      return require(file) as T
    } catch {
      return null
    }
  }

  async download(basename: string, url: string, force?: boolean) {
    if (!force) {
      const data = await this.read(basename)
      if (data) return data
    }
    await this.ensure(basename)
    const file = this.file(basename)
    await downloadFile(url, file)
    return this.read(basename)
  }

  async loadYAML<T>(basename: string) {
    try {
      const content = await this.read(basename)
      if (!content) return null
      return YAML.parse(content) as T
    } catch {
      return null
    }
  }

  async updateYAML(basename: string, data: any) {
    const content = await this.read(basename)
    if (!content) {
      const created = YAML.stringify(data)
      return this.write(basename, '---\n' + created.trim() + '\n')
    } else {
      const updated = updateDocument(content, data)
      return this.write(basename, updated.trim() + '\n')
    }
  }

  useYAML<T>(basename: string, defaultValue: T, afterTriggered?: () => void) {
    return customRef<T>((track, trigger) => {
      let data = defaultValue
      const reactiveEffect = effect(async () => {
        const result = await this.loadYAML<T>(basename)
        if (result) {
          data = result
        } else {
          // file deleted for example
          data = defaultValue
        }
        trigger()
        if (afterTriggered) {
          afterTriggered()
        }
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
          this.updateYAML(basename, value)
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
