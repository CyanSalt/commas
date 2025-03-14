/// <reference types="@withfig/autocomplete-types" />
import { filepaths, folders } from '@fig/autocomplete-generators'
import { memoize, uniq } from 'lodash'
import * as properties from 'properties'
import shellHistory from 'shell-history'
import { parse, quote } from 'shell-quote'
import { createIDGenerator, flatAsync, normalizeArray } from '../../shared/helper'
import { loginExecute } from './shell'

function createFigCommandExecutor(context: FigContext): Fig.ExecuteCommandFunction {
  return async request => {
    if (request.command === 'fig') {
      return {
        stdout: 'null',
        stderr: '',
        status: 0,
      }
    }
    try {
      const { stdout, stderr, code } = await loginExecute(quote([request.command, ...request.args]), {
        cwd: request.cwd ?? context.cwd,
        env: request.env ?? context.env,
        timeout: request.timeout,
        shell: request['shell'],
      })
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        status: code ?? 0,
      }
    } catch ({ stdout, stderr, code }) {
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        status: code ?? 0,
      }
    }
  }
}

export interface FigContext {
  tokens: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  shell: string,
  process: string,
}

const figGeneratedSpecCache = new Map<string, Promise<Fig.Spec>>()

function resolveFigGeneratedSpecCacheKey(
  lazyCacheKey: Fig.Subcommand['generateSpecCacheKey'],
  context: FigContext,
) {
  if (!lazyCacheKey) return undefined
  if (typeof lazyCacheKey === 'string') return lazyCacheKey
  return lazyCacheKey({ tokens: context.tokens })
}

function generateFigSpec(
  generateSpec: NonNullable<Fig.Subcommand['generateSpec']>,
  generateSpecCacheKey: Fig.Subcommand['generateSpecCacheKey'],
  context: FigContext,
) {
  const cacheKey = resolveFigGeneratedSpecCacheKey(generateSpecCacheKey, context)
  if (cacheKey && figGeneratedSpecCache.has(cacheKey)) {
    return figGeneratedSpecCache.get(cacheKey)!
  }
  const executeCommand = createFigCommandExecutor(context)
  const generatingSpec = generateSpec(context.tokens, executeCommand)
  if (cacheKey) {
    figGeneratedSpecCache.set(cacheKey, generatingSpec)
  }
  return generatingSpec
}

function resolveFigGeneratorScript(
  script: NonNullable<Fig.Generator['script']>,
  context: FigContext,
) {
  const input = typeof script === 'function' ? script(context.tokens) : script
  if (Array.isArray(input)) {
    return {
      command: input[0],
      args: input.slice(1),
    }
  } else {
    return input
  }
}

const getShellHistoryTokenLists = memoize(() => {
  const history = uniq((shellHistory() as string[]).reverse()).slice(0, 100)
  return history.map(line => {
    try {
      return parse(line).filter((item): item is string => (typeof item === 'string' && Boolean(item)))
        .map(item => item.trim()) // grep 'cd ' -> ['grep', 'cd']
    } catch {
      return []
    }
  })
})

function invalidateFigHistory() {
  getShellHistoryTokenLists.cache.clear!()
}

const historyGenerator: Fig.Generator = {
  custom: async tokens => {
    const historyTokenLists = getShellHistoryTokenLists()
    const commandToken = tokens[0]
    const previousToken = tokens[tokens.length - 2] ?? ''
    return historyTokenLists
      .map(historyTokens => {
        if (historyTokens[0] === commandToken) {
          const index = historyTokens.indexOf(previousToken)
          return index === -1 ? undefined : historyTokens[index + 1]
        }
        return undefined
      })
      .filter(token => token !== undefined)
      .map<Fig.TemplateSuggestion>(token => {
        return {
          type: 'arg',
          name: token,
          insertValue: token,
          context: {
            templateType: 'history',
          },
        }
      })
  },
}

function resolveFigGeneratorTemplate(template: Fig.TemplateStrings): Fig.Generator {
  switch (template) {
    case 'filepaths':
      return filepaths
    case 'folders':
      return folders
    case 'history':
      return historyGenerator
    // TODO: 'help'
    default:
      break
  }
  return {}
}

async function generateFigSuggestionsWithoutCache(
  generator: Fig.Generator,
  token: string,
  context: FigContext,
) {
  try {
    const executeCommand = createFigCommandExecutor(context)
    if (generator.custom) {
      return generator.custom(context.tokens, executeCommand, {
        currentWorkingDirectory: context.cwd,
        environmentVariables: Object.fromEntries(
          Object.entries(context.env).filter((pair): pair is [string, string] => typeof pair[1] === 'string'),
        ),
        currentProcess: context.process,
        sshPrefix: '',
        searchTerm: token,
      })
    }
    if (generator.script) {
      const input = resolveFigGeneratorScript(generator.script, context)
      const { stdout } = await executeCommand({
        ...input,
        timeout: generator.scriptTimeout ?? input.timeout,
      })
      if (generator.splitOn) {
        return stdout.split(generator.splitOn).map<Fig.Suggestion>(name => ({ name }))
      }
      if (generator.postProcess) {
        return generator.postProcess(stdout, context.tokens)
      }
    }
  } catch {
    // ignore errors
  }
  return []
}

const cachePrefixStore = new WeakMap<object, string>()

const generateID = createIDGenerator()

function generateCachePrefix(object: object) {
  const existing = cachePrefixStore.get(object)
  if (existing) return existing
  const created = `fig.cacheKey.${generateID()}`
  cachePrefixStore.set(object, created)
  return created
}

const figSuggestionCache = new Map<string | symbol, {
  timestamp: number,
  data: Promise<Fig.Suggestion[]>,
}>()

function resolveFigCacheKey(cache: Fig.Cache, context: FigContext) {
  let cacheKey = cache.cacheKey ?? generateCachePrefix(cache)
  if (cache.cacheByDirectory) {
    cacheKey = `${context.cwd}:${cacheKey}`
  }
  return cacheKey
}

function readFigSuggesionCache(cacheKey: string, ttl: number | undefined) {
  const cached = figSuggestionCache.get(cacheKey)
  if (!cached) return undefined
  if (ttl === undefined) return cached.data
  return Date.now() > cached.timestamp + ttl ? cached.data : undefined
}

function writeFigSuggesionCache(cacheKey: string, data: Promise<Fig.Suggestion[]>) {
  figSuggestionCache.set(cacheKey, {
    timestamp: Date.now(),
    data,
  })
}

async function generateFigSuggestionsWithoutTrigger(
  generator: Fig.Generator,
  token: string,
  context: FigContext,
): Promise<Fig.Suggestion[]> {
  if (generator.cache) {
    const cacheKey = resolveFigCacheKey(generator.cache, context)
    const cacheStrategy = generator.cache.strategy
    const ttl = generator.cache.ttl
    const cached = readFigSuggesionCache(cacheKey, ttl)
    if (cached && cacheStrategy !== 'stale-while-revalidate') return cached
    const data = generateFigSuggestionsWithoutCache(generator, token, context)
    writeFigSuggesionCache(cacheKey, data)
    if (cached) return cached
    return data
  }
  return generateFigSuggestionsWithoutCache(generator, token, context)
}

function resolveFigTrigger(raw: Fig.Trigger, token: string, oldToken: string) {
  if (typeof raw === 'function') {
    return raw(token, oldToken)
  }
  const trigger = typeof raw === 'string'
    ? { on: 'match' as const, string: raw }
    : raw
  switch (trigger.on) {
    case 'change':
      return token !== oldToken
    case 'threshold':
      return Math.abs(token.length - oldToken.length) < trigger.length
    case 'match': {
      const patterns = normalizeArray(trigger.string)
      return patterns.some(pattern => token.lastIndexOf(pattern) !== oldToken.lastIndexOf(pattern))
    }
    default:
      return true
  }
}

const figSuggestionTriggerCache = new Map<Fig.Generator, {
  token: string,
  data: Promise<Fig.Suggestion[]>,
}>()

function readFigSuggestionTriggerCache(generator: Fig.Generator, trigger: Fig.Trigger, token: string) {
  const cached = figSuggestionTriggerCache.get(generator)
  if (!cached) return undefined
  const shouldTriggerUpdates = resolveFigTrigger(trigger, token, cached.token)
  if (shouldTriggerUpdates) {
    figSuggestionTriggerCache.delete(generator)
    return undefined
  }
  return cached.data
}

function writeFigSuggesionTriggerCache(generator: Fig.Generator, token: string, data: Promise<Fig.Suggestion[]>) {
  figSuggestionTriggerCache.set(generator, {
    token,
    data,
  })
}

async function generateFigSuggestionsByToken(
  generator: Fig.Generator,
  token: string,
  context: FigContext,
): Promise<Fig.Suggestion[]> {
  const { template, ...options } = generator
  if (template) {
    const templates = normalizeArray(template)
    return flatAsync(templates.map(identifier => generateFigSuggestionsByToken({
      ...resolveFigGeneratorTemplate(identifier),
      ...options,
    }, token, context)))
  }
  if (generator.trigger) {
    const cached = readFigSuggestionTriggerCache(generator, generator.trigger, token)
    if (cached) return cached
    const data = generateFigSuggestionsWithoutTrigger(generator, token, context)
    writeFigSuggesionTriggerCache(generator, token, data)
    return data
  }
  return generateFigSuggestionsWithoutTrigger(generator, token, context)
}

async function generateFigSuggestions(
  generator: Fig.Generator,
  context: FigContext,
): Promise<Fig.Suggestion[]> {
  const token = context.tokens[context.tokens.length - 1] ?? ''
  let query = token
  if (typeof generator.getQueryTerm === 'string') {
    query = generator.getQueryTerm
  } else if (typeof generator.getQueryTerm === 'function') {
    query = generator.getQueryTerm(token)
  }
  const suggestions = await generateFigSuggestionsByToken(generator, token, context)
  return suggestions.map<Fig.Suggestion>(suggestion => {
    return {
      ...suggestion,
      _internal: {
        ...suggestion._internal,
        commasCompletionQuery: query,
      },
    }
  })
}

const commandGenerator: Fig.Generator = {
  cache: {
    ttl: 1000 * 60 * 60,
  },
  custom: async (tokens, executeCommand) => {
    if (process.platform === 'win32') return []
    const { stdout } = await executeCommand({
      command: 'compgen',
      args: ['-c'],
      ['shell' as never]: 'bash',
    })
    const commands = stdout.trim().split('\n')
    return commands.map<Fig.Suggestion>(name => {
      return {
        type: 'subcommand',
        name,
      }
    })
  },
}

const aliasGenerator: Fig.Generator = {
  cache: {
    ttl: 1000 * 60 * 60,
  },
  custom: async (tokens, executeCommand) => {
    if (process.platform === 'win32') return []
    const { stdout } = await executeCommand({ command: 'alias', args: [] })
    const aliases: Record<string, string> = properties.parse(stdout)
    return Object.keys(aliases).map<Fig.Suggestion>(name => {
      return {
        type: 'subcommand',
        name,
      }
    })
  },
}

const stepOnCommand: Fig.Subcommand = {
  name: '',
  args: {
    name: 'command',
    generators: [commandGenerator, aliasGenerator],
  },
}

function createCommandWithFilepathsArg(name: string): Fig.Subcommand {
  return {
    name,
    args: {
      name: 'file',
      template: 'filepaths',
    },
  }
}

function createCurrentTokenGenerator(type: Fig.SuggestionType): Fig.Generator {
  return {
    custom: async tokens => {
      const token = tokens[tokens.length - 1]
      return [
        {
          type,
          name: token,
        },
      ]
    },
  }
}

function getFigSeparator(spec: Fig.Option) {
  return spec.requiresSeparator
    ? (typeof spec.requiresSeparator === 'string' ? spec.requiresSeparator : '=')
    : (spec.requiresEquals ? '=' : undefined)
}

export {
  normalizeArray,
  generateFigSpec,
  generateFigSuggestions,
  invalidateFigHistory,
  stepOnCommand,
  createCommandWithFilepathsArg,
  createCurrentTokenGenerator,
  getFigSeparator,
}
