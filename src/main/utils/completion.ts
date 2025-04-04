/// <reference types="@withfig/autocomplete-types" />
import * as path from 'node:path'
import { uniq } from 'lodash'
import { quote } from 'shell-quote'
import type { SetRequired } from 'type-fest'
import type { CommandCompletion } from '@commas/types/terminal'
import * as commas from '../../api/core-main'
import { flatAsync, normalizeArray } from '../../shared/helper'
import { extractCommand, extractCommandEntries } from './command'
import type { FigContext } from './fig'
import {
  createCommandWithFilepathsArg,
  createCurrentTokenGenerator,
  generateFigSpec,
  generateFigSuggestions,
  getFigSeparator,
  invalidateFigHistory,
  stepOnCommand,
} from './fig'
import { memoizeAsync } from './helper'
import { BIN_PATH, loginExecute } from './shell'

function isCommandLineArgument(query: string) {
  return query.startsWith('-')
    || (process.platform === 'win32' && query.startsWith('/'))
}

async function getZshCaptureCompletions(input: string, query: string, cwd: string) {
  try {
    const { stdout } = await loginExecute(quote([path.join(BIN_PATH, 'zsh-capture-completion.sh'), input]), {
      shell: '/bin/zsh',
      cwd,
    })
    const choices = uniq(stdout.trim().split(/[\r\n]+/))
    return choices.map<CommandCompletion>(choice => {
      const matches = choice.match(/^(.+?)\s+--\s+(.+)$/)
      const value = matches ? matches[1] : choice
      const description = matches ? matches[2] : undefined
      return {
        type: 'command',
        query,
        value,
        description,
      }
    })
  } catch {
    return []
  }
}

const getFigCompletionModules = memoizeAsync(async () => {
  // FIXME: `.default` is not accessible here and must be handed over to the upper scope for unknown reason
  // @ts-expect-error esm interop
  return import('@withfig/autocomplete/dynamic') as Promise<{
    default: Record<string, () => Promise<{ default: Fig.Spec }>>,
  }>
})

function interopDefault<T>(value: { default: T }) {
  return value.default
}

function stripFigCursor(insertion: string) {
  const index = insertion.indexOf('{cursor}')
  if (index === -1) return insertion
  const suffix = insertion.slice(index + '{cursor}'.length)
  return insertion.slice(0, index) + suffix + '\u001b[D'.repeat(suffix.length)
}

function getFigValues(spec: Fig.Subcommand | Fig.Suggestion | Fig.Option) {
  if (spec.insertValue) {
    return [stripFigCursor(spec.insertValue)]
  }
  const names = normalizeArray(spec.name)
  if ('requiresSeparator' in spec || 'requiresEquals' in spec) {
    const separator = getFigSeparator(spec)
    if (separator) {
      return names.map(name => name + separator)
    }
  }
  return names
}

function getFigArgsLabel(spec: Fig.Subcommand | Fig.Option, name: string) {
  if (!spec.args) return undefined
  const args = normalizeArray(spec.args)
  const displayArgs = args.filter((arg): arg is SetRequired<typeof arg, 'name'> => Boolean(arg.name))
  if (!displayArgs.length) return undefined
  const label = displayArgs.map(arg => {
    const delimiters = arg.isOptional ? ['[', ']'] : ['<', '>']
    return `${delimiters[0]}${arg.isVariadic ? '...' : ''}${
      arg.name
    }${arg.default ? `=${arg.default}` : ''}${delimiters[1]}`
  }).join(' ')
  return name + ' ' + label
}

function getFigSuggestionType(spec: Fig.Suggestion): CommandCompletion['type'] {
  switch (spec.type) {
    case 'file':
      return 'file'
    case 'folder':
      return 'directory'
    default:
      break
  }
  if ('context' in spec) {
    const templateContext = (spec as Fig.TemplateSuggestion).context
    switch (templateContext.templateType) {
      case 'filepaths':
        return 'file'
      case 'folders':
        return 'directory'
      case 'history':
        return 'history'
      default:
        break
    }
  }
  return 'command'
}

function transformFigSuggestion(raw: string | Fig.Suggestion, query: string, strict?: boolean) {
  const spec = typeof raw === 'string' ? { name: raw } : raw
  if (spec.hidden) return []
  let values = getFigValues(spec)
  if (strict) {
    values = values.filter(value => value.startsWith(query))
  }
  return values.map<CommandCompletion>(value => ({
    type: getFigSuggestionType(spec),
    query: spec._internal?.commasCompletionQuery as string | undefined ?? query,
    value,
    label: spec.displayName,
    description: spec.description,
    deprecated: Boolean(spec.deprecated),
  }))
}

function transformFigSubcommand(spec: Fig.Subcommand, query: string) {
  if (spec.hidden) return []
  const values = getFigValues(spec)
  return values.map<CommandCompletion>(value => ({
    type: 'command',
    query,
    value,
    label: spec.displayName ?? (
      spec.insertValue ? undefined : getFigArgsLabel(spec, value)
    ),
    description: spec.description,
    deprecated: Boolean(spec.deprecated),
  }))
}

function isMatchFigOption(value: string, raw: string | Fig.Option) {
  const spec = typeof raw === 'string' ? { name: raw } : raw
  const names = normalizeArray(spec.name)
  const separator = getFigSeparator(spec)
  return names.some(name => {
    if (separator) {
      return value.startsWith(name + separator)
    } else {
      if (value === name) return true
      // e.g. `-aL` matches both `-a` and `-L`
      if (/^-\w$/.test(name)) {
        return /^-\w/.test(value) && value.includes(name[1])
      }
      return false
    }
  })
}

function transformFigOption(spec: Fig.Option, query: string, args: string[], subcommand: string) {
  if (spec.hidden) return []
  if (subcommand && !spec.isPersistent) return []
  const values = getFigValues(spec)
  const max = spec.isRepeatable
    ? (typeof spec.isRepeatable === 'number' ? spec.isRepeatable : Infinity)
    : 1
  const times = args.filter(arg => isMatchFigOption(arg, spec)).length
  if (times > max) return []
  const exclusiveOn = spec.exclusiveOn ?? []
  if (exclusiveOn.some(exclusive => args.some(arg => isMatchFigOption(arg, exclusive)))) return []
  return values.map<CommandCompletion>(value => ({
    type: 'command',
    query,
    value,
    label: spec.displayName ?? (
      spec.insertValue ? undefined : getFigArgsLabel(spec, value)
    ),
    description: spec.description,
    deprecated: Boolean(spec.deprecated),
  }))
}

function getFigArgCompletions(spec: Fig.Subcommand | Fig.Option, query: string, context: FigContext) {
  const specArgs = normalizeArray(spec.args)
  if (!specArgs.length) return []
  // When inputting `--foo=bar`, if spec has name `--foo` and separator `=`, just make query to be `bar`
  const separator = getFigSeparator(spec)
  const names = normalizeArray(spec.name)
  if (separator) {
    const usage = names.find(name => query.startsWith(name + separator))
    if (usage) {
      query = query.slice(usage.length + separator.length)
    }
  }
  return flatAsync(specArgs.map(async arg => {
    const generators: Fig.Generator[] = [
      ...(arg.suggestCurrentToken ? [createCurrentTokenGenerator('arg')] : []),
      ...(arg.template ? [{ template: arg.template }] : []),
      ...normalizeArray(arg.generators),
    ]
    const suggestions = await flatAsync([
      arg.suggestions ?? [],
      ...generators.map(generator => generateFigSuggestions(generator, context)),
    ])
    return suggestions.flatMap(suggestion => transformFigSuggestion(suggestion, query))
  }))
}

async function getFigCompletions(
  lazySpec: Fig.Spec,
  query: string,
  args: string[],
  context: FigContext,
) {
  const spec = typeof lazySpec === 'function' ? lazySpec() : lazySpec
  // FIXME: why does `undefined extends Fig.Spec ? true : false` get `true` ?
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!spec || !('name' in spec)) return []
  const asyncCompletions: (CommandCompletion[] | Promise<CommandCompletion[]>)[] = []
  const options = spec.options ?? []
  // Suggestions
  const suggestions = [
    ...normalizeArray(spec.args).flatMap(arg => arg.suggestions ?? []),
    ...(spec.additionalSuggestions ?? []),
  ]
  asyncCompletions.push(
    suggestions.flatMap(suggestion => transformFigSuggestion(suggestion, query, true)),
  )
  // Option args
  // Option args since option spec will not pass to `getFigCompletions`
  const previousArg = args.length > 1 ? args[args.length - 2] : undefined
  const inputtingOption = options.find(item => {
    const separator = getFigSeparator(item)
    const optionArg = separator ? query : previousArg
    return optionArg === undefined ? false : isMatchFigOption(optionArg, item)
  })
  if (inputtingOption) {
    asyncCompletions.push(
      getFigArgCompletions(inputtingOption, query, context),
    )
  }
  // Subcommands (suggest if no subcommand, call recursively otherwise)
  const subcommands = spec.subcommands ?? []
  const { command: subcommand, args: subcommandArgs } = extractCommand(args)
  if (subcommand) {
    const subcommandIndex = subcommands.findIndex(item => {
      const names = normalizeArray(item.name)
      return names.includes(subcommand)
    })
    // Prefer subcommand options rather than parent options
    if (subcommandIndex !== -1) {
      const subspec = subcommands[subcommandIndex]
      asyncCompletions.push(
        getFigCompletions(subspec, query, subcommandArgs, context),
      )
    }
  } else {
    asyncCompletions.push(
      subcommands.flatMap(subspec => transformFigSubcommand(subspec, query)),
    )
  }
  // Options
  asyncCompletions.push(
    options.flatMap(option => transformFigOption(option, query, args, subcommand)),
  )
  // Args
  asyncCompletions.push(
    getFigArgCompletions(spec, query, context),
  )
  // Generated spec
  if (spec.generateSpec) {
    const generatedSpec = await generateFigSpec(spec.generateSpec, spec.generateSpecCacheKey, context)
    asyncCompletions.push(
      getFigCompletions(generatedSpec, query, args, context),
    )
  }
  // TODO: loadSpec
  return flatAsync(asyncCompletions)
}

export interface CompletionShellContext {
  cwd: string,
  env: NodeJS.ProcessEnv,
  shell: string,
  process: string,
}

const commands = commas.proxy.context.getCollection('terminal.completion-command')
const appCompletions = $computed(() => {
  return commands.reduce<Record<string, Fig.Subcommand>>((completions, spec) => {
    const names = normalizeArray(spec.name)
    for (const name of names) {
      completions[name] = spec
    }
    return completions
  }, {})
})

async function getCompletions(
  input: string,
  shellContext: CompletionShellContext,
  capture?: boolean,
) {
  const { entries, operator } = extractCommandEntries(input)
  if (!entries.length) return []
  const { command, args } = extractCommand(entries)
  const query = entries[entries.length - 1]
  let asyncCompletionLists: (CommandCompletion[] | Promise<CommandCompletion[]>)[] = []
  // Providers
  const providers = commas.proxy.context.getCollection('terminal.completion-provider')
  asyncCompletionLists = asyncCompletionLists.concat(
    providers.map(provider => provider({
      input,
      query,
      command,
      args,
    })),
  )
  if (capture) {
    // Zsh capture
    asyncCompletionLists.push(
      getZshCaptureCompletions(input, query, shellContext.cwd),
    )
  } else {
    const figContext: FigContext = {
      cwd: shellContext.cwd,
      env: shellContext.env,
      shell: shellContext.shell,
      process: shellContext.process,
      tokens: entries,
    }
    if (command in appCompletions) {
      const spec = appCompletions[command]
      asyncCompletionLists.push(
        getFigCompletions(spec, query, args, figContext),
      )
    } else {
      const figCompletions = interopDefault(await getFigCompletionModules())
      if (command in figCompletions) {
        const { default: lazySpec } = await figCompletions[command]()
        asyncCompletionLists.push(
          getFigCompletions(lazySpec, query, args, figContext),
        )
      } else {
        // Commands
        if (!command && !/^(.+|~)?[\\/]/.test(query)) {
          asyncCompletionLists.push(
            getFigCompletions(stepOnCommand, query, args, figContext),
          )
        }
        // Files
        if (!isCommandLineArgument(query) && (operator && operator.op === '>' || /[\\/]/.test(query))) {
          asyncCompletionLists.push(
            getFigCompletions(createCommandWithFilepathsArg(command), query, args, figContext),
          )
        }
      }
    }
  }
  const completions = await flatAsync(asyncCompletionLists)
  // Always add a passthrough option
  if (completions.length && !query) {
    completions.push({ value: '', query: '' })
  }
  return completions
}

function refreshCompletions() {
  invalidateFigHistory()
}

export {
  getCompletions,
  refreshCompletions,
}
