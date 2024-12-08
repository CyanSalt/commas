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

async function getAnswer(input: unknown) {
  const answer = await access(() => chat(JSON.stringify(input)))
  try {
    const data = JSON.parse(answer)
    return data.answer
  } catch {
    return answer
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

export {
  access,
  translateCommand,
  fixCommand,
}
