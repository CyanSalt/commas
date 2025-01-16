import { chat } from './chat'
import { access } from './server'

function getOSName() {
  switch (process.platform) {
    case 'win32':
      return 'Windows'
    case 'darwin':
      return 'macOS'
    default:
      return process.platform
  }
}

class AnswerSyntaxError extends Error {}

async function getAnswer(input: unknown) {
  const answer = await access(() => chat(JSON.stringify(input)))
  try {
    const data = JSON.parse(answer)
    return data.answer as string
  } catch {
    throw new AnswerSyntaxError(answer)
  }
}

function translateCommand(query: string) {
  return getAnswer({
    type: 'translate',
    query,
    os: getOSName(),
  })
}

function fixCommand(command: string, output: string) {
  return getAnswer({
    type: 'fix',
    command,
    error: output,
    os: getOSName(),
  })
}

function completeCommand(query: string) {
  return getAnswer({
    type: 'complete',
    query,
    os: getOSName(),
  })
}

export {
  access,
  AnswerSyntaxError,
  translateCommand,
  fixCommand,
  completeCommand,
}
