import type { KeyBinding } from '@commas/types/menu'

export default [
  {
    label: 'Go to Previous Word',
    accelerator: 'Alt+Left',
    command: 'xterm:input',
    args: ['\u001bb'],
  },
  {
    label: 'Go to Next Word',
    accelerator: 'Alt+Right',
    command: 'xterm:input',
    args: ['\u001bf'],
  },
  {
    label: 'Delete the whole line',
    accelerator: 'CmdOrCtrl+Backspace',
    command: 'xterm:input',
    args: ['\u0015'],
  },
  {
    label: 'Delete the whole word',
    accelerator: 'Alt+Backspace',
    command: 'xterm:input',
    args: ['\u0017'],
  },
  {
    label: 'Trigger Completion',
    accelerator: 'CmdOrCtrl+I',
    command: 'xterm:completion',
  },
] as KeyBinding[]
