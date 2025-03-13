import { mix, toCSSHEX, toRGBA } from '../../shared/color'
import { deepRef, surface, useAsyncComputed, watchBaseEffect } from '../../shared/compositions'
import { createIDGenerator, iterate, normalizeArray, reuse } from '../../shared/helper'
import { omitHome, resolveHome } from '../../shared/terminal'
import { getWords, matches } from '../../shared/text'

export {
  deepRef,
  surface,
  useAsyncComputed,
  watchBaseEffect,
  createIDGenerator,
  reuse,
  iterate,
  omitHome,
  resolveHome,
  toRGBA,
  toCSSHEX,
  mix,
  getWords,
  matches,
  normalizeArray,
}
