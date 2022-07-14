/**
 * @param {string} [stdin]
 */
function writeContext(stdin) {
  process.stdout.end(JSON.stringify({
    argv: process.argv.slice(2),
    cwd: process.cwd(),
    stdin,
  }) + '\n')
}

if (process.stdin.isTTY) {
  writeContext()
} else {
  let data = ''
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk) {
      data += chunk.toString()
    } else {
      writeContext(data)
    }
  })
}
