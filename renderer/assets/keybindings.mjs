export default [
  {
    label: 'Delete the whole line',
    accelerator: 'CmdOrCtrl+Backspace',
    command: 'xterm:send',
    args: [0x15],
  },
  {
    label: 'Delete the whole word',
    accelerator: 'Alt+Backspace',
    command: 'xterm:send',
    args: [0x17],
  },
]
