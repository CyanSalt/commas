import * as fs from 'fs'
import type { Readable } from 'stream'
import type { ClientRequestConstructorOptions, IncomingMessage } from 'electron'
import { net } from 'electron'
import { getStream, until } from './helper'

type RequestOptions = string | ClientRequestConstructorOptions

async function request(options: RequestOptions) {
  const req = net.request(options)
  const sending = until(req, 'response', 'error')
  req.end()
  const [response] = await sending
  return response as IncomingMessage & Readable
}

async function requestJSON(options: RequestOptions) {
  const response = await request(options)
  const data = await getStream(response, 'utf8')
  return JSON.parse(data)
}

async function requestFile(options: RequestOptions, file: string) {
  const writeStream = fs.createWriteStream(file)
  await until(writeStream, 'open')
  const response = await request(options)
  response.pipe(writeStream)
  await until(writeStream, 'finish')
}

export {
  request,
  requestJSON,
  requestFile,
}
