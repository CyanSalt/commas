import { SerializeAddon } from '@xterm/addon-serialize'
import type { Terminal } from '@xterm/xterm'

const launcherSessionMap = new Map<string, string>()

export class LauncherSessionAddon {

  id: string
  serializeAddon: SerializeAddon

  constructor(id: string) {
    this.id = id
    this.serializeAddon = new SerializeAddon()
  }

  activate(xterm: Terminal) {
    this.serializeAddon.activate(xterm)
    const session = launcherSessionMap.get(this.id)
    if (session) {
      xterm.write(session)
    }
  }

  dispose() {
    launcherSessionMap.set(this.id, this.serializeAddon.serialize())
    this.serializeAddon.dispose()
  }

}

export function clearLauncherSessions() {
  launcherSessionMap.clear()
}
