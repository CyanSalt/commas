/**
 * @param {import('../../api/types').API} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {
    require('./dist/main').default()
  }
}
