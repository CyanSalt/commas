import * as fs from 'fs'
import * as path from 'path'

export default async function (dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(dir, entry.name))
}
