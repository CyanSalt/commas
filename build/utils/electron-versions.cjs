const os = require('os')

process.stdout.write(JSON.stringify(process.versions) + os.EOL)
process.exit()
