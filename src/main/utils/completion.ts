import * as fs from 'fs'
import * as path from 'path'
import { findLastIndex, memoize, uniq } from 'lodash'
import shellHistory from 'shell-history'
import { parse, quote } from 'shell-quote'
import * as commas from '../../../api/core-main'
import { resolveHome } from '../../shared/terminal'
import type { CommandCompletion } from '../../typings/terminal'
import { execa, memoizeAsync } from './helper'
import { loginExecute } from './shell'

const getDirectoryEntries = memoizeAsync(async (dir: string) => {
  return fs.promises.readdir(dir, { withFileTypes: true })
})

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
    const entities = await getDirectoryEntries(context)
    files = directoryOnly ? entities.filter(entity => entity.isDirectory()) : entities
  } catch {
    return []
  }
  if (!prefix.startsWith('.')) {
    files = files.filter(entity => !entity.name.startsWith('.'))
  }
  const suffix = directoryOnly ? path.sep : ''
  return files.map<CommandCompletion>(entity => ({
    type: entity.isDirectory() ? 'directory' : 'file',
    query: prefix,
    value: entity.name + suffix,
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
      query: '',
      value: item,
    }))
  }
  let sections: ManpageSection[] = []
  if (command === 'npm' && subcommand) {
    try {
      const { stdout } = await loginExecute(`npm help ${subcommand}`, {
        env: {
          MANPAGER: '',
        },
      })
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
            query: '',
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
            query: '',
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
        query: '',
        value: matches[1],
        description: (matches[2] ? [matches[2], ...paragraph.slice(1)] : paragraph.slice(1))
          .map(line => line.trim()).join(' '),
      })
    }
  }
  return completions
}, (command, subcommand) => (subcommand ? `${command} ${subcommand}` : command))

async function getManPageCompletions(currentWord: string, command: string, subcommand?: string) {
  const completions = await getManPageRawCompletions(command, subcommand)
  return completions.map<CommandCompletion>(item => ({
    ...item,
    query: currentWord,
  }))
}

const getShellHistoryTokenLists = memoize(() => {
  const history = uniq((shellHistory() as string[]).reverse()).slice(0, 100)
  return history.map(line => {
    return parse(line)
      .filter((item): item is string => (typeof item === 'string' && Boolean(item)))
  })
})

async function getHistoryCompletions(currentWord: string, command: string) {
  const tokenLists = getShellHistoryTokenLists()
  const tokens = command
    ? tokenLists.flatMap(list => list.slice(1))
    : tokenLists.flatMap(list => list.slice(0, 1))
  return uniq(tokens).map<CommandCompletion>(item => ({
    type: 'history',
    value: item,
    query: currentWord,
  }))
}

const getCommandRawCompletions = memoizeAsync(async () => {
  if (process.platform === 'win32') return []
  let commands: string[] = []
  try {
    const { stdout } = await loginExecute('compgen -c', { shell: 'bash' })
    commands = stdout.trim().split('\n')
  } catch {
    // ignore error
  }
  return uniq(commands).sort().map<CommandCompletion>(item => ({
    query: '',
    value: item,
  }))
})

async function getCommandCompletions(currentWord: string) {
  const completions = await getCommandRawCompletions()
  return completions.map<CommandCompletion>(item => ({
    ...item,
    query: currentWord,
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
    ? entries[tokenIndex + 1] as string
    : undefined
  const args = entries.slice(tokenIndex + 2)
  const subcommandIndex = args.findIndex(item => typeof item === 'string' && /^\w/.test(item))
  const undeterminedSubcommand = subcommandIndex !== -1 ? args[subcommandIndex] as string : undefined
  const subcommandArgs = subcommandIndex !== -1 ? args.slice(subcommandIndex + 1) : []
  const currentWord = isWordStart ? '' : entries[entries.length - 1] as string
  const isInputingArgs = currentWord.startsWith('-')
    || (process.platform === 'win32' && currentWord.startsWith('/'))
  const command = isWordStart || args.length > 0
    ? undeterminedCommand!.toLowerCase()
    : ''
  const subcommand = command && isWordStart || subcommandArgs.length > 0
    ? undeterminedSubcommand
    : ''
  let asyncCompletionLists: Promise<CommandCompletion[]>[] = []
  // Registered
  const queryCommand = subcommand ? `${command} ${subcommand}` : command
  const declarations = commas.proxy.context.getCollection('terminal.completion')
  const completionDeclaration = declarations.find(item => item.command === queryCommand)
  if (completionDeclaration) {
    asyncCompletionLists.push(Promise.resolve(
      completionDeclaration.completions.map<CommandCompletion>(item => ({
        ...item,
        query: currentWord,
      })),
    ))
  }
  // History
  if (currentWord) {
    asyncCompletionLists.push(
      getHistoryCompletions(currentWord, command),
    )
  }
  // Commands
  if (!command) {
    asyncCompletionLists.push(
      getCommandCompletions(currentWord),
    )
  }
  // Files
  const frequentlyUsedFileCommands = ['.', 'cat', 'cd', 'cp', 'diff', 'more', 'mv', 'rm', 'source', 'vi']
  if (command && !isInputingArgs && (currentWord || frequentlyUsedFileCommands.includes(command))) {
    const directoryCommands = ['cd', 'dir', 'ls']
    const directoryOnly = directoryCommands.includes(command)
    asyncCompletionLists.push(
      getFileCompletions(currentWord, cwd, directoryOnly),
    )
  }
  if (command) {
    asyncCompletionLists.push(
      getManPageCompletions(currentWord, command, subcommand),
    )
  }
  const lists = await Promise.all(asyncCompletionLists)
  return lists.flat()
}

function refreshCompletions() {
  getDirectoryEntries.cache.clear()
  getShellHistoryTokenLists.cache.clear!()
}

export {
  getCompletions,
  refreshCompletions,
}
