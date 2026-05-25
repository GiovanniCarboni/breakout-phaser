import { sceneEvents } from "../events/EventCenter"
import Ball, { createBall } from "../components/Ball/Ball"
import Paddle, { createPaddle } from "../components/Paddle/Paddle"
import Bricks, { createBricks } from "../components/Brick/Bricks"
import Powerup, { createPowerup } from "../components/Powerup/Powerup"
import Powerups, { createPowerups } from "../components/Powerup/Powerups"
import { Sprites, Events, Sounds, Scenes, Anims, StorageKeys } from "../constants"
import { transition } from "../anims/SceneTransitions"
import { storage } from "../utils/gneral"
import { debug } from "../scripts/debug"
import Brick from "../components/Brick/Brick"

export class Game extends Phaser.Scene {
  private lastLevel = 5
  private isCustom: boolean = false
  private topEdge!: Phaser.Physics.Arcade.Image
  private ball!: Ball
  private paddle!: Paddle
  private bricks!: Bricks
  private powerups!: Powerups
  private level?: number
  private lives!: number
  private isStageCleared = false
  private fpsText: Phaser.GameObjects.Text | null = null
  public allowMouseInput = true
  public keys!: {
    left: Phaser.Input.Keyboard.Key | null,
    right: Phaser.Input.Keyboard.Key | null,
    action: Phaser.Input.Keyboard.Key | null
  }
  sounds!: Record<string, Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound>
  canvasW!: number
  canvasH!: number

  constructor() {
    super({
      key: Scenes.game,
      physics: {
        default: "arcade",
        arcade: {},
      },
    })
  }

  //////////////////////////////////////////////////////////////
  ////// INIT
  init({ isCustom, template }: { isCustom: boolean; template: number[][] }) {
    if (isCustom) {
      this.bricks = createBricks(this, undefined, template)
      this.isCustom = true
      sceneEvents.emit(Events.levelChanged, 0)
    } else if (!isCustom) {
      const debugLevel = Number(debug.level) > this.lastLevel ? this.lastLevel : Number(debug.level)
      this.level = debugLevel || 1
      this.isCustom = false
      sceneEvents.emit(Events.levelChanged, this.level)
      this.bricks = createBricks(this, this.level)
    }
    if (debug.revealInvisibleBricks) this.bricks.revealInvisible()
    this.initControls()
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE
  create() {
    transition("fadeIn", this)

    if (debug.showFps) this.fpsText = this.add.text(14, 60, "FPS", {
      color: "#4ee44e"
    })

    this.cameras.main.setBackgroundColor("#110702")

    this.canvasW = this.scale.width
    this.canvasH = this.scale.height

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH)
    this.physics.world.setBoundsCollision(true, true, true, false)

    //////////////////////////////////////////////////////////////
    ////// ADD SIDEBARS
    this.add.sprite(0, 0, Sprites.sideBar).setOrigin(0, 0).setDepth(1)
    this.add
      .sprite(this.canvasW, 0, Sprites.sideBar)
      .setOrigin(1, 0)
      .setDepth(1)

    //////////////////////////////////////////////////////////////
    ////// INIT ELEMENTS
    this.initSounds()
    this.initLives()
    this.paddle = createPaddle(this)
    this.ball = createBall(this, this.paddle)
    this.powerups = createPowerups(this)

    //////////////////////////////////////////////////////////////
    ////// MESSAGE IF CANT SAVE/PLAY
    this.topEdge = this.physics.add
      .image(0, 0, Sprites.headbar)
      .setOrigin(0, 0)
      .setImmovable(true)

    //////////////////////////////////////////////////////////////
    ////// ADD COLLIDERS
    this.addColliders()

    //////////////////////////////////////////////////////////////
    ////// START BALL ON CLICK
    new Array(Events.levelChanged, Events.livesChanged).forEach((e) => {
      sceneEvents.on(e, () => this.ball.startOnInput(), this)
    })
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update(_: number, dt: number) {
    if (debug.showFps) this.fpsText?.setText("FPS " + String(Math.floor(this.game.loop.actualFps)))

    const bricks = this.bricks.getChildren()

    this.ball.update(bricks)
    this.paddle.update()

    ////// BALL FALLS BELOW
    if (this.ball.y > this.canvasH + this.ball.height) {
      if (this.lives > 1) this.sounds.die.play()
      this.lives--
      this.setLives()
      this.ball.reset(this.paddle.x)
      this.paddle.reset()
      this.powerups.clear(undefined, true)
      this.bricks.poisonDrops.clear(true, true)
      this.bricks.shouldFall = false
    }

    ////// NO MORE LIVES
    if (this.lives < 1) {
      this.scene.stop()
      this.scene.launch(Scenes.gameOver, { isCustom: this.isCustom })
      this.ball.reset(this.paddle.x)
      this.paddle.reset()
      this.powerups.clear(undefined, true)
      return
    }

    ////// IF LEVEL IS CLEARED
    if (
      !bricks.some((brick) => !this.bricks.notMandatoryBricks.includes(brick.getData("type"))) &&
      !this.isStageCleared
    ) this.isStageCleared = true

    ////// ADVANCE LEVEL / WIN
    if (this.isStageCleared) {
      setTimeout(() => this.onStageCleared(), 1000)
      this.scene.pause(Scenes.game)
    }
  }

  onStageCleared() {
    this.powerups.clear(undefined, true)
    this.bricks.clear(true, true)
    this.paddle.bullets.clear(true, true)
    this.bricks.poisonDrops.clear(true, true)
    this.isStageCleared = false
    if (this.isCustom) {
      this.scene.stop()
      this.scene.start(Scenes.winGame, { isCustom: true })
    }
    if (!this.isCustom) {
      this.saveBestScore(this.level)
      // if last level
      if (this.level === this.lastLevel) {
        this.scene.stop()
        this.scene.start(Scenes.winGame, { isCustom: false })
        return
      }
      this.level!++
      sceneEvents.emit(Events.levelChanged, this.level)
      this.scene.resume(Scenes.game)
      this.bricks = createBricks(this, this.level)
      this.ball.reset(this.paddle.x)
      this.paddle.reset()
      this.addColliders()
    }
  }

  saveBestScore(newLevel: number|undefined) {
    const currentLevel = newLevel || 0
    const savedLevel = storage.get(StorageKeys.bestScore)
    if ((savedLevel && +currentLevel > +savedLevel) || !savedLevel) {
      storage.set(StorageKeys.bestScore, currentLevel)
    }
  }

  //////////////////////////////////////////////////////////////
  ////// INIT SOUNDS
  initSounds() {
    this.sounds = {
      bounce: this.sound.add(Sounds.bounce),
      brickbreak: this.sound.add(Sounds.brickbreak),
      lifeLost: this.sound.add(Sounds.lifeLost),
      fire: this.sound.add(Sounds.fireBrick),
      fireBrickbreak: this.sound.add(Sounds.fireBrickbreak),
      hitMetal: this.sound.add(Sounds.hitMetal, { volume: 0.3 }),
      holdBall: this.sound.add(Sounds.holdBall, { volume: 1.8 }),
      glassShatter: this.sound.add(Sounds.glassShatter),
      glassCrack: this.sound.add(Sounds.glassCrack),
      spell: this.sound.add(Sounds.spell),
      clang: this.sound.add(Sounds.clang),
      newLife: this.sound.add(Sounds.newLife),
      die: this.sound.add(Sounds.die),
      rustle: this.sound.add(Sounds.rustle)
    }
  }

  //////////////////////////////////////////////////////////////
  ////// INIT LIVES
  initLives() {
    this.lives = 3
    this.time.addEvent({
      delay: 100,
      callback: () => this.setLives(),
      callbackScope: this,
    })
  }

  //////////////////////////////////////////////////////////////
  ////// INIT CONTROLS 
  initControls() {
    const controls = storage.get(StorageKeys.controls)
    this.allowMouseInput = !!controls.useMouse
    const keys = controls?.keys
    const defaultKeys = { right: 39, left: 37, action: 32 }
    this.keys = {
      action: this.input.keyboard?.addKey(keys?.action?.keyCode ?? defaultKeys.action) ?? null,
      left: this.input.keyboard?.addKey(keys?.left?.keyCode ?? defaultKeys.left) ?? null,
      right: this.input.keyboard?.addKey(keys?.right?.keyCode ?? defaultKeys.right) ?? null,
    }
  }

  //////////////////////////////////////////////////////////////
  ////// SET LIVES
  setLives() {
    sceneEvents.emit(Events.livesChanged, this.lives)
  }

  //////////////////////////////////////////////////////////////
  ////// COLLIDERS
  addColliders() {
    this.physics.add.collider(this.ball, this.paddle, this.ballHitPaddle, undefined, this)
    this.physics.add.collider(this.bricks, this.ball, this.ballHitBrick, undefined, this)
    this.physics.add.collider(this.bricks.poisonDrops, this.paddle, this.poisonDropHitPaddle, undefined, this)
    this.physics.add.collider(this.powerups, this.paddle, this.powerupHitPaddle, undefined, this)
    this.physics.add.collider(this.paddle.bullets, this.bricks, this.bulletHitBrick, undefined, this)
    this.physics.add.overlap(this.ball, this.ball.slowDownArea, () => (this.ball.onSlowDownArea = true), undefined, this)
    this.physics.add.collider(this.ball, this.topEdge)
  }

  //////////////////////////////////////////////////////////////
  ////// ADD POWERUP
  addPowerup(x: number, y: number) {
    const randomValue = Math.ceil(Math.random() * 5)
    if (randomValue !== 1) return
    const powerupName = this.powerups.getRandomPowerup()
    const powerup = createPowerup(this, x, y, powerupName).setData(
      "power",
      powerupName
    )
    this.powerups.addPowerup(powerup, {
      x: this.ball.body?.velocity.x! - 150,
      y: -(this.ball.body?.velocity.y! || -200),
    })
  }

  //////////////////////////////////////////////////////////////
  ////// POWERUP HIT BALL
  powerupHitPaddle(obj1: any, obj2: any) {
    const powerup = obj2 as Powerup
    const paddle = obj1 as Paddle
    switch (powerup.getData("power")) {
      case Sprites.getLife:
        if (this.lives < 4) {
          this.sounds.newLife.play()
          this.lives++
          this.setLives()
        }
        break
      case Sprites.loseLife:
        const wasInvulnerable = paddle.tryFlashInvulnerable()
        if (wasInvulnerable) break
        this.lives--
        this.setLives()
        break
      case Sprites.expandPaddle:
        paddle.expand()
        break
      case Sprites.shrinkPaddle:
        paddle.shrink()
        break
      case Sprites.igniteBall:
        this.ball.ignite()
        break
      case Sprites.addShooter:
        paddle.addCannons()
        break
      case Sprites.speedUpBall:
        this.ball.speedUp()
        break
      case Sprites.holdBall:
        this.ball.setIsToBeHeld(true)
        paddle.addBallHolder()
        break
      case Sprites.revealInvisible:
        this.sounds.spell.play()
        this.bricks.shouldFall = false
        this.bricks.revealInvisible()
        break
      case Sprites.fallingBricks:
        this.bricks.shouldFall = true
        break
    }
    powerup.destroy()
  }

  //////////////////////////////////////////////////////////////
  ////// BALL HIT PADDLE
  ballHitPaddle() {
    let sound = this.sounds.bounce
    if (this.bricks.shouldFall) {
      this.bricks.fall()
      sound = this.sounds.clang
    }
    if (this.ball.getIsToBeHeld()) {
      this.ball.hold()
      sound = this.sounds.holdBall
    } else {
      if (this.ball.speed <= 900) this.ball.incrementSpeed()
      if (this.ball.isIgnited) this.ball.createSmoke(this.ball.x, this.ball.y)
      this.ball.setDirectionBasedOnPaddle()
    }
    sound.play()
  }

  //////////////////////////////////////////////////////////////
  ////// BULLET HIT BRICK
  bulletHitBrick(bulletObj: any, brickObj: any) {
    (bulletObj as Phaser.Physics.Arcade.Sprite).destroy()
    const brick = brickObj as Brick
    const brickType = brick.getData("type")

    if (brickType === "metal") {
      this.sounds.hitMetal.play()
      brick.play(Anims.metalBrick)
      return
    }
    if (brickType === "common") {
      this.sounds.brickbreak.play()
      brick.play(Anims.commonBrick)
      brick.disableBody()
      brick.on("animationcomplete", () => brick.destroy())
      this.addPowerup(brick.x, brick.y)
    }
    if (brickType === "fire") {
      this.sounds.fireBrickbreak.play()
      this.ball.createSmoke(bulletObj.x, bulletObj.y)
      this.bricks.destroyFireBricks(brick.getData("number"))
      this.addPowerup(brick.x, brick.y)
    }
    if (brickType === "ice") {
      this.sounds.brickbreak.play()
      const hits = brick.getData("hits")
      if (hits === 1) return (brick.disableBody(), brick.destroy())
      brick.play(Anims.iceBrickBreak)
      brick.on("animationcomplete", () => {
        brick.setData("hits", 1)
      })
      this.addPowerup(brick.x, brick.y)
    }
    if (brickType === "rock") {
      this.sounds.brickbreak.play()
      const hits = brick.getData("hits") || 0
      switch (hits) {
        case 0: 
          brick.setFrame(1)
          brick.setData("hits", 1)
          break
        case 1:
          brick.setFrame(2)
          brick.setData("hits", 2)
          this.addPowerup(brick.x, brick.y)
          break
        case 2:
          brick.anims.play(Anims.rockBrickBreak)
          this.addPowerup(brick.x, brick.y)
          brick.disableBody()
          brick.on("animationcomplete", () => brick.destroy())
          break
      }
    }
    if (brickType === "glass") {
      const hits = brick.getData("hits")
      if (hits === 1) return (
        this.sounds.glassCrack.play(),
        brick.disableBody(), 
        brick.destroy()
      )
      this.sounds.glassShatter.play()
      brick.setFrame(2)
      brick.setData("hits", 1)
      this.addPowerup(brick.x, brick.y)
    }
    if (brickType === "grass") brick.shakeLeaves()
  }

  //////////////////////////////////////////////////////////////
  ////// BALL HIT BRICK
  ballHitBrick(obj1: any, obj2: any) {
    const brick = obj2 as Brick
    const brickType = brick.getData("type")
    if (brickType === "metal" && !this.ball.isIgnited) {
      // this.cameras.main.shake(100, 0.005)
      this.sounds.hitMetal.play()
      brick.play(Anims.metalBrick)
      return
    }

    if (brickType === "common" && !this.ball.isIgnited) {
      this.sounds.brickbreak.play()
      brick.play(Anims.commonBrick)
      brick.disableBody()
      brick.on("animationcomplete", () => brick.destroy())
      this.addPowerup(brick.x, brick.y)
    }

    if (brickType === "ice" && !this.ball.isIgnited) {
      this.sounds.brickbreak.play()
      const hits = brick.getData("hits")
      if (hits === 1) return (brick.disableBody(), brick.destroy())
      brick.play(Anims.iceBrickBreak)
      brick.on("animationcomplete", () => {
        brick.setData("hits", 1)
      })
      this.addPowerup(brick.x, brick.y)
    }

    if (brickType === "rock") {
      this.sounds.brickbreak.play()
      const hits = brick.getData("hits") || 0
      switch (hits) {
        case 0: 
          brick.setFrame(1)
          brick.setData("hits", 1)
          break
        case 1:
          brick.setFrame(2)
          brick.setData("hits", 2)
          this.addPowerup(brick.x, brick.y)
          break
        case 2:
          brick.anims.play(Anims.rockBrickBreak)
          this.addPowerup(brick.x, brick.y)
          brick.disableBody()
          brick.on("animationcomplete", () => brick.destroy())
          break
      }
      return
    }

    if (brickType === "glass") {
      const hits = brick.getData("hits")
      if (hits === 1) return (
        this.sounds.glassShatter.play(),
        brick.disableBody(), 
        brick.destroy()
      )
      this.sounds.glassCrack.play()
      brick.setFrame(2)
      brick.setData("hits", 1)
      this.addPowerup(brick.x, brick.y)
      return
    }

    if (brickType === "grass") brick.shakeLeaves()

    if (brickType === "fire" || this.ball.isIgnited) {
      this.sounds.fireBrickbreak.play()
      this.ball.createSmoke(obj1.x, obj1.y)
      this.bricks.destroyFireBricks(brick.getData("number"))
      this.addPowerup(brick.x, brick.y)
    }
  }

  poisonDropHitPaddle(paddleObj:any, dropObj:any) {
    (dropObj as Phaser.Physics.Arcade.Sprite).destroy()
    const paddle = paddleObj as Paddle
    if (debug.poisonImmunity) return
    const wasInvulnerable = paddle.tryFlashInvulnerable()
    if (wasInvulnerable) return
    this.lives--
    this.setLives()
  }
  
}
