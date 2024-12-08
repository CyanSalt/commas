import type { OAuthToken } from '@coze/api'
import { ChatEventType, COZE_CN_BASE_URL, CozeAPI, getPKCEAuthenticationUrl, getPKCEOAuthToken, refreshOAuthToken, RoleType } from '@coze/api'
import * as commas from 'commas:api/main'

const CLIENT_ID = '88988664625581608245457445089829.app.coze'
const BOT_ID = '7445173967130066979'

let status = $ref(false)

function useAIStatus() {
  return $$(status)
}

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
    this.stderr = commas.i18n.translate('Please complete the authorization in your browser and try again.#!ai.1')
  }
}

const loadingAccessTokenDataState = Promise.withResolvers<void>()

let currentAccessTokenData = $(commas.file.useJSONFile<OAuthToken | undefined>(commas.file.userFile('ai.json'), undefined, {
  onTrigger: () => {
    loadingAccessTokenDataState.resolve()
  },
}))

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
  status = true
  return data
}

async function loadAccessToken() {
  if (!currentAccessTokenData) {
    throw new AccessTokenError()
  }
  if (Date.now() < currentAccessTokenData.expires_in * 1000) {
    return currentAccessTokenData.access_token
  } else {
    const refreshed = await refreshOAuthToken({
      clientId: CLIENT_ID,
      refreshToken: currentAccessTokenData.refresh_token,
      baseURL: COZE_CN_BASE_URL,
    })
    // TODO: throw if refresh token expired
    currentAccessTokenData = refreshed
    status = true
    return refreshed.access_token
  }
}

async function getAccessToken() {
  await loadingAccessTokenDataState.promise
  const token = await loadAccessToken()
  status = true
  return token
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
  useAIStatus,
  getAuthorizationURL,
  resolveAuthorization,
  getAccessToken,
  chat,
  AccessTokenError,
}
