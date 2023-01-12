import * as fs from 'fs'
import * as path from 'path'
import fuzzaldrin from 'fuzzaldrin-plus'
import { findLastIndex } from 'lodash'
import { parse, quote } from 'shell-quote'
import * as commas from '../../../api/core-main'
import { resolveHome } from '../../shared/terminal'
import type { CommandCompletion } from '../../typings/terminal'
import { execa, memoizeAsync } from './helper'
import { loginExecute } from './shell'

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
    const joined = path.resolve(cwd, resolveHome(currentWord + '0')).slice(0, -1)
    if (currentWord.endsWith(path.sep)) {
      context = joined.slice(0, -1)
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

interface ManpageSection {
  title: string,
  paragraphs: string[][],
}

function getManPageSections(content: string) {
  // eslint-disable-next-line no-control-regex
  const lines = content.replace(/.\x08/g, '').trim().split('\n')
  let sections: ManpageSection[] = []
  let title = ''
  let paragraphs: string[][] = []
  let currentParagraph: string[] = []
  const stopCurrentSection = () => {
    sections.push({ title, paragraphs })
    title = ''
    paragraphs = []
  }
  const stopCurrentParagraph = () => {
    if (currentParagraph.length) {
      paragraphs.push(currentParagraph)
      currentParagraph = []
    }
  }
  for (const line of lines) {
    if (line) {
      if (!/^\s/.test(line)) {
        stopCurrentParagraph()
        stopCurrentSection()
        title = line
      } else {
        currentParagraph.push(line)
      }
    } else {
      stopCurrentParagraph()
    }
  }
  stopCurrentParagraph()
  stopCurrentSection()
  return sections
}

const getManPageRawCompletions = memoizeAsync(async (command: string, subcommand?: string) => {
  const completions: CommandCompletion[] = []
  // Not supported yet
  if (process.platform === 'win32') return completions
  if (command === 'npm' && !subcommand) {
    let commands: string[] = []
    try {
      const { stdout } = await loginExecute('npm help')
      const npmSections = getManPageSections(stdout)
      const commandSection = npmSections.find(item => item.title.includes('All commands'))
      if (commandSection) {
        const text = commandSection.paragraphs[0].map(line => line.trim()).join(' ')
        commands = text.split(',').map(item => item.trim())
      }
    } catch {
      // ignore error
    }
    return commands.map<CommandCompletion>(item => ({
      label: item,
      value: item,
    }))
  }
  let sections: ManpageSection[] = []
  if (command === 'npm' && subcommand) {
    try {
      const { stdout } = await loginExecute(`MANPAGER= npm help ${subcommand}`)
      sections = getManPageSections(stdout)
    } catch {
      // ignore error
    }
  } else {
    if (command === 'git' && subcommand) {
      command = command + '-' + subcommand
      subcommand = undefined
    }
    try {
      let manpath = ''
      try {
        const { stdout } = await loginExecute('manpath')
        manpath = stdout.trim()
      } catch {
        // ignore error
      }
      const { stdout } = await execa(quote(['man', command]), { env: {
        MANPATH: manpath,
      } })
      sections = getManPageSections(stdout)
    } catch {
      // ignore error
    }
  }
  if (!subcommand) {
    // Sub-commands
    if (command === 'git') {
      const commandSections = sections.filter(item => item.title.includes('COMMANDS'))
      const paragraphs = commandSections.flatMap(item => item.paragraphs)
      for (const paragraph of paragraphs) {
        const index = paragraph.findIndex(line => /^\s*git-([\w-]+)/.test(line))
        if (index === -1) continue
        const matches = paragraph[index].match(/^\s*git-([\w-]+)/)
        if (matches) {
          completions.push({
            label: matches[1],
            value: matches[1],
            description: paragraph.slice(index + 1)
              .map(line => line.trim()).join(' '),
          })
        }
      }
    }
    if (command === 'brew') {
      const commandSections = sections.filter(item => item.title.includes('COMMANDS') && item.title !== 'ESSENTIAL COMMANDS')
      const commandParagraphs = commandSections.flatMap(item => item.paragraphs)
      for (const paragraph of commandParagraphs) {
        const matches = paragraph[0].match(/^\s{3}([\w-]+)\s*(.*)$/)
        if (matches) {
          completions.push({
            label: matches[1],
            value: matches[1],
            description: (matches[2] ? [matches[2], ...paragraph.slice(1)] : paragraph.slice(1))
              .map(line => line.trim()).join(' '),
          })
        }
      }
    }
  }
  // Nodejs
  const section = sections.find(item => item.title === 'OPTIONS')
    // Default manpages
    ?? sections.find(item => item.title === 'DESCRIPTION')
  let paragraphs = section?.paragraphs ?? []
  if (command === 'brew' && subcommand) {
    const commandSections = sections.filter(item => item.title.includes('COMMANDS') && item.title !== 'ESSENTIAL COMMANDS')
    const commandParagraphs = commandSections.flatMap(item => item.paragraphs)
    const subcommandMatches = commandParagraphs.map(paragraph => {
      const matches = paragraph[0].match(/^\s{3}([\w-]+)\s*(.*)$/)
      return matches
    })
    const startIndex = subcommandMatches.findIndex(matches => {
      return matches && matches[1] === subcommand
    })
    if (startIndex !== -1) {
      const nextIndex = subcommandMatches.findIndex((matches, index) => {
        return index > startIndex && matches
      })
      paragraphs = commandParagraphs.slice(startIndex + 1, nextIndex === -1 ? commandParagraphs.length : nextIndex)
    }
  }
  if (command === 'npm') {
    const defaultSection = sections.find(item => item.title === 'NAME')!
    const parameterParagraphs: string[][] = []
    let currentParameter: string | undefined
    let currentParameterParagraph: string[] = []
    for (const paragraph of defaultSection.paragraphs) {
      const matches = paragraph[0].match(/^\s{3}([a-z][\w-]*)/)
      if (matches) {
        if (currentParameter) {
          parameterParagraphs.push([currentParameter, ...currentParameterParagraph])
          currentParameterParagraph = []
        }
        currentParameter = '   --' + matches[1]
      } else if (currentParameter) {
        if (/^\s{3}[A-Z]/.test(paragraph[0])) {
          parameterParagraphs.push([currentParameter, ...currentParameterParagraph])
          currentParameterParagraph = []
          break
        } else {
          currentParameterParagraph = currentParameterParagraph.concat(paragraph)
        }
      }
    }
    paragraphs = parameterParagraphs
  }
  for (const paragraph of paragraphs) {
    const matches = paragraph[0].match(/^\s*(-[\w-.]+=?),?\s*(.*)$/)
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
}, (command, subcommand) => `${command} ${subcommand ?? ''}`)

async function getManPageCompletions(currentWord: string, command: string, subcommand?: string) {
  let completions = await getManPageRawCompletions(command, subcommand)
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
  const undeterminedCommand = tokenIndex !== entries.length - 1
    ? (entries[tokenIndex + 1] as string).toLowerCase()
    : undefined
  const args = entries.slice(tokenIndex + 2)
  const undeterminedSubcommand = args.find((item): item is string => typeof item === 'string' && !item.startsWith('-'))
  const currentWord = isWordStart ? '' : entries[entries.length - 1] as string
  const isInputingArgs = currentWord.startsWith('-')
  const command = isWordStart || args.length > 0
    ? undeterminedCommand
    : ''
  const subcommand = command && isWordStart || args.length > 1
    ? undeterminedSubcommand
    : ''
  // Commands
  if (!command) {
    // TODO:
    return []
  }
  let asyncCompletionLists: Promise<CommandCompletion[]>[] = []
  // Registered
  const queryCommand = subcommand ? `${command} ${subcommand}` : command
  const declarations = commas.proxy.context.getCollection('terminal.completion')
  const completionDeclaration = declarations.find(item => item.command === queryCommand)
  if (completionDeclaration) {
    asyncCompletionLists.push(
      Promise.resolve(
        sortCompletions(completionDeclaration.completions, currentWord, item => item.value)
          .map<CommandCompletion>(item => ({
          label: highlightLabel(item.label, currentWord),
          value: item.value,
          back: currentWord.length,
        })),
      ),
    )
  }
  // Files
  const directoryCommands = ['cd', 'ls']
  const frequentlyUsedFileCommands = ['cat', 'cp', 'diff', 'more', 'mv', 'rm', 'source', 'vi']
    .concat(directoryCommands)
  if (!isInputingArgs && (frequentlyUsedFileCommands.includes(command) || /^(~|\.{1,2})\//.test(currentWord))) {
    const directoryOnly = directoryCommands.includes(command)
    asyncCompletionLists.push(
      getFileCompletions(currentWord, cwd, directoryOnly),
    )
  }
  asyncCompletionLists.push(
    getManPageCompletions(currentWord, command, subcommand),
  )
  const lists = await Promise.all(asyncCompletionLists)
  return lists.flat()
}

export {
  getCompletions,
}
