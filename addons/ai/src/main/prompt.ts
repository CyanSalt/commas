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

function clean(answer: string) {
  return answer.trim().replace(/^`(.+)`$/, '$1')
}

async function getCommand(query: string) {
  const answer = await chat(`I want you to translate my prompts to terminal commands. I will provide you with a prompt and I want you to answer with a command which I can run in the terminal. You should only reply with the terminal command and nothing else. Do not write explanations. Do not format the command in a code block. My operating system is ${getOSName()}. My prompt is: ${query}`)
  return clean(answer)
}

async function getDoctorCommand(command: string, output: string) {
  const answer = await chat(`I encountered an error while executing a command on the command line and I need you to provide me with a new terminal command to fix the error. The error may be caused by the operating environment, or it may be a simple spelling error. I will provide you with the error command and its output, and I want you to answer with a command which I can run in the terminal. You should only reply with the terminal command and nothing else. Do not write explanations. Do not format the command in a code block. My operating system is ${getOSName()}. The error command is: \`${command}\`. Its output is: \`${output}\``)
  return clean(answer)
}

export {
  getCommand,
  getDoctorCommand,
}
