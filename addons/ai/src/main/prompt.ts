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

function getCommand(query: string) {
  return chat(`I want you to translate my prompts to terminal commands. I will provide you with a prompt and I want you to answer with a command which I can run in the terminal. You should only reply with the terminal command and nothing else. Do not write explanations. Do not format the command in a code block. My operating system is ${getOSName()}. My prompt is: ${query}`)
}

export {
  getCommand,
}
