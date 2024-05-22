import * as commas from 'commas:api/main'

interface AccessToken {
  access_token: string,
  expires_in: number,
  expires_from: number,
  error: string,
  error_description: string,
}

async function getAccessTokenFromServer(): Promise<AccessToken> {
  const params = {
    expires_from: Date.now(),
  }
  const response = await commas.shell.requestJSON({
    method: 'POST',
    url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${process.env.__COMMAS_AI_API_KEY__}&client_secret=${process.env.__COMMAS_AI_SECRET_KEY__}`,
  })
  if (response.error) {
    throw Object.assign(new Error(response.error_description), response)
  }
  return {
    ...response,
    ...params,
  }
}

let accessTokenFromFileSystem = $(commas.file.useJSONFile<AccessToken | undefined>(commas.file.userFile('ai.json')))

async function getAccessTokenFromFileSystem() {
  if (accessTokenFromFileSystem) {
    const token = accessTokenFromFileSystem
    if (Date.now() < token.expires_from + token.expires_in * 1000) {
      return token
    }
  }
  const token = await getAccessTokenFromServer()
  accessTokenFromFileSystem = token
  return token
}

async function getAccessToken() {
  const token = await getAccessTokenFromFileSystem()
  return token.access_token
}

async function chat(message: string) {
  const token = await getAccessToken()
  const response = await commas.shell.requestJSON({
    method: 'POST',
    url: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-speed-128k?access_token=${token}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }, {
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  })
  return response.result as string
}

export {
  chat,
}
