import { execa } from '../../src/main/utils/helper'
import { downloadFile } from '../../src/main/utils/net'
import { sudoExecute } from '../../src/main/utils/privilege'
import { loginExecute } from '../../src/main/utils/shell'

export {
  execa as execute,
  downloadFile,
  sudoExecute,
  loginExecute,
}
