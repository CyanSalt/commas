import { execa } from '../../main/utils/helper'
import { downloadFile } from '../../main/utils/net'
import { sudoExecute } from '../../main/utils/privilege'
import { loginExecute } from '../../main/utils/shell'

export {
  execa as execute,
  downloadFile,
  sudoExecute,
  loginExecute,
}
