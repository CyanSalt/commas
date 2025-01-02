import * as fs from 'node:fs'
import * as path from 'node:path'
import { memoize, uniq } from 'lodash'
import * as properties from 'properties'
import shellHistory from 'shell-history'
import type { ControlOperator, ParseEntry } from 'shell-quote'
import { parse, quote } from 'shell-quote'
import type { CommandCompletion } from '@commas/types/terminal'
import * as commas from '../../api/core-main'
import { resolveHome } from '../../shared/terminal'
import { execa, memoizeAsync } from './helper'
import { loginExecute } from './shell'

function isCommandLineArgument(query: string) {
  return query.startsWith('-')
    || (process.platform === 'win32' && query.startsWith('/'))
}

const getDirectoryEntries = memoizeAsync(async (dir: string) => {
  return fs.promises.readdir(dir, { withFileTypes: true })
})

async function getFileCompletions(query: string, cwd: string, directoryOnly: boolean) {
  let context = cwd
  let prefix = query
  if (query.includes(path.sep)) {
    const joined = path.resolve(cwd, resolveHome(query + '0')).slice(0, -1)
    if (query.endsWith(path.sep)) {
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
  const completions = files.map<CommandCompletion>(entity => {
    const isDirectory = directoryOnly ? true : entity.isDirectory()
    return {
      type: entity.isDirectory() ? 'directory' : 'file',
      query: prefix,
      value: entity.name + (isDirectory ? path.sep : ''),
    }
  })
  if (files.length && query && !prefix) {
    completions.unshift({
      type: 'directory',
      query: prefix,
      value: '',
    })
  }
  return completions
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
      type: 'command',
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
            type: 'command',
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
            type: 'command',
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
    const defaultSection = sections.find(item => item.title === 'NAME')
    if (defaultSection) {
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
  }
  for (const paragraph of paragraphs) {
    const matches = paragraph[0].match(/^\s*(-[\w-.]+=?),?\s*(.*)$/)
    if (matches) {
      completions.push({
        type: 'command',
        query: '',
        value: matches[1],
        description: (matches[2] ? [matches[2], ...paragraph.slice(1)] : paragraph.slice(1))
          .map(line => line.trim()).join(' '),
      })
    }
  }
  return completions
}, (command, subcommand) => (subcommand ? `${command} ${subcommand}` : command))

async function getManPageCompletions(query: string, command: string, subcommand?: string) {
  const completions = await getManPageRawCompletions(command, subcommand)
  return completions.map<CommandCompletion>(item => ({
    ...item,
    query,
  }))
}

const getNpmScripts = memoizeAsync(async cwd => {
  const { stdout } = await execa('npm run')
  const matches = Array.from(stdout.matchAll(/^\s{2}([^\r\n]+)[\r\n]+\s{4}([^\r\n]+)/gm))
  return matches.map<CommandCompletion>(([full, script, command]) => {
    return {
      type: 'command',
      query: '',
      value: script,
      description: command,
    }
  })
})

async function getFrequentlyUsedProgramCompletions(query: string, cwd: string, command: string, subcommand?: string) {
  if (
    command === 'npm' && ['run', 'run-script', 'rum', 'urn'].includes(subcommand!)
    || ['pnpm', 'yarn'].includes(command)
  ) {
    const completions = await getNpmScripts(cwd)
    return completions.map<CommandCompletion>(item => ({
      ...item,
      query,
    }))
  }
  return []
}

const getShellHistoryTokenLists = memoize(() => {
  const history = uniq((shellHistory() as string[]).reverse()).slice(0, 100)
  return history.map(line => {
    try {
      return parse(line).filter((item): item is string => (typeof item === 'string' && Boolean(item)))
    } catch {
      return []
    }
  })
})

async function getHistoryCompletions(query: string, command: string) {
  const tokenLists = getShellHistoryTokenLists()
  let tokens = command
    ? tokenLists.flatMap(list => list.slice(1))
    : tokenLists.flat()
  if (isCommandLineArgument(query)) {
    tokens = tokens.filter(item => item[0] === query[0])
  }
  return uniq(tokens).map<CommandCompletion>(item => ({
    type: 'history',
    value: item,
    query,
  }))
}

async function getAllCommands() {
  if (process.platform === 'win32') return []
  try {
    const { stdout } = await loginExecute('compgen -c', { shell: 'bash' })
    return stdout.trim().split('\n')
  } catch {
    return []
  }
}

async function getCommandAliases() {
  if (process.platform === 'win32') return {}
  try {
    const { stdout } = await loginExecute('alias')
    return properties.parse(stdout) as Record<string, string>
  } catch {
    return {}
  }
}

const getCommandRawCompletions = memoizeAsync(async () => {
  if (process.platform === 'win32') return []
  let [commands, aliases] = await Promise.all([
    getAllCommands(),
    getCommandAliases(),
  ])
  return uniq([
    ...commands,
    ...Object.keys(aliases),
  ]).sort().map<CommandCompletion>(item => ({
    type: 'command',
    query: '',
    value: item,
    description: aliases[item],
  }))
})

async function getCommandCompletions(query: string) {
  const completions = await getCommandRawCompletions()
  if (!query) {
    completions.unshift({
      type: 'command',
      query: '',
      value: '',
    })
  }
  return completions.map<CommandCompletion>(item => ({
    ...item,
    query,
  }))
}

function isControlOperatorEntry(entry: ParseEntry): entry is Extract<ParseEntry, { op: ControlOperator }> {
  return typeof entry === 'object' && 'op' in entry && entry.op !== 'glob'
}

function isCommandEntry(entry: ParseEntry): entry is string {
  return typeof entry === 'string' && /^\w/.test(entry)
}

async function getCompletions(input: string, cwd: string) {
  const entries = parse(input).filter(item => {
    return !(typeof item === 'object' && 'comment' in item)
  })
  if (!entries.length) return []
  const lastToken = entries[entries.length - 1]
  const isWordStart = /\s$/.test(input) || typeof lastToken !== 'string'
  const tokenIndex = entries.findLastIndex(item => {
    return isControlOperatorEntry(item) && item.op !== '>'
  })
  const undeterminedCommand = tokenIndex !== entries.length - 1 && isCommandEntry(entries[tokenIndex + 1])
    ? entries[tokenIndex + 1] as string
    : undefined
  const args = entries.slice(tokenIndex + 2)
  const subcommandIndex = args.findIndex(isCommandEntry)
  const undeterminedSubcommand = subcommandIndex !== -1 ? args[subcommandIndex] as string : undefined
  const subcommandArgs = subcommandIndex !== -1 ? args.slice(subcommandIndex + 1) : []
  const currentWord = isWordStart ? '' : lastToken
  const isInputingArgs = isCommandLineArgument(currentWord)
  const command = undeterminedCommand && (isWordStart || args.length > 0)
    ? undeterminedCommand.toLowerCase()
    : ''
  const subcommand = command && isWordStart || subcommandArgs.length > 0
    ? undeterminedSubcommand
    : ''
  let asyncCompletionLists: Promise<CommandCompletion[]>[] = []
  // Registered
  const factories = commas.proxy.context.getCollection('terminal.completion')
  asyncCompletionLists = asyncCompletionLists.concat(
    factories.map(factory => factory(currentWord, command, subcommand)),
  )
  // History
  if (currentWord) {
    asyncCompletionLists.push(
      getHistoryCompletions(currentWord, command),
    )
  }
  // Commands
  if (!command && !/^(.+|~)?[\\/]/.test(currentWord)) {
    asyncCompletionLists.push(
      getCommandCompletions(currentWord),
    )
  }
  // Files
  const frequentlyUsedFileCommands = ['.', 'cat', 'cd', 'cp', 'diff', 'more', 'mv', 'rm', 'source', 'vi']
  if (!isInputingArgs && (
    isControlOperatorEntry(lastToken) && lastToken.op === '>'
    || command && (currentWord || frequentlyUsedFileCommands.includes(command))
    || !command && /^(.+|~)?[\\/]/.test(currentWord)
  )) {
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
  if (command === 'npm' && subcommand === 'run') {
    asyncCompletionLists.push(
      getFrequentlyUsedProgramCompletions(currentWord, cwd, command, subcommand),
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
