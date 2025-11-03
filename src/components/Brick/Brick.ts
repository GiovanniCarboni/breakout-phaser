import { Sprites, Anims } from "../../constants"
import { Game } from "../../scenes/Game"
import Bricks from "./Bricks"

export default class Brick extends Phaser.Physics.Arcade.Sprite {
  private gameScene?: Game
  private parentGroup: Bricks

  constructor(
    scene: Phaser.Scene | Game,
    x: number,
    y: number,
    texture: string,
    group: Bricks
  ) {
    super(scene, x, y, texture, 0)
    if (scene instanceof Game) this.gameScene = scene
    this.parentGroup = group
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE BRICK HIGHLIGHT
  static createHighlight(x: number, y: number, scene: Phaser.Scene) {
    return scene.add
      .sprite(x, y, Sprites.brickHighlight)
      .setOrigin(0.5, 0.5)
      .setDepth(-1)
  }

  //////////////////////////////////////////////////////////////
  ////// INIT BRICK
  init(brickType: number, entryNr: number) {
    switch (brickType) {
      case 1:
        this.setTexture(Sprites.commonBrick)
        this.setData("type", "common")
        break
      case 2:
        this.setTexture(Sprites.fireBrick)
        this.scene.time.delayedCall(
          74 * Math.ceil(Math.random() * 8),
          () => this && this.scene && this.active && this.play(Anims.fireBrick, true)
        )
        this.setData("type", "fire")
        break
      case 3:
        this.play(Anims.metalBrick)
        this.setData("type", "metal")
        break
      case 4:
        this.setTexture(Sprites.iceBrick)
        this.setData("hits", 0)
        this.scene.time.delayedCall(
          74 * Math.ceil(Math.random() * 8),
          () => this && this.scene && this.active && this.play(Anims.iceBrickIdle)
        )
        this.setData("type", "ice")
        break
      case 5:
        this.setTexture(Sprites.rockBrick)
        this.setData("type", "rock")
        break
      case 6:
        this.setTexture(Sprites.glassBrick)
        this.setData("type", "glass")
        break
      case 7:
        this.setTexture(Sprites.grassBrick)
        this.setData("type", "grass")
        this.attachPoisonDrops()
        break
      case 9:
        this.setTexture(Sprites.blankBrick)
        this.setData("type", "blank")
        break
    }
    this.setData("number", entryNr)
    this.setData("status", "active")
    this.setInteractive()
  }

  attachPoisonDrops() {
    if (!this.gameScene) return
    const ev = this.scene.time.addEvent({
      delay: Math.floor(Math.random() * (2800 - 2400 + 1)) + 2400,
      callback: () => {
        if (!this || !this.active) return ev.remove()
        const left  = this.x - this.width/2 + 8
        const right = this.x + this.width/2 - 8
        const rx = Math.floor(Math.random() * (right - left + 1)) + left
        const drop = this.parentGroup.poisonDrops.get(rx, this.y+this.height/2, Sprites.poisonDrop)
        this.scene.time.delayedCall(200, () => drop.active && drop.play(Anims.poisonDrop))
        this.scene?.tweens.add({
          targets: drop,
          y: "+=" + this.scene.scale.height,
          ease: "Sine.easeIn",
          duration: Math.floor(Math.random() * (1500 - 3500 + 1)) + 3500,
          onComplete: () => drop.destroy()
        }).play()
      }, 
      args: [],
      callbackScope: this.scene,
      loop: true,
    })
  }

  shakeLeaves() {
    this.gameScene?.sounds.rustle.play()
    const leafBurst = this.scene.add.sprite(this.x, this.y, Sprites.leafBurst).play(Anims.leafBurst)
    const anim = this.scene.anims.get(Anims.leafBurst)
    this.scene.tweens.add({
      targets: leafBurst,
      alpha: 0,
      duration: (anim.frames.length / anim.frameRate) * 1000,
      ease: 'Linear'
    }).play()
    leafBurst.on("animationcomplete", () => leafBurst.destroy())
  }
}

export const createBrick = function (
  scene: Phaser.Scene | Game,
  x: number,
  y: number,
  info: { type: number; entryNr: number },
  group: Bricks
) {
  const brick = new Brick(scene, x, y, Sprites.commonBrick, group)
  scene.add.existing(brick)
  scene.physics.world.enableBody(brick, Phaser.Physics.Arcade.DYNAMIC_BODY)
  brick.init(info.type, info.entryNr)
  return brick
}
