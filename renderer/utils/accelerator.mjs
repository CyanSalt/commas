export function toKeyEventPattern(accelerator) {
  const keys = accelerator.split('+').map(key => key.trim())
  const pattern = {}
  for (const key of keys) {
    switch (key) {
      case 'Shift':
        pattern.shiftKey = true
        break
      case 'Ctrl':
      case 'Control':
        pattern.ctrlKey = true
        break
      case 'Alt':
      case 'Option':
        pattern.altKey = true
        break
      case 'Super':
        pattern.metaKey = true
        break
      case 'CmdOrCtrl':
      case 'CommandOrCtrl':
        pattern.metaKey = true
        break
      default:
        pattern.key = key.length === 1 ? key.toLowerCase() : key
        break
    }
  }
  return pattern
}
