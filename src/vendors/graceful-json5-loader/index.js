const {parse} = require('json5')

module.exports = function (source) {
  return JSON.stringify(parse(source))
}
