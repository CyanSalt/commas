import commas from 'commas:api/main'

export default () => {

  commas.context.provide('cli', {
    command: 'power',
    async handler({ argv }, event) {
      const [status] = argv
      const enabled = status !== 'off'
      event.sender.send('toggle-power-mode', enabled)
      if (enabled) {
        return `
Power mode is turned on. Enter

    commas power off

to exit power mode.
`.trim()
      }
    },
  })

}
