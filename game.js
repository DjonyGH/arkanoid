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
    velocity: 3,
    dx: 0,
    dy: 0,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    start() {
      this.dy = -this.velocity
      this.dx = game.random(-this.velocity, this.velocity)
    },
    move() {
      this.dy && (this.y += this.dy)
      this.dx && (this.x += this.dx)
    },
    collide(element) {
      const x = this.x + this.dx
      const y = this.y + this.dy
      return (
        x + this.width > element.x &&
        x < element.x + element.width &&
        y < element.y + element.height &&
        y + this.height > element.y
      )
    },
    bumpBlock(block) {
      this.dy = -this.dy
      block.active = false
    },
    bumpPlatform(platform) {
      this.dy = -this.dy
      const touchX = this.x + this.width / 2
      this.dx = this.dx + platform.getTouchOfffset(touchX)
    },
  },
  platform: {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    width: 100,
    height: 14,
    start(direction) {
      direction === 'ArrowLeft' && (this.dx = -this.velocity)
      direction === 'ArrowRight' && (this.dx = this.velocity)
    },
    stop() {
      this.dx = 0
    },
    move() {
      this.dx && (this.x += this.dx)
      game.ball.y === 280 && (game.ball.x += this.dx)
    },
    getTouchOfffset(x) {
      const offset = x - this.x
      if (offset > 20 && offset < 80) return 0
      if (offset < 20) return -2
      if (offset > 80) return 2
    },
  },
  random: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },
  init: function () {
    this.ctx = document.getElementById('mycanvas').getContext('2d')
  },
  setEvents: function () {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') this.platform.start(e.code)
      if (e.code === 'Space') this.ball.start()
    })
    window.addEventListener('keyup', () => {
      this.platform.stop()
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
          active: true,
          width: 60,
          height: 20,
          x: 64 * col + 65,
          y: 24 * row + 35,
        })
      }
    }
  },
  render: function () {
    this.ctx.clearRect(0, 0, 640, 360)
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
      block.active && this.ctx.drawImage(this.sprites.block, block.x, block.y)
    }
  },
  update: function () {
    this.platform.move()
    this.ball.move()
    for (let block of this.blocks) {
      this.ball.collide(block) && block.active && this.ball.bumpBlock(block)
    }
    this.ball.collide(this.platform) && this.ball.bumpPlatform(this.platform)
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
