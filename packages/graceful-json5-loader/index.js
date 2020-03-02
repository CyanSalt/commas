const JSON5 = require('json5')

module.exports = function (source) {
  return JSON.stringify(JSON5.parse(source))
}
