import { Anims, Sounds, Sprites } from "../../constants"
import { Game } from "../../scenes/Game"
import { debug } from "../../scripts/debug"

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
  private gameScene: Game
  private paddleLength: 1 | 2 | 3 = 2 // 1 = short; 2 = default; 3 = long
  private lengthChanging = false
  private canvasH: number
  private canvasW: number
  public cannons!: Phaser.Physics.Arcade.Group
  public bullets!: Phaser.Physics.Arcade.Group
  public holdBallStubs!: Phaser.Physics.Arcade.Group
  public holdBallBolt!: Phaser.GameObjects.Image
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound
  }

  constructor(
    scene: Game,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame)
    this.gameScene = scene
    this.canvasH = scene.scale.height
    this.canvasW = scene.scale.width
  }

  //////////////////////////////////////////////////////////////
  ////// INIT
  init() {
    this.x = this.canvasW / 2
    this.y = this.canvasH - 30
    this.setInteractive()
    this.setImmovable(true)
    this.setCollideWorldBounds(true)
    this.play(Anims.defaultPaddle)
    this.setSize(this.frame.width, 20)
    if (this.gameScene.allowMouseInput) this.scene.input.on("pointermove", this.handleInput, this)
    // add empty cannon and bullet groups
    this.cannons = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    })
    this.bullets = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 6,
      createCallback: (go) => {
        this.scene.time.delayedCall(1500, () => go.destroy())
      },
    })
    // add empty hold ball stubs
    this.holdBallStubs = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image
    })
    this.initSounds()
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update() {
    const { x: paddleX, y: paddleY } = this.body!.position
    const paddleW = this.width
    if (this.holdBallStubs.getLength()) this.recalcHoldBallPos(paddleX, paddleY, paddleW)
    if (this.cannons.getLength()) this.recalcCannonsPos(paddleX, paddleY, paddleW)
    this.setVelocity(0)
    if (!this.gameScene.allowMouseInput) {
      const { left, right } = this.gameScene.keys
      if (left?.isDown && paddleX > 0) this.setVelocityX(-1000)
      else if (right?.isDown && paddleX+paddleW < this.canvasW) this.setVelocityX(1000)
    }
  }

  recalcHoldBallPos(paddleX:number, paddleY:number, paddleW:number ) {
    const xL = paddleX + 15
    const xR = paddleX + paddleW - 16
    const y = paddleY - 6
    this.holdBallStubs.children.each((child, i) => {
      const stub = child as Phaser.Physics.Arcade.Sprite
      if (i === 0) stub.setPosition(xL, y)
      if (i === 1) stub.setPosition(xR, y)
      return true
    })
    this.holdBallBolt.setPosition(paddleX + paddleW/2, paddleY - 10)
    if (this.lengthChanging) this.adjustBoltCrop()
  }

  recalcCannonsPos(paddleX:number, paddleY:number, paddleW:number) {
    const xL = paddleX + 15
    const xR = paddleX + paddleW - 16
    const y = paddleY - 4
    this.cannons.children.each((child, i) => {
      const cannon = child as Phaser.Physics.Arcade.Sprite
      if (i === 0) cannon.setPosition(xL, y)
      if (i === 1) cannon.setPosition(xR, y)
      return true
    })
  }

  //////////////////////////////////////////////////////////////
  ////// INITIALIZE SOUNDS
  initSounds() {
    this.sounds = {
      reload: this.scene.sound.add(Sounds.reload, { loop: false }),
      shot: this.scene.sound.add(Sounds.shot, { loop: false, volume: 0.3 }),
      expand: this.scene.sound.add(Sounds.expand, { loop: false }),
      shrink: this.scene.sound.add(Sounds.shrink, { loop: false }),
    }
  }

  //////////////////////////////////////////////////////////////
  ////// RESET PADDLE (POSITION, SIZE, REMOVES POWERUPS)
  reset() {
    this.x = this.canvasW / 2
    this.play(Anims.defaultPaddle)
    this.setSize(this.frame.width, 20)
    this.paddleLength = 2

    if (this.holdBallStubs.getLength()) this.removeBallHolder()
    if (this.cannons.getLength()) this.removeCannons()
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE PADDLE MOVE (MOUSE)
  handleInput(pointer: Phaser.Input.Pointer) {
    const paddlePosition =
      pointer.x > this.canvasW - this.width / 2
        ? this.canvasW - this.width / 2
        : pointer.x < this.width / 2
        ? this.width / 2
        : pointer.x
    this.x = paddlePosition || this.canvasW / 2
  }

  //////////////////////////////////////////////////////////////
  ////// CHANGE SIZE
  expand() {
    if (this.paddleLength === 3) return
    this.lengthChanging = true
    this.sounds.expand.play()
    if (this.paddleLength === 2) {
      this.play(Anims.paddleGetsLonger2)
      this.on("animationcomplete", () => {
        this.play(Anims.longPaddle)
        this.setSize(this.frame.width, 20)
        this.lengthChanging = false
      })
    }
    if (this.paddleLength === 1) {
      this.play(Anims.paddleGetsLonger1)
      this.on("animationcomplete", () => {
        this.play(Anims.defaultPaddle)
        this.setSize(this.frame.width, 20)
        this.lengthChanging = false
      })
    }
    this.paddleLength++
  }
  shrink() {
    if (this.paddleLength === 1) return
    this.lengthChanging = true
    this.sounds.shrink.play()
    if (this.paddleLength === 2) {
      this.play(Anims.paddleGetsShorter1)
      this.on("animationcomplete", () => {
        this.play(Anims.shortPaddle)
        this.setSize(this.frame.width, 20)
        this.lengthChanging = false
      })
    }
    if (this.paddleLength === 3) {
      this.play(Anims.paddleGetsShorter2)
      this.on("animationcomplete", () => {
        this.play(Anims.defaultPaddle)
        this.setSize(this.frame.width, 20)
        this.lengthChanging = false
      })
    }
    this.paddleLength--
  }

  //////////////////////////////////////////////////////////////
  ////// ADD/REMOVE SHOOTER POWERUP
  addCannons() {
    if (this.cannons.getLength()) return
    this.sounds.reload.play()
    if (this.gameScene.allowMouseInput) this.scene.input.on("pointerdown", this.handleShoot, this)
    else this.gameScene.keys?.action?.on('down', this.handleShoot, this)
    this.cannons.get(this.x, this.y, Sprites.cannon)
    this.cannons.get(this.x, this.y, Sprites.cannon)
  }
  removeCannons() {
    this.cannons.clear(true, true)
    if (this.gameScene.allowMouseInput) this.scene.input.off("pointerdown", this.handleShoot, this)
    else this.gameScene.keys?.action?.off('down', this.handleShoot, this)
  }

  //////////////////////////////////////////////////////////////
  ////// ADD/REMOVE BALL HOLDER ART
  addBallHolder() {
    if (this.holdBallStubs.getLength()) return
    this.holdBallBolt = this.scene.add.sprite(this.x, this.y, Sprites.holdBallBolt)
      .setOrigin(0.5, 0.5)
      .play(Anims.holdBallBolt)
    this.adjustBoltCrop()
    this.holdBallStubs.get(this.x, this.y, Sprites.holdBallStub)
    this.holdBallStubs.get(this.x, this.y, Sprites.holdBallStub)
      .setScale(-1, 1)
  }
  removeBallHolder() {
    this.holdBallStubs.clear(true, true)
    this.holdBallBolt.destroy()
  }
  adjustBoltCrop() {
    // the visible portion of the bolt needs to change depending
    // on the length of the paddle 
    if (!this.holdBallBolt.active) return
    const cropWidth = this.width - 30
    const cropX = (this.holdBallBolt.width - cropWidth) / 2
    this.holdBallBolt.setCrop(cropX, 0, cropWidth, this.height)
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE SHOOT
  handleShoot() {
    if (this.bullets.countActive() >= 5) return
    this.cannons.children.each((child, i) => {
      (child as Phaser.Physics.Arcade.Sprite).play(Anims.shoot)
      return true
    })
    const cannonL = this.cannons.getChildren()[0] as Phaser.Physics.Arcade.Sprite
    const cannonR = this.cannons.getChildren()[1] as Phaser.Physics.Arcade.Sprite
    const lBullet = this.bullets.get(cannonL.x, cannonL.y, Sprites.bullet)
    lBullet.setVelocity(0, -550)
    lBullet.setDepth(-1)
    const rBullet = this.bullets.get(cannonR.x, cannonR.y, Sprites.bullet)
    rBullet.setVelocity(0, -550)
    rBullet.setDepth(-1)

    this.sounds.shot.play()
  }
}

export const createPaddle = function (scene: Game) {
  const paddle = new Paddle(scene, 0, 0, Sprites.paddle)
  scene.add.existing(paddle)
  scene.physics.world.enableBody(paddle, Phaser.Physics.Arcade.DYNAMIC_BODY)
  paddle.init()
  debug.cannons && paddle.addCannons()
  debug.holdBall && paddle.addBallHolder()
  debug.shortPaddle && paddle.shrink()
  debug.longPaddle && paddle.expand()
  return paddle
}
