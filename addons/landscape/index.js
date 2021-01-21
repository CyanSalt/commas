module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

  } else {

    commas.workspace.addSlot(
      commas.bundler.extract('landscape/landscape-slot.vue').default
    )

    commas.workspace.addAnchor(
      commas.bundler.extract('landscape/landscape-anchor.vue').default
    )

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'landscape',
      note: 'Add background image for each terminal tab#!landscape.1',
    })

  }
}
