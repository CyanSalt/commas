/**
 * @typedef {import('electron').BrowserWindow} BrowserWindow
 */

/**
 * @type {BrowserWindow[]}
 */
const frames = []

function hasWindow() {
  return Boolean(frames.length)
}

function getLastWindow() {
  return frames[frames.length - 1]
}

/**
 * @param {(value: BrowserWindow, index: number, array: BrowserWindow[]) => void} callback
 */
function forEachWindow(callback) {
  frames.forEach(callback)
}

/**
 * @param {BrowserWindow} frame
 */
function collectWindow(frame) {
  frames.push(frame)
  frame.on('closed', () => {
    const index = frames.indexOf(frame)
    if (index !== -1) {
      frames.splice(index, 1)
    }
  })
}

module.exports = {
  hasWindow,
  getLastWindow,
  forEachWindow,
  collectWindow,
}
