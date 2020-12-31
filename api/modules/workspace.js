const { require: requireRenderer } = require('./bundler')

const { shallowReactive, shallowReadonly, markRaw } = requireRenderer('vue')
const { createIDGenerator } = requireRenderer('utils/helper.mjs')

const tabs = shallowReactive({})
const generateID = createIDGenerator()

function registerTabPane(name, pane) {
  tabs[name] = markRaw({
    pid: generateID(),
    process: '',
    title: '',
    cwd: '',
    pane,
  })
  this.$.app.onCleanup(() => {
    delete tabs[name]
  })
}

function getPaneTab(name) {
  return tabs[name]
}

const anchors = shallowReactive([])

function addAnchor(anchor) {
  anchors.push(anchor)
  this.$.app.onCleanup(() => {
    const index = anchors.indexOf(anchor)
    if (index !== -1) {
      anchors.splice(index, 1)
    }
  })
}

function useAnchors() {
  return shallowReadonly(anchors)
}

const slots = shallowReactive([])

function addSlot(slot) {
  slots.push(slot)
  this.$.app.onCleanup(() => {
    const index = slots.indexOf(slot)
    if (index !== -1) {
      slots.splice(index, 1)
    }
  })
}

function useSlots() {
  return shallowReadonly(slots)
}

module.exports = {
  registerTabPane,
  getPaneTab,
  addAnchor,
  useAnchors,
  addSlot,
  useSlots,
}
