export const quote = command => `"${command.replace(/"/g, '"\\""')}"`

export const resolveHome = directory => {
  if (!directory) return directory
  return directory.startsWith('~') ?
    process.env.HOME + directory.slice(1) : directory
}
