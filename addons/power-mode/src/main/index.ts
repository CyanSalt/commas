import commas from 'commas:api/main'

export default () => {

  commas.context.provide('cli.command', {
    command: 'power',
    description: 'Activate POWER MODE#!cli.description.power',
    usage: '[off]',
    async handler({ sender, argv }) {
      const [status] = argv
      const enabled = status !== 'off'
      commas.frame.send(sender, 'toggle-power-mode', enabled)
      if (enabled) {
        return commas.i18n.translate('Power mode is turned on. Enter ${command}to exit power mode.#!power-mode.1', {
          command: '\n\n    commas power off\n\n',
        })
      }
    },
  })

  commas.i18n.addTranslationDirectory('locales')

}
