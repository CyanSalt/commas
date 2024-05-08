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

function getNodePackageCommands(pkg: any, files: string[]) {
  const packageManager = getNodePackageManager(pkg, files)
  const scripts: Record<string, string> = pkg.scripts ?? {}
  const builtinScripts = ['pack', 'rebuild', 'start', 'test']
  return Object.fromEntries(
    Object.keys(scripts).map(name => [
      name,
      `${packageManager}${packageManager === 'npm' && !builtinScripts.includes(name) ? ' run' : ''} ${name}`,
    ]),
  )
}

async function generateScripts(entry: string): Promise<LauncherInfo[]> {
  const info = await fs.promises.stat(entry)
  const directory = info.isDirectory() ? entry : path.dirname(entry)
  const files = await fs.promises.readdir(directory)
  if (info.isDirectory()) {
    if (files.includes('package.json')) {
      return generateScripts(path.join(entry, 'package.json'))
    }
  }
  const parsed = path.parse(entry)
  if (parsed.base === 'package.json') {
    const data = await readJSONFile(entry)
    const commands = getNodePackageCommands(data, files)
    return Object.entries(commands).map(([name, command]) => ({ name, command }))
  }
  return []
}

async function createLauncher(data: Pick<LauncherInfo, 'name' | 'command' | 'directory'>) {
  const launcher: LauncherInfo = { ...data }
  const directory = launcher.directory
  if (directory) {
    const homedir = os.homedir()
    const isUserPath = process.platform !== 'win32' && directory.startsWith(homedir + path.sep)
    if (isUserPath) {
      launcher.directory = '~' + directory.slice(homedir.length)
    }
    const scripts = await generateScripts(directory)
    if (scripts.length) {
      launcher.scripts = scripts
    }
  }
  return launcher
}

export {
  createLauncher,
}
