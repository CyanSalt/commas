import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import type { LauncherInfo } from '../../typings/launcher'

async function readJSONFile<T = any>(file: string) {
  try {
    const content = await fs.promises.readFile(file, 'utf8')
    return JSON.parse(content) as T
  } catch {
    return undefined
  }
}

export function getNodePackageManager(pkg: any, files: string[]) {
  const supportedManagers = ['npm', 'yarn', 'pnpm']
  // Corepack style
  const packageManager: string | undefined = pkg.packageManager
  if (packageManager) {
    const name = packageManager.match(/^\w+(?=@|$)/)?.[0]
    if (name && supportedManagers.includes(name)) {
      return name
    }
  }
  // Lerna style
  const npmClient: string | undefined = pkg.npmClient
  if (npmClient && supportedManagers.includes(npmClient)) {
    return npmClient
  }
  if (files.includes('yarn.lock')) return 'yarn'
  if (files.includes('pnpm-lock.yaml')) return 'pnpm'
  return 'npm'
}

function getNodePackageCommand(pkg: any, files) {
  const packageManager = getNodePackageManager(pkg, files)
  const scripts: Record<string, string> = pkg.scripts ?? {}
  const builtinScripts = ['pack', 'rebuild', 'start', 'test']
  const runScripts = ['serve', 'build', 'dev']
  const builtinScript = builtinScripts.find(key => scripts[key])
  if (builtinScript) {
    return `${packageManager} ${builtinScript}`
  }
  const runScript = runScripts.find(key => scripts[key])
  if (runScript) {
    return `${packageManager}${packageManager === 'yarn' ? '' : ' run'} ${builtinScript}`
  }
  return `${packageManager}${packageManager === 'yarn' ? '' : ' install'}`
}

async function createLauncher(entry: string): Promise<LauncherInfo> {
  const info = await fs.promises.stat(entry)
  const directory = info.isDirectory() ? entry : path.dirname(entry)
  const files = await fs.promises.readdir(directory)
  const homedir = os.homedir()
  if (info.isDirectory()) {
    if (files.includes('package.json')) {
      return createLauncher(path.join(entry, 'package.json'))
    }
  }
  const parsed = path.parse(entry)
  const isUserPath = process.platform !== 'win32' && parsed.dir.startsWith(homedir + path.sep)
  if (parsed.base === 'package.json') {
    const data = await readJSONFile(entry)
    const command = getNodePackageCommand(data, files)
    return {
      name: data.productName ?? data.name ?? path.basename(parsed.dir),
      command,
      directory: isUserPath
        ? '~' + parsed.dir.slice(homedir.length)
        : parsed.dir,
    }
  }
  return {
    name: path.basename(parsed.dir),
    command: entry,
    directory: isUserPath
      ? os.homedir()
      : parsed.dir,
  }
}

export {
  createLauncher,
}
