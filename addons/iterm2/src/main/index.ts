import * as commas from 'commas:api/main'

commas.context.provide('cli', {
  command: 'attention',
  handler() {
    return '\x1b]1337;RequestAttention=fireworks\x1b\\'
  },
})
