import type { Readable } from 'node:stream'
import type { ClientRequestConstructorOptions, IncomingMessage } from 'electron'
import { net } from 'electron'
import { until } from './helper'

type RequestOptions = string | ClientRequestConstructorOptions

interface RequestData {
  headers?: Record<string, string>,
  body?: string | Buffer | undefined,
}

async function request(options: RequestOptions, data?: RequestData) {
  const req = net.request(options)
  const sending = until(req, 'response', 'error')
  if (data) {
    const { headers = {}, body } = data
    Object.entries(headers).forEach(([key, value]) => {
      req.setHeader(key, value)
    })
    req.end(body)
  } else {
    req.end()
  }
  const [response] = await sending
  return response as IncomingMessage & Readable
}

export {
  request,
}
