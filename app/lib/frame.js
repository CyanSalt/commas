const frames = []

function hasWindow() {
  return frames[frames.length - 1]
}

function getLastWindow() {
  return frames[frames.length - 1]
}

function forEachWindow(callback) {
  frames.forEach(callback)
}

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
