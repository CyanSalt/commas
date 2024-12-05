const {
  showFontPanel: nativeShowFontPanel,
} = require('node-gyp-build')(__dirname)

/**
 * @returns {void}
 */
function showFontPanel() {
  return nativeShowFontPanel()
}

module.exports = {
  showFontPanel,
}
