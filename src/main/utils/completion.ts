import * as fs from 'fs'
import * as path from 'path'
import fuzzaldrin from 'fuzzaldrin-plus'
import { findLastIndex } from 'lodash'
import type { ParseEntry } from 'shell-quote'
import { parse, quote } from 'shell-quote'
import { resolveHome } from '../../shared/terminal'
import type { CommandCompletion } from '../../typings/terminal'
import { execa, memoizeAsync } from './helper'

function highlightLabel(label: string, query: string) {
  return query ? fuzzaldrin.wrap(label, query) : label
}

function sortCompletions<T>(collection: T[], query: string, iteratee?: (value: T) => string) {
  if (!query) return collection
  return collection
    .map(item => {
      return [item, fuzzaldrin.score(iteratee ? iteratee(item) : String(item), query)] as const
    })
    .filter(([item, score]) => score > 0)
    .sort(([itemA, scoreA], [itemB, scoreB]) => scoreB - scoreA)
    .map(([item]) => item)
}

async function getFileCompletions(
  currentWord: string,
  cwd: string,
  directoryOnly: boolean,
) {
  let context = cwd
  let prefix = currentWord
  if (currentWord.includes(path.sep)) {
    const joined = path.resolve(cwd, resolveHome(currentWord))
    if (currentWord.endsWith(path.sep)) {
      context = joined
      prefix = ''
    } else {
      const parsed = path.parse(joined)
      context = parsed.dir
      prefix = parsed.base
    }
  }
  let files: fs.Dirent[]
  try {
    const entities = await fs.promises.readdir(context, { withFileTypes: true })
    files = directoryOnly ? entities.filter(entity => entity.isDirectory()) : entities
  } catch {
    return []
  }
  if (prefix) {
    files = sortCompletions(files, prefix, entity => entity.name)
  } else {
    files = files.filter(entity => !entity.name.startsWith('.'))
  }
  const suffix = directoryOnly ? path.sep : ''
  return files.map<CommandCompletion>(entity => ({
    label: highlightLabel(entity.name + suffix, prefix),
    value: entity.name + suffix,
    back: prefix.length,
  }))
}

const getManPageRawCompletions = memoizeAsync(async (command: string) => {
  // Not supported yet
  if (process.platform === 'win32') return []
  try {
    const { stdout } = await execa(quote(['man', command]), { env: {} })
    // eslint-disable-next-line no-control-regex
    const lines = stdout.replace(/.\x08/g, '').trim().split('\n')
    const titleIndex = lines.indexOf('DESCRIPTION')
    if (titleIndex === -1) return []
    const paragraphs: string[][] = []
    let currentParagraph: string[] = []
    for (let i = titleIndex + 1; i < lines.length; i += 1) {
      const line = lines[i]
      if (line) {
        if (!/^\s/.test(line)) break
        currentParagraph.push(line)
      } else if (currentParagraph.length) {
        paragraphs.push(currentParagraph)
        currentParagraph = []
      }
    }
    if (currentParagraph.length) {
      paragraphs.push(currentParagraph)
    }
    const completions: CommandCompletion[] = []
    for (const paragraph of paragraphs) {
      const matches = paragraph[0].match(/^\s*(-{1,2}\w),?\s*(.*)$/)
      if (matches) {
        completions.push({
          label: matches[1],
          value: matches[1],
          description: (matches[2] ? [matches[2], ...paragraph.slice(1)] : paragraph.slice(1))
            .map(line => line.trim()).join(' '),
        })
      }
    }
    return completions
  } catch {
    // ignore error
  }
  return []
})

async function getManPageCompletions(currentWord: string, command: string) {
  let completions = await getManPageRawCompletions(command)
  return sortCompletions(completions, currentWord, item => item.value)
    .map<CommandCompletion>(item => ({
    ...item,
    label: highlightLabel(item.label, currentWord),
    value: item.value,
    back: currentWord.length,
  }))
}

async function getCompletions(input: string, cwd: string) {
  const entries = parse(input).filter(item => {
    return !(typeof item === 'object' && 'comment' in item)
  })
  if (!entries.length) return []
  const isWordStart = /\s$/.test(input) || typeof entries[entries.length - 1] !== 'string'
  const tokenIndex = findLastIndex(entries, item => {
    return typeof item === 'object' && 'op' in item && item.op !== 'glob'
  })
  const command = tokenIndex !== entries.length - 1
    ? (entries[tokenIndex + 1] as string).toLowerCase()
    : undefined
  const args = entries.slice(tokenIndex + 2)
  const currentWord = isWordStart ? '' : entries[entries.length - 1] as string
  const isInputingArgs = currentWord === '-' || currentWord.startsWith('--')
  // Commands
  if (!isWordStart && !args.length) {
    // TODO:
    return []
  }
  let completions: CommandCompletion[] = []
  // Files
  const fileCommands: ParseEntry[] = ['cat', 'sh', 'diff', 'head', 'more', 'tail']
  const directoryCommands: ParseEntry[] = ['cd', 'ls', 'rmdir']
  const fileOrDirectoryCommands: ParseEntry[] = ['chmod', 'chown', 'cp', 'file', 'ln', 'mv', 'rm']
  if (command && !isInputingArgs && [
    ...fileCommands,
    ...directoryCommands,
    ...fileOrDirectoryCommands,
  ].includes(command)) {
    const directoryOnly = directoryCommands.includes(command)
    const result = await getFileCompletions(currentWord, cwd, directoryOnly)
    completions = completions.concat(result)
  }
  if (command && (isInputingArgs || isWordStart)) {
    const result = await getManPageCompletions(currentWord, command)
    completions = completions.concat(result)
  }
  return completions
}

export {
  getCompletions,
}
