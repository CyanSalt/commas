const $require = require('node:module').createRequire(process.env.COMMAS_MAIN_FILE)
const os = require('node:os')
const readline = require('node:readline')

/** @type {{ default: import('node-ipc') }} */
const { default: ipc } = $require('@achrinza/node-ipc')

/**
 * @returns {Promise<string>}
 */
async function readInput() {
  if (process.stdin.isTTY) {
    return undefined
  }
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read()
      if (chunk) {
        data += chunk.toString()
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * @param {string} id
 */
function connectServer(id) {
  return new Promise((resolve) => {
    ipc.connectTo(id, () => {
      ipc.of[id].on('connect', () => {
        resolve(ipc.of[id])
      })
      ipc.of[id].on('end', (data) => {
        ipc.disconnect(id)
      })
    })
  })
}

/**
 * @param {string} query
 * @returns {Promise<string>}
 */
function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer)
      rl.close()
    })
  })
}

async function connect() {
  const [stdin, server] = await Promise.all([
    readInput(),
    connectServer(process.env.COMMAS_MAIN_PID),
  ])
  let output = false
  server.on('data', async (data) => {
    process.stdout.write(data)
    output = true
  })
  server.on('pause', async (data) => {
    const answer = await ask(data)
    server.emit('resume', answer)
  })
  server.on('error', (data) => {
    process.stderr.write(data)
    output = true
  })
  server.on('end', (exitCode) => {
    process.exitCode = exitCode
    if (output) {
      process.stdout.write(os.EOL)
    }
  })
  server.emit('request', {
    sender: Number(process.env.COMMAS_SENDER_ID),
    pid: process.pid,
    ppid: process.ppid,
    argv: process.argv.slice(2),
    cwd: process.cwd(),
    stdin,
  })
}

ipc.config.appspace = 'ipc.commas.'
ipc.config.id = String(process.pid)
ipc.config.silent = true
connect()
