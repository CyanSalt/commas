import type { OAuthToken } from '@coze/api'
import { ChatEventType, COZE_CN_BASE_URL, CozeAPI, getPKCEAuthenticationUrl, getPKCEOAuthToken, refreshOAuthToken, RoleType } from '@coze/api'
import * as commas from 'commas:api/main'

const CLIENT_ID = '88988664625581608245457445089829.app.coze'
const BOT_ID = '7445173967130066979'

const verifiers = new Map<string, string>()

async function getAuthorizationURL(redirectURL: string) {
  const state = String(Math.random()).slice(2)
  const data = await getPKCEAuthenticationUrl({
    clientId: CLIENT_ID,
    redirectUrl: redirectURL,
    baseURL: COZE_CN_BASE_URL,
    state,
  })
  verifiers.set(state, data.codeVerifier)
  return data.url
}

class AccessTokenError extends Error {
  stderr: string
  constructor() {
    super('Invalid access token')
    this.stderr = commas.i18n.translate('Please complete the authorization in your browser.#!ai.2')
  }
}

let currentAccessTokenData = $(commas.file.useJSONFile<OAuthToken | undefined>(commas.file.userFile('ai.json')))

async function resolveAuthorization(code: string, state: string, redirectURL: string) {
  const verifier = verifiers.get(state)
  if (!verifier) return undefined
  const data = await getPKCEOAuthToken({
    clientId: CLIENT_ID,
    redirectUrl: redirectURL,
    baseURL: COZE_CN_BASE_URL,
    code,
    codeVerifier: verifier,
  })
  currentAccessTokenData = data
  return data
}

async function getAccessToken() {
  if (!currentAccessTokenData) {
    throw new AccessTokenError()
  }
  if (Date.now() * 1000 < currentAccessTokenData.expires_in) {
    return currentAccessTokenData.access_token
  } else {
    const refreshed = await refreshOAuthToken({
      clientId: CLIENT_ID,
      refreshToken: currentAccessTokenData.refresh_token,
      baseURL: COZE_CN_BASE_URL,
    })
    // TODO: throw if refresh token expired
    currentAccessTokenData = refreshed
    return refreshed.access_token
  }
}

async function chat(message: string) {
  const token = await getAccessToken()
  const client = new CozeAPI({
    baseURL: COZE_CN_BASE_URL,
    token,
  })
  const stream = client.chat.stream({
    bot_id: BOT_ID,
    additional_messages: [
      {
        role: RoleType.User,
        content: message,
        content_type: 'text',
      },
    ],
  })
  let answer = ''
  for await (const part of stream) {
    if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
      answer += part.data.content
    }
  }
  return answer
}

export {
  getAuthorizationURL,
  resolveAuthorization,
  getAccessToken,
  chat,
  AccessTokenError,
}
