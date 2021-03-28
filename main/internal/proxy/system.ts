import { computed, unref } from '@vue/reactivity'
import { useSettings } from '../../lib/settings'
import { execa } from '../../utils/helper'

async function getMacOSCurrentNetworkService() {
  const networkInterface = 'route get default | grep interface | awk \'{print $2}\''
  const pipes = [
    'networksetup -listnetworkserviceorder',
    `grep -C1 $(${networkInterface})`,
    // 'awk "FNR == 1{print $2}"'
    'head -n 1 | cut -d " " -f2-',
  ]
  const { stdout } = await execa(pipes.join(' | '))
  return stdout.trim()
}

async function getGlobalWebProxy() {
  if (process.platform !== 'darwin') return
  const service = await getMacOSCurrentNetworkService()
  if (!service) return
  const { stdout } = await execa(`networksetup -getwebproxy "${service}"`)
  return stdout.trim().split('\n').reduce<Record<string, string>>((result, line) => {
    const [key, value] = line.split(': ')
    result[key.trim()] = value.trim()
    return result
  }, {})
}

interface GlobalWebProxy {
  host?: string,
  port?: number,
}

async function setGlobalWebProxy(options?: GlobalWebProxy) {
  if (process.platform !== 'darwin') return
  const service = await getMacOSCurrentNetworkService()
  if (!service) return
  const { host, port } = { host: '""', port: 0, ...options }
  const args = [host, port].join(' ')
  const commands = [
    `networksetup -setwebproxy "${service}" ${args}`,
    `networksetup -setsecurewebproxy "${service}" ${args}`,
  ]
  if (!options) {
    commands.push(
      `networksetup -setwebproxystate "${service}" off`,
      `networksetup -setsecurewebproxystate "${service}" off`,
    )
  }
  return execa(commands.join(' && '))
}

async function loadSystemProxy() {
  const settings = unref(useSettings())
  const port: number = settings['proxy.server.port']
  const proxy = await getGlobalWebProxy()
  return Boolean(
    proxy
    && proxy.Enabled === 'Yes'
    && proxy.Server === '127.0.0.1'
    && proxy.Port === String(port)
  )
}

async function setSystemProxy(value: boolean) {
  let proxy: GlobalWebProxy | undefined
  if (value) {
    const settings = unref(useSettings())
    const port: number = settings['proxy.server.port']
    proxy = { host: '127.0.0.1', port }
  }
  return setGlobalWebProxy(proxy)
}

const systemStatusRef = computed<Promise<boolean>>({
  get() {
    return loadSystemProxy()
  },
  async set(value) {
    setSystemProxy(await value)
  },
})

function useSystemProxyStatus() {
  return systemStatusRef
}

export {
  useSystemProxyStatus,
}
