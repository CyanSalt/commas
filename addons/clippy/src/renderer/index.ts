import clippy from 'clippyjs'
import * as commas from 'commas:api/renderer'

interface ClippyAgent {
  _el: HTMLElement,
  show(fast?: boolean): boolean,
  hide(fast?: boolean, callback?: () => void): void,
  play(animation: string, timeout?: number, cb?: () => void): void,
  hasAnimation(animation: string): boolean,
}

export default () => {

  const settings = commas.remote.useSettings()

  const assetsPath = $computed(() => {
    const userAssetsPath = settings['clippy.assets.path']
    return userAssetsPath.endsWith('/') ? userAssetsPath : userAssetsPath + '/'
  })

  commas.app.effect(() => {
    commas.ui.addCSSFile(assetsPath + 'clippy.css')
  })

  let currentAgent: ClippyAgent | undefined

  commas.app.effect(onInvalidate => {
    const name = settings['clippy.agent.name']
    clippy.load(name, (agent: ClippyAgent) => {
      currentAgent = agent
      if (agent.hasAnimation('Greeting')) {
        agent.show(false)
        agent.play('Greeting')
      } else {
        agent.show()
      }
    }, undefined, assetsPath + 'agents/')
    onInvalidate(() => {
      if (currentAgent) {
        currentAgent.hide(false, () => {
          currentAgent!._el.remove()
        })
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
