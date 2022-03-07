/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {
    require('./dist/main')
  } else {
    require('./dist/renderer')
  }
}
