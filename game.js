let game = {
  ctx: null,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },
  blocks: [],
  rows: 4,
  cols: 8,
  ball: {
    x: 320,
    y: 280,
    width: 20,
    height: 20,
  },
  platform: {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    move() {
      this.dx && (this.x += this.dx)
    },
  },
  init: function () {
    this.ctx = document.getElementById('mycanvas').getContext('2d')
  },
  setEvents: function () {
    window.addEventListener('keydown', (e) => {
      e.code === 'ArrowLeft' && (this.platform.dx = -this.platform.velocity)
      e.code === 'ArrowRight' && (this.platform.dx = this.platform.velocity)
    })
    window.addEventListener('keyup', (e) => {
      this.platform.dx = 0
    })
  },
  preload: async function () {
    for (let key in this.sprites) {
      this.sprites[key] = new Image()
      this.sprites[key].src = `img/${key}.png`
      await this.sprites[key].decode()
      console.log(`${this.sprites[key]} width: ${this.sprites[key].width}`)
    }
  },
  create: function () {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          x: 64 * col + 65,
          y: 24 * row + 35,
        })
      }
    }
  },
  render: function () {
    this.ctx.drawImage(this.sprites.background, 0, 0)
    this.ctx.drawImage(
      this.sprites.ball,
      0,
      0,
      this.ball.width,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      this.ball.width,
      this.ball.height
    )
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y)
    for (let block of this.blocks) {
      this.ctx.drawImage(this.sprites.block, block.x, block.y)
    }
  },
  update: function () {
    this.platform.move()
  },
  run: function () {
    window.requestAnimationFrame(() => {
      this.update()
      this.render()
      this.run()
    })
  },
  start: async function () {
    this.init()
    this.setEvents()
    await this.preload()
    this.create()
    this.run()
  },
}

window.addEventListener('load', () => {
  game.start()
})
