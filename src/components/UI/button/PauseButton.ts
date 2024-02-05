import { Sounds, Sprites } from "../../../constants";

export default class PauseButton extends Phaser.GameObjects.Sprite {
  private pressSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame);
    this.setInteractive();

    this.pressSound = this.scene.sound.add(Sounds.buttonPress, {
      loop: false,
      volume: 0.2,
    });
  }

  init(onClick: () => void) {
    const defaultY = this.y;
    const lift = 2;
    this.on("pointerdown", () => {
      this.pressSound.play();
      this.y = defaultY + lift;
      this.setScale(1);
    });
    this.on("pointerup", onClick);
    this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.setScale(1.05);
      if (pointer.isDown) this.y = defaultY + lift;
    });
    this.on("pointerout", () => {
      this.setScale(1);
      this.setY(defaultY);
    });
  }
}

export const createPauseButton = (
  x: number,
  y: number,
  onClick: () => void,
  scene: Phaser.Scene
) => {
  const pauseButton = new PauseButton(scene, x, y, Sprites.pauseButton);
  scene.add.existing(pauseButton);
  pauseButton.init(onClick.bind(scene));
  return pauseButton;
};
