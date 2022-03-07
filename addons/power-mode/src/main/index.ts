import commas from 'commas:api/main'

commas.context.provide('cli', {
  command: 'power',
  async handler({ argv }, event) {
    const [status] = argv
    event.sender.send('toggle-power-mode', status !== 'off')
  },
})
