import type { KeyBinding } from '../../typings/menu'

export default [
  {
    label: 'Delete the whole line',
    accelerator: 'CmdOrCtrl+Backspace',
    command: 'xterm:send',
    args: ['\u0015'],
  },
  {
    label: 'Delete the whole word',
    accelerator: 'Alt+Backspace',
    command: 'xterm:send',
    args: ['\u0017'],
  },
  {
    label: 'Trigger Completion',
    accelerator: 'CmdOrCtrl+I',
    command: 'xterm:completion',
  },
] as KeyBinding[]
