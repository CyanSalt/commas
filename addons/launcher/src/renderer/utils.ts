import * as path from 'node:path'
import { quote } from 'shell-quote'
import type { Launcher } from '../../types/launcher'

export function getLauncherCommand(launcher: Launcher, shellPath: string) {
  let command = launcher.command
  if (launcher.login) {
    command = command
      ? `$SHELL -lic ${quote([command])}`
      : '$SHELL -li'
  }
  if (launcher.directory) {
    const isPowerShell = process.platform === 'win32'
      && (!shellPath || path.basename(shellPath) === 'powershell.exe')
      && !launcher.remote
    if (isPowerShell) {
      command = command
        ? `Set-Location -Path ${quote([launcher.directory])}; if ($?) { ${command} }`
        : `Set-Location -Path ${quote([launcher.directory])}`
    } else {
      command = command
        ? `cd ${quote([launcher.directory])} && (${command})`
        : `cd ${quote([launcher.directory])}`
    }
  }
  if (launcher.remote) {
    command = command
      ? `ssh -t ${launcher.remote} ${quote([command])}`
      : `ssh -t ${launcher.remote}`
  }
  return command
}
