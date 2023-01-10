const $require = require('module').createRequire(process.env.COMMAS_MAIN_FILE)

/** @type {{ default: import('node-ipc') }} */
const { default: ipc } = $require('node-ipc')

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

async function connect() {
  const [stdin, server] = await Promise.all([
    readInput(),
    connectServer('commas-ipc-server'),
  ])
  let output = false
  server.on('data', (data) => {
    process.stdout.write(data)
    output = true
  })
  server.on('error', (data) => {
    process.stderr.write(data)
    output = true
  })
  server.on('end', (exitCode) => {
    process.exitCode = exitCode
    if (output) {
      process.stdout.write('\n')
    }
  })
  server.emit('request', {
    sender: Number(process.env.COMMAS_SENDER_ID),
    ppid: process.ppid,
    argv: process.argv.slice(2),
    cwd: process.cwd(),
    stdin,
  })
}

ipc.config.id = 'commas-ipc-client'
ipc.config.silent = true
connect()
