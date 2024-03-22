import type { SerializeAddon } from '@xterm/addon-serialize'
import type { Terminal } from '@xterm/xterm'

const launcherSessionMap = new Map<string, string>()

export class LauncherSessionAddon {

  id: string
  serialize: SerializeAddon

  constructor(id: string, serialize: SerializeAddon) {
    this.id = id
    this.serialize = serialize
  }

  activate(xterm: Terminal) {
    const session = launcherSessionMap.get(this.id)
    if (session) {
      xterm.write(session)
    }
  }

  dispose() {
    launcherSessionMap.set(this.id, this.serialize.serialize())
  }

}

export function clearLauncherSessions() {
  launcherSessionMap.clear()
}
