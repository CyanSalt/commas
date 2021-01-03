import type { Component } from 'vue'
import { shallowReactive, shallowReadonly, markRaw } from 'vue'
import { createIDGenerator } from '../../renderer/utils/helper'
import type { TerminalTab, TerminalTabPane } from '../../typings/terminal'

const tabs = shallowReactive<Record<string, TerminalTab>>({})
const generateID = createIDGenerator()

function registerTabPane(name: string, pane: TerminalTabPane) {
  tabs[name] = markRaw({
    pid: generateID(),
    process: '',
    title: '',
    cwd: '',
    pane,
  }) as unknown as TerminalTab
  this.$.app.onCleanup(() => {
    delete tabs[name]
  })
}

function getPaneTab(name: string) {
  return tabs[name]
}

const anchors = shallowReactive<Component[]>([])

function addAnchor(anchor: Component) {
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

const slots = shallowReactive<Component[]>([])

function addSlot(slot: Component) {
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

export {
  registerTabPane,
  getPaneTab,
  addAnchor,
  useAnchors,
  addSlot,
  useSlots,
}
