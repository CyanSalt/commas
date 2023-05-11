import { mix, toRGBA, toCSSHEX } from '../../src/shared/color'
import { deepRef, surface, useAsyncComputed, watchBaseEffect } from '../../src/shared/compositions'
import { createIDGenerator, iterate, reuse } from '../../src/shared/helper'
import { omitHome, resolveHome } from '../../src/shared/terminal'
import { getWords, matches } from '../../src/shared/text'

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
}
