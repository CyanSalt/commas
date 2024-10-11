import * as commas from 'commas:api/main'

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.keybinding.addKeyBindingsFile('keybindings.json')

}
