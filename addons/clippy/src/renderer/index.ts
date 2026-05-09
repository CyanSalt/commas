import { initAgent } from 'clippyjs'
import * as agents from 'clippyjs/agents'
import * as commas from 'commas:api/renderer'

type Agent = Awaited<ReturnType<typeof initAgent>>

export default () => {

  const settings = commas.remote.useSettings()

  let currentAgent: Agent | undefined

  commas.app.effect(onInvalidate => {
    const name = settings['clippy.agent.name']
    if (agents[name]) {
      initAgent(agents[name]).then(agent => {
        currentAgent = agent
        agent.show(false)
        agent.play('Greeting')
      })
    }
    onInvalidate(() => {
      if (currentAgent) {
        currentAgent.dispose()
        currentAgent = undefined
      }
    })
  })

  commas.app.on('terminal.addons-loaded', () => {
    if (!currentAgent) return
    currentAgent.play('CheckingSomething')
  })

  commas.ipcRenderer.on('save', () => {
    if (!currentAgent) return
    currentAgent.play('Save')
  })

}
