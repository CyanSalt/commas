import * as fs from 'fs'
import type { Readable } from 'stream'
import { net } from 'electron'
import { until } from './helper'

export async function downloadFile(url: string, file: string) {
  const stream = fs.createWriteStream(file)
  await until(stream, 'open')
  const request = net.request(url)
  const sending = until(request, 'response', 'error')
  request.end()
  const [response] = await sending;
  (response as unknown as Readable).pipe(stream)
  await until(stream, 'finish')
}
