import { t } from "i18next";
import { Anims, Fonts, Sounds, Sprites } from "../../constants";

export default class BackButton extends Phaser.GameObjects.Sprite {
  private label!: Phaser.GameObjects.Text;
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
    this.setOrigin(0.5, 0.5).setInteractive();

    this.pressSound = this.scene.sound.add(Sounds.buttonPress, {
      loop: false,
      volume: 0.2,
    });
  }

  init(onClick: () => void) {
    this.label = this.scene.add
      .text(this.x, this.y, t("Back"), { fontFamily: Fonts.manaspace })
      .setShadow(5, 3, "black", 2)
      .setOrigin(0.5, 0.5);
    this.addListeners(onClick);
  }

  addListeners(onClick: () => void) {
    const labelLift = 1;
    const defaultLabelY = this.label.y;

    this.on("pointerdown", () => {
      this.play(Anims.backButtonPressed);
      this.label.setY(defaultLabelY + labelLift);
      this.pressSound.play();
    });
    this.on("pointerup", () => {
      this.play(Anims.backButtonIdle);
      onClick();
    });
    this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.label
        .setY(defaultLabelY - labelLift)
        .setShadowOffset(5, 3 + labelLift);
      if (pointer.isDown) {
        this.play(Anims.backButtonPressed);
        this.label.setY(defaultLabelY + labelLift);
      }
    });
    this.on("pointerout", () => {
      this.play(Anims.backButtonIdle);
      this.label.setY(defaultLabelY).setShadowOffset(5, 3 - labelLift);
    });
  }
}

export const createBackButton = (
  x: number,
  y: number,
  onClick: () => void,
  scene: Phaser.Scene
) => {
  const button = new BackButton(scene, x, y, Sprites.backButton);
  scene.add.existing(button);
  button.init(onClick.bind(scene));
  return button;
};
