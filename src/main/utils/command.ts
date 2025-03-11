import type { ControlOperator, ParseEntry } from 'shell-quote'
import { parse } from 'shell-quote'

type CommentEntry = Extract<ParseEntry, { comment: unknown }>
type ControlOperatorEntry = Extract<ParseEntry, { op: ControlOperator }>
type GlobEntry = Extract<ParseEntry, { op: 'glob' }>

function isCommentEntry(entry: ParseEntry): entry is CommentEntry {
  return typeof entry === 'object' && 'comment' in entry
}

function isControlOperatorEntry(entry: ParseEntry): entry is ControlOperatorEntry {
  return typeof entry === 'object' && 'op' in entry && entry.op !== 'glob'
}

function isGlobEntry(entry: ParseEntry): entry is GlobEntry {
  return typeof entry === 'object' && 'op' in entry && entry.op === 'glob'
}

function isCommandEntry(entry: ParseEntry): entry is string {
  return typeof entry === 'string' && /^\w/.test(entry)
}

function getEntryText(entry: ParseEntry) {
  if (typeof entry === 'string') return entry
  if (isControlOperatorEntry(entry)) return entry.op
  if (isGlobEntry(entry)) return entry.pattern
  return ''
}

function extractCommandEntries(input: string) {
  const entries = parse(input).filter(
    (item): item is Exclude<ParseEntry, CommentEntry> => !isCommentEntry(item),
  )
  if (!entries.length) {
    return {
      entries: [],
      operator: undefined,
    }
  }
  const lastToken = entries[entries.length - 1]
  const isWordStart = /\s$/.test(input) || typeof lastToken !== 'string'
  const tokenIndex = entries.findLastIndex(item => isControlOperatorEntry(item))
  const currentEntries = entries.slice(tokenIndex + 1) as Exclude<(typeof entries)[number], ControlOperatorEntry>[]
  return {
    entries: [
      ...currentEntries.map(entry => getEntryText(entry)),
      ...(isWordStart ? [''] : []),
    ],
    operator: entries[tokenIndex] as ControlOperatorEntry | undefined,
  }
}

function extractCommand(argv: string[]) {
  const commandIndex = argv.findIndex(entry => isCommandEntry(entry))
  const args = commandIndex === -1 ? [] : argv.slice(commandIndex + 1)
  const command = args.length > 0
    ? argv[commandIndex].toLowerCase()
    : ''
  return {
    command,
    args,
  }
}

export {
  extractCommandEntries,
  extractCommand,
}
