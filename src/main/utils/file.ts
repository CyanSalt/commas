import * as fs from 'fs'
import * as path from 'path'
import chokidar from 'chokidar'
import { debounce, trimEnd } from 'lodash'
import YAML from 'yaml'
import { requestFile } from './net'
import { updateDocument } from './yaml-updater'

async function ensureFile(file: string) {
  try {
    await fs.promises.mkdir(path.dirname(file))
  } catch {
    // ignore error
  }
}

async function readFile(file: string) {
  try {
    return await fs.promises.readFile(file, 'utf8')
  } catch {
    return undefined
  }
}

async function writeFile(file: string, content: string | undefined) {
  if (typeof content === 'undefined') {
    return fs.promises.rm(file)
  }
  try {
    await ensureFile(file)
  } catch {
    // ignore error
  }
  return fs.promises.writeFile(file, trimEnd(content) + '\n')
}

function watchFile(file: string, callback: (event: string, filename: string) => void) {
  const watcher = chokidar.watch(file)
  try {
    return watcher.on('all', debounce(callback, 500))
  } catch {
    return null
  }
}

async function writeYAMLFile(file: string, data: any) {
  const content = await readFile(file)
  if (!content) {
    const created = YAML.stringify(data)
    return writeFile(file, '---\n' + created.trim() + '\n')
  } else {
    const updated = updateDocument(content, data)
    return writeFile(file, updated.trim() + '\n')
  }
}

async function downloadFile(file: string, url: string) {
  await ensureFile(file)
  await requestFile(url, file)
  return readFile(file)
}

export {
  ensureFile,
  readFile,
  writeFile,
  watchFile,
  writeYAMLFile,
  downloadFile,
}
