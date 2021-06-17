import * as fs from 'fs'
import type { Readable } from 'stream'
import { net } from 'electron'
import { oncea } from './helper'

export async function downloadFile(url: string, file: string) {
  const stream = fs.createWriteStream(file)
  await oncea(stream, 'open')
  const request = net.request(url)
  const sending = oncea(request, 'response', 'error')
  request.end()
  const [response] = await sending;
  (response as unknown as Readable).pipe(stream)
  await oncea(stream, 'finish')
}
