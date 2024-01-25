import { Anims, Sprites } from "../../constants";

export default class ClearButton extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame);
    this.setOrigin(0.5, 0.5).setInteractive();
  }

  init(onClick: () => void) {
    this.on("pointerdown", () => {
      this.play(Anims.clearButtonPressed);
    });
    this.on("pointerup", () => {
      onClick();
      this.play(Anims.clearButtonHover);
    });
    this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.play(Anims.clearButtonHover);
      if (pointer.isDown) this.play(Anims.clearButtonPressed);
    });
    this.on("pointerout", () => {
      this.play(Anims.clearButtonIdle);
    });
  }
}

export const createClearButton = (
  x: number,
  y: number,
  onClick: () => void,
  scene: Phaser.Scene
) => {
  const clearButton = new ClearButton(scene, x, y, Sprites.clearButton);
  scene.add.existing(clearButton);
  clearButton.init(onClick.bind(scene));
  return clearButton;
};
