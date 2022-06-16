import * as childProcess from 'child_process'
import * as util from 'util'

export const execa = util.promisify(childProcess.exec)
