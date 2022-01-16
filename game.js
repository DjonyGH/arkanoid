let game = {
  ctx: null,
  sprites: {
    background: null,
    ball: null,
    platform: null,
  },
  init: function () {
    this.ctx = document.getElementById('mycanvas').getContext('2d')
  },
  preload: async function () {
    for (let key in this.sprites) {
      this.sprites[key] = new Image()
      this.sprites[key].src = `img/${key}.png`
      await this.sprites[key].decode()
      console.log(`${this.sprites[key]} width: ${this.sprites[key].width}`)
    }
  },
  run: function () {
    window.requestAnimationFrame(() => {
      this.ctx.drawImage(this.sprites.background, 0, 0)
      this.ctx.drawImage(this.sprites.ball, 0, 0)
      this.ctx.drawImage(this.sprites.platform, 0, 0)
    })
  },
  start: async function () {
    this.init()
    await this.preload()
    this.run()
  },
}

window.addEventListener('load', () => {
  game.start()
})
