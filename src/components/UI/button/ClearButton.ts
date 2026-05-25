import { Sprites } from "../../../constants"

export default class ClearButton extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame)
    this.setOrigin(0.5, 0.5).setInteractive({ cursor: Sprites.pointerCursor })
  }

  init(onClick: () => void) {
    this.on("pointerdown", () => {
      this.setFrame(1)
    })
    this.on("pointerup", () => {
      onClick()
      this.setFrame(2)
    })
    this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.setFrame(2)
      if (pointer.isDown) this.setFrame(1)
    })
    this.on("pointerout", () => {
      this.setFrame(0)
    })
  }
}

export const createClearButton = (
  x: number,
  y: number,
  onClick: () => void,
  scene: Phaser.Scene
) => {
  const clearButton = new ClearButton(scene, x, y, Sprites.clearButton)
  scene.add.existing(clearButton)
  clearButton.init(onClick.bind(scene))
  return clearButton
}
