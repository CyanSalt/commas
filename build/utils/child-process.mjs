import * as childProcess from 'node:child_process'
import * as util from 'node:util'

export const execa = util.promisify(childProcess.exec)
