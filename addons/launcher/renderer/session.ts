import type { Terminal } from 'xterm'
import { SerializeAddon } from 'xterm-addon-serialize'

const launcherSessionMap = new Map<number, string>()

export class LauncherSessionAddon {

  id: number
  serializeAddon: SerializeAddon

  constructor(id: number) {
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
