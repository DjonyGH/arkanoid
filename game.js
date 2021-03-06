const loadAudio = (src) =>
  new Promise((resolve) => {
    const audio = new Audio(src)
    audio.addEventListener('canplaythrough', () => {
      resolve(audio)
    })
  })

let game = {
  ctx: null,
  running: true,
  width: 640,
  height: 360,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },
  sounds: {
    bump: null,
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
      game.sounds.bump.play()
    },
    bumpPlatform(platform) {
      if (platform.dx) {
        this.x += platform.dx
      }
      if (this.dy > 0) {
        this.dy = -this.velocity
        const touchX = this.x + this.width / 2
        this.dx = this.dx + platform.getTouchOfffset(touchX)
      }
    },
    async collideWalls() {
      const x = this.x + this.dx
      const y = this.y + this.dy

      const ballLeftSide = x
      const ballRightSide = x + this.width
      const ballTopSide = y
      const ballBottomSide = y + this.height

      const worldLeftSide = 0
      const worldRightSide = game.width
      const worldTopSide = 0
      const worldBottomSide = game.height

      if (ballLeftSide < worldLeftSide) {
        this.x = 0
        this.dx = this.velocity
      } else if (ballRightSide > worldRightSide) {
        this.x = worldRightSide - this.width
        this.dx = -this.velocity
      } else if (ballTopSide < worldTopSide) {
        this.y = 0
        this.dy = this.velocity
      } else if (ballBottomSide > worldBottomSide) {
        console.log('game over')
        game.running = false
        const isOk = await confirm('GAME OVER')
        isOk && window.location.reload()
      }
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
    collideWalls() {
      const x = this.x + this.dx

      const platformLeftSide = x
      const platformRightSide = x + this.width

      const worldLeftSide = 0
      const worldRightSide = game.width

      if (platformLeftSide < worldLeftSide || platformRightSide > worldRightSide) {
        this.dx = 0
      }
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
    for (let key in this.sounds) {
      this.sounds[key] = await loadAudio(`sounds/${key}.mp3`)
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
    this.collideBlocks()
    this.collidePlatform()
    this.ball.collideWalls()
    this.platform.collideWalls()
    this.platform.move()
    this.ball.move()
  },
  collideBlocks: async function () {
    for (let block of this.blocks) {
      this.ball.collide(block) && block.active && this.ball.bumpBlock(block)
    }
    const activeBlocks = this.blocks.filter((block) => block.active)
    if (!activeBlocks.length) {
      this.running = false
      const isOk = await confirm('YOU ARE WIN')
      isOk && window.location.reload()
    }
  },
  collidePlatform: function () {
    this.ball.collide(this.platform) && this.ball.bumpPlatform(this.platform)
  },
  run: function () {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update()
        this.render()
        this.run()
      })
    }
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
