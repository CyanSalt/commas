import * as commas from 'commas:api/main'
import OpenAI from 'openai'

let status = $ref(false)

function useAIStatus() {
  return $$(status)
}

const settings = commas.settings.useSettings()

const client = $computed(() => {
  return new OpenAI({
    baseURL: settings['ai.provider.baseURL'],
    apiKey: settings['ai.provider.apiKey'],
  })
})

async function* chat(prompt: string, message: string) {
  const stream = await client.chat.completions.create({
    model: settings['ai.provider.modelID'] ?? 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    stream: true,
  })
  for await (const part of stream) {
    const content = part.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

export {
  useAIStatus,
  chat,
}
