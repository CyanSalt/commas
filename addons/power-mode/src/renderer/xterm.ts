import type { IDisposable, ITerminalAddon, Terminal } from 'xterm'

interface Particle {
  x: number,
  y: number,
  alpha: number,
  velocity: {
    x: number,
    y: number,
  },
}

export class PowerMode implements ITerminalAddon {

  declare xterm: Terminal
  declare _canvas: HTMLCanvasElement
  declare _canvasContext: CanvasRenderingContext2D
  declare _animation: number | null
  declare _particles: Particle[]
  declare _disposables: IDisposable[]

  constructor() {
    this._disposables = []
  }

  activate(xterm: Terminal) {
    this.xterm = xterm
    this.createCanvas()
    this._disposables.push(xterm.onKey(this.handleTermKey.bind(this)))
    this._disposables.push(xterm.onResize(this.handleTermResize.bind(this)))
  }

  dispose() {
    this._disposables.forEach(disposable => {
      disposable.dispose()
    })
    this._disposables = []
    this._canvas.remove()
  }

  handleTermKey() {
    this.shake()
    this.spawnParticles()
  }

  handleTermResize() {
    const dimensions = this.xterm['_core']._renderService.dimensions.css.canvas
    this._canvas.width = dimensions.width
    this._canvas.height = dimensions.height
  }

  shake() {
    if (!this.xterm.element) return
    const intensity = 1 + 2 * Math.random()
    const x = intensity * (Math.random() > 0.5 ? -1 : 1)
    const y = intensity * (Math.random() > 0.5 ? -1 : 1)
    this.xterm.element.animate([
      { transform: `translate3d(${x}px, ${y}px, 0)` },
    ], {
      duration: 75,
      direction: 'alternate',
    })
  }

  createCanvas() {
    const canvas = document.createElement('canvas')
    const dimensions = this.xterm['_core']._renderService.dimensions.css.canvas
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      pointerEvents: 'none',
    })
    this.xterm['_core'].screenElement.append(canvas)
    this._canvas = canvas
    this._canvasContext = canvas.getContext('2d')!
    this._particles = []
  }

  spawnParticles() {
    const cell = this.xterm['_core']._renderService.dimensions.css.cell
    const { cursorX, cursorY } = this.xterm.buffer.active
    const x = (cursorX + 0.5) * cell.width
    const y = (cursorY + 0.5) * cell.height
    const count = 5 + Math.round(Math.random() * 5)
    for (let i = 0; i < count; i += 1) {
      const velocity = {
        x: -1.5 + Math.random() * 3,
        y: -3.5 + Math.random() * 2,
      }
      this._particles.push({ x, y, alpha: 1, velocity })
    }
    if (!this._animation) {
      this._animation = requestAnimationFrame(this.drawFrame.bind(this))
    }
  }

  drawFrame() {
    this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height)
    const theme = this.xterm.options.theme!
    this._particles.forEach(particle => {
      particle.velocity.y += 0.075 // gravity
      particle.x += particle.velocity.x
      particle.y += particle.velocity.y
      particle.alpha *= 0.96 // fadeout
      this._canvasContext.globalAlpha = particle.alpha
      this._canvasContext.fillStyle = theme.foreground!
      this._canvasContext.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), 3, 3)
    })
    const length = this._particles.length
    this._particles = this._particles.filter(particle => particle.alpha > 0.1)
    if (this._animation) {
      cancelAnimationFrame(this._animation)
      this._animation = null
    }
    if (length) {
      this._animation = requestAnimationFrame(this.drawFrame.bind(this))
    }
  }

}
