import { quote } from 'shell-quote'
import type { Launcher } from '../../typings/launcher'

export function getLauncherCommand(launcher: Launcher) {
  let command = launcher.command
  if (launcher.login) {
    command = command ? `$SHELL -lic ${quote([command])}`
      : '$SHELL -li'
  }
  if (launcher.directory) {
    const directory = launcher.directory.replace(' ', '\\ ')
    command = command ? `cd ${directory} && (${command})`
      : `cd ${directory}`
  }
  if (launcher.remote) {
    command = command ? `ssh -t ${launcher.remote} ${quote([command])}`
      : `ssh -t ${launcher.remote}`
  }
  return command
}
