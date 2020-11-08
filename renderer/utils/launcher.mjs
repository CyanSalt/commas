/**
 * @typedef Launcher
 * @property {number} id
 * @property {string} name
 * @property {string} command
 * @property {string} [directory]
 * @property {boolean} [login]
 * @property {boolean} [remote]
 */

/**
 * @param {string} command
 * @param {'\''|'"'} q
 */
function quote(command, q) {
  return `${q}${command.replace(new RegExp(q, 'g'), `${q}\\${q}${q}`)}${q}`
}

/**
 * @param {Launcher} launcher
 */
export function getLauncherCommand(launcher) {
  let command = launcher.command
  if (launcher.login) {
    command = command ? `$SHELL -lic ${quote(command, '"')}`
      : '$SHELL -li'
  }
  if (launcher.directory) {
    const directory = launcher.directory.replace(' ', '\\ ')
    command = command ? `cd ${directory} && (${command})`
      : `cd ${directory}`
  }
  if (launcher.remote) {
    command = command ? `ssh -t ${launcher.remote} ${quote(command, '\'')}`
      : `ssh -t ${launcher.remote}`
  }
  return command
}
