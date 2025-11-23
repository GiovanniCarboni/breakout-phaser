import { Anims, Sounds, Sprites } from "../../constants"
import Paddle from "../Paddle/Paddle"
import Brick from "../Brick/Brick"
import { debug } from "../../scripts/debug"
import { Game } from "../../scenes/Game"

export default class Ball extends Phaser.Physics.Arcade.Sprite {
  private gameScene: Game
  speedIncrement = 20
  isIgnited = false
  private isSpedUp = false
  private isToBeHeld = false
  private heldPositionPercOnPaddle: number | null = null // stores the position (% of paddle width) on the paddle when the ball was last held
  onSlowDownArea = false
  slowDownArea!: Phaser.GameObjects.Arc
  speed = 600
  private isMoving: boolean
  private startPosition
  private paddle: Paddle
  private ballIgnitionSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound

  constructor(
    scene: Game,
    x: number,
    y: number,
    paddle: Paddle,
  ) {
    super(scene, x, y, Sprites.ball)
    this.gameScene = scene
    this.paddle = paddle
    this.startPosition = { x: scene.scale.width / 2, y: scene.scale.height - 40 }

    this.isMoving = false
    this.setScale(1.5, 1.5)
  }

  //////////////////////////////////////////////////////////////
  ////// INIT
  init() {
    this.y = this.startPosition.y - this.height
    this.setCollideWorldBounds(true)
    this.setBounce(1, 1)
    this.initSlowDownArea()
    this.ballIgnitionSound = this.scene.sound.add(Sounds.ballIgnition, {
      loop: false,
    })
    this.setData("isSlow", false)
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update(bricks: Phaser.GameObjects.GameObject[]) {
    if (!this.isMoving) {
      if (this.isToBeHeld && this.heldPositionPercOnPaddle) this.body?.reset(this.calcBallXBasedOnPaddlePerc(), this.paddle.y - 22)
      else this.body?.reset(this.paddle.x, this.paddle.y - 22)
      return
    }

    // slow down approaching last brick
    if (bricks.filter((brick) => brick.getData("type") !== "metal").length === 1) {
      if (!this.slowDownArea.getData("created")) {
        const lastBrick = bricks.find(
          (brick) => brick.getData("type") !== "metal"
        ) as Brick
        this.slowDownArea.setX(lastBrick.x)
        this.slowDownArea.setY(lastBrick.y)
        this.slowDownArea.setData("created", true)
      }
    } else if (this.slowDownArea.getData("created")) {
      this.slowDownArea.setX(-200)
      this.slowDownArea.setY(-200)
      this.slowDownArea.setData("created", false)
    }

    // set ball speed
    if (this.onSlowDownArea && this.getData("isSlow") === false) {
      this.setData("previousSpeed", this.speed)
      this.setSpeed(200)
      this.setData("isSlow", true)
    }
    if (!this.onSlowDownArea && this.getData("isSlow") === true) {
      this.setSpeed(this.getData("previousSpeed"))
      this.setData("isSlow", false)
    }
    this.onSlowDownArea = false

    // if ball ignited
    if (this.isIgnited) {
      this.addFireSparkles()
      // adjust angle based on trajectory
      if (this.isMoving) {
        const angle = Phaser.Math.Angle.BetweenPoints(this, {
          x: this.x + this.body?.velocity.x!,
          y: this.y + this.body?.velocity.y!,
        })
        this.setAngle(Phaser.Math.RadToDeg(angle) - 90)
      }
    }
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  destroy() {
    this.removeEvents()
  }

  //////////////////////////////////////////////////////////////
  ////// START BALL ON CLICK/ACTION BTN
  startOnInput(basedOnPositionOnPaddle = false) {
    if (this.gameScene.allowMouseInput) this.gameScene.input.once("pointerdown", () => this.start(basedOnPositionOnPaddle), this)
    else this.gameScene.keys?.action?.once('down', () => this.start(basedOnPositionOnPaddle), this)
  }
  removeEvents() {
    if (this.gameScene.allowMouseInput) this.gameScene.input.off("pointerdown", this.start)
    else this.gameScene.keys?.action?.off('down', this.start)
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE SLOW DOWN AREA
  initSlowDownArea() {
    this.slowDownArea = this.scene.add.circle(-200, -200, 50)
    this.scene.physics.world.enableBody(this.slowDownArea, Phaser.Physics.Arcade.DYNAMIC_BODY)
  }

  //////////////////////////////////////////////////////////////
  ////// START BALL MOVEMENT
  start(basedOnPositionOnPaddle: boolean) {
    this.speed = 600
    if (basedOnPositionOnPaddle && this.heldPositionPercOnPaddle) this.setDirectionBasedOnPaddle()
    else this.setDegDirection(70)
    this.isMoving = true
  }

  //////////////////////////////////////////////////////////////
  ////// HOLD BALL
  setIsToBeHeld(toBeHeld: boolean) { 
    this.isToBeHeld = toBeHeld
  }

  getIsToBeHeld() {
    return this.isToBeHeld
  }

  hold() {
    this.heldPositionPercOnPaddle = this.calcBallPositionPercOnPaddle()
    this.gameScene.tweens.add({
      targets: this,
      x: this.calcBallXBasedOnPaddlePerc(),
      y: this.paddle.y - 22,
      ease: "Sine.easeOut",
      duration: 30,
      onComplete: () => {
        this.stopMovement()
        this.startOnInput(true)
        this.setAngle(0)
      }
    }).play()
  }

  //////////////////////////////////////////////////////////////
  ////// CHANGE BALL DIRECTION
  setDirectionBasedOnPaddle() {
    const paddleX = this.paddle.x
    const diff = Math.abs(paddleX - this.x)
    if (this.x < paddleX) {
      const degree = 90 + (Math.ceil(diff) > 70 ? 70 : Math.ceil(diff))
      this.setDegDirection(degree)
      this.setSpeedOnInclPerc(this.calcInclinationPercentage(degree))
    } else if (this.x > paddleX) {
      const degree = 90 - (Math.ceil(diff) > 70 ? 70 : Math.ceil(diff))
      this.setDegDirection(degree)
      this.setSpeedOnInclPerc(this.calcInclinationPercentage(degree))
    } else {
      this.setDegDirection(100)
      this.setSpeedOnInclPerc(0)
    }
  }

  private setDegDirection(direction: number) {
    const rad = Phaser.Math.DegToRad(direction) 
    this.setVelocity(Math.cos(rad) * this.speed, Math.sin(-rad) * this.speed)
  }

  //////////////////////////////////////////////////////////////
  ////// CALCULATIONS
  private calcInclinationPercentage(degree: number) {
    const diff = Math.abs(degree - 90)
    return Math.ceil((diff / 90) * 100)
  }

  private calcBallPositionPercOnPaddle() {
    const { x, width } = this.paddle
    return ((this.x - (x - width/2)) / width) * 100
  }

  // calculates the ball x based on the percentage of the width of the paddle the ball should stay at
  private calcBallXBasedOnPaddlePerc() {
    const padding = 30
    const pixelsOnPaddle = Phaser.Math.Clamp((this.heldPositionPercOnPaddle! / 100) * this.paddle.width, padding, this.paddle.width - padding)
    return this.paddle.x - this.paddle.width / 2 + pixelsOnPaddle
  }

  //////////////////////////////////////////////////////////////
  ////// CHANGE BALL SPEED
  private setSpeed(speed: number) {
    let x = this.body?.velocity.x! / this.speed
    let y = this.body?.velocity.y! / this.speed
    this.speed = speed
    x = x * speed
    y = y * speed
    this.setVelocity(x, y)
  }

  private setSpeedOnInclPerc(inclinationPercentage: number) {
    if (inclinationPercentage < 30 && this.speed > 750) {
      this.setSpeed(this.speed - 130)
    } else if (inclinationPercentage < 50 && this.speed < 1200 ) {
      this.setSpeed(this.speed + 50)
    } else if (inclinationPercentage < 70 && this.speed < 1350) {
      this.setSpeed(this.speed + 100)
    } else if (this.speed < 1600) {
      this.setSpeed(this.speed + 210)
    }
  }

  speedUp() {
    if (this.isSpedUp) return
    this.setSpeed(1200)
    this.isSpedUp = true
  }

  incrementSpeed() {
    this.setSpeed(this.speed + this.speedIncrement)
  }

  //////////////////////////////////////////////////////////////
  ////// RESET BALL (POSITION, SPEED, TEXTURE)
  reset(x: number, y?: number) {
    // speed
    this.isMoving = false
    this.isIgnited = false
    this.isSpedUp = false
    this.heldPositionPercOnPaddle = null
    this.setIsToBeHeld(false)
    this.setVelocity(0)
    this.setAngle(0)
    // reset ball texture
    this.anims.stop()
    this.setTexture(Sprites.ball)
    // reset position
    this.body?.reset(x, y || this.startPosition.y - this.height)
  }

  //////////////////////////////////////////////////////////////
  ////// STOP BALL
  stopMovement() {
    this.setVelocity(0, 0)
    this.isMoving = false
  }

  //////////////////////////////////////////////////////////////
  ////// IGNITE BALL
  ignite() {
    if (this.isIgnited) return
    this.setScale(1.5, 1.5)
    this.isIgnited = true
    this.play(Anims.fireBall)
    this.ballIgnitionSound.play()
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE SMOKE
  createSmoke(x: number, y: number) {
    const smoke = this.scene.add.sprite(x, y, Sprites.smoke).play(Anims.smoke)
    smoke.setScale(1.5, 1.5)
    smoke.on("animationcomplete", () => smoke.destroy())
  }

  //////////////////////////////////////////////////////////////
  ////// ADD SPARKLES (IGNITED BALL ONLY)
  addFireSparkles() {
    if (!this.isMoving) return
    const randomValue = Math.ceil(Math.random() * 7) - 1
    const settings = [
      { position: [this.x, this.y], delay: 550 },
      { position: [this.x + 5, this.y -2], delay: 450 },
      { position: [this.x - 4, this.y - 3], delay: 250 }
    ]
    if (randomValue >= settings.length) return
    const [ x, y ] = settings[randomValue].position
    const delay = settings[randomValue].delay
    const sparkle = this.scene.add.sprite(x, y, Sprites.sparkle)
    this.scene.time.addEvent({ delay: Math.random() * delay, callback: () => sparkle.destroy() })
  }

}

export const createBall = function (scene: Game, paddle: Paddle) {
  const ball = new Ball(scene, 0, 0, paddle)
  scene.add.existing(ball)
  scene.physics.world.enableBody(ball, Phaser.Physics.Arcade.DYNAMIC_BODY)
  ball.init()
  debug.fireBall && ball.ignite()
  debug.holdBall && ball.setIsToBeHeld(true)
  return ball
}
