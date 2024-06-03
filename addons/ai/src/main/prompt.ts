import { chat } from './chat'

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

function stringifyQuestion(question: string) {
  return JSON.stringify({
    question,
    request: `answer in json like ${JSON.stringify({ answer: 'your answer here' })}`,
    jsonOnly: true,
    noDescriptions: true,
  })
}

function parseAnswer(message: string) {
  const raw = message.trim().replace(/^```\S*\n(.+)```$/s, '$1').replace(/^`(.+)`$/, '$1')
  try {
    const { answer } = JSON.parse(raw)
    return answer
  } catch {
    return raw
  }
}

async function getCommand(query: string) {
  const answer = await chat(stringifyQuestion(`Translate my prompt to one terminal command. My operating system is ${getOSName()}. My prompt is: ${query}`))
  return parseAnswer(answer)
}

async function getDoctorCommand(command: string, output: string) {
  const answer = await chat(stringifyQuestion(`Fix the error in my command with one new terminal command. My operating system is ${getOSName()}. The error command is: \`${command}\`. Its output is: \`${output}\``))
  return parseAnswer(answer)
}

export {
  getCommand,
  getDoctorCommand,
}
