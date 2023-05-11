const os = require('node:os')

process.stdout.write(JSON.stringify(process.versions) + os.EOL)
process.exit()
