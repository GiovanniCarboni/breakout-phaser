import { Sprites } from "../../../constants"

export default class EraserButton extends Phaser.GameObjects.Sprite {
  private eraserActive = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame)
    this.setOrigin(0.5, 0.5).setInteractive({ cursor: Sprites.pointerCursor })
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => pointer.rightButtonDown() && this.activate())
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => (pointer.rightButtonReleased() || pointer.button === 2) && this.deactivate())
  }

  isActive() {
    return this.eraserActive
  }

  activate() {
    this.scene.input.setDefaultCursor(Sprites.eraserCursor)
    this.eraserActive = true
    this.setFrame(1)
  }
  
  deactivate() {
    this.scene.input.setDefaultCursor(Sprites.defaultCursor)
    this.eraserActive = false
    this.setFrame(0)
  }

  init(onClick: () => void) {
    this.on("pointerdown", () => {
      onClick()
      if (this.isActive()) this.deactivate()
      else this.activate()
    })
    this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      if (!this.isActive()) this.setFrame(2)
      if (pointer.isDown) this.setFrame(1)
    })
    this.on("pointerout", () => {
      if (!this.isActive()) this.setFrame(0)
    })
  }
}

export const createEraserButton = (
  x: number,
  y: number,
  onClick: () => void,
  scene: Phaser.Scene
) => {
  const eraserButton = new EraserButton(scene, x, y, Sprites.eraserButton)
  scene.add.existing(eraserButton)
  eraserButton.init(onClick.bind(scene))
  return eraserButton
}
