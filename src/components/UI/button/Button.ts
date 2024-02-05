import { Anims, Fonts, Sounds, Sprites } from "../../../constants";

export default class Button extends Phaser.GameObjects.Sprite {
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame);
    this.setInteractive();
    this.play(Anims.genericButtonIdle);
    this.sounds = {
      shuffle: this.scene.sound.add(Sounds.shuffle, {
        loop: false,
        volume: 0.2,
      }),
      btnPressed: this.scene.sound.add(Sounds.buttonPress, {
        loop: false,
        volume: 0.2,
      }),
    };
  }

  //////////////////////////////////////////////////////////////
  ////// INIT BUTTON
  init(label: string, onClick: () => void, isMain?: boolean) {
    const y = this.y;
    if (isMain) this.play(Anims.mainButtonIdle);

    // label
    const textEl = this.scene.add
      .text(this.x, y, label, {
        fontFamily: Fonts.manaspace,
        fontSize: 22,
        strokeThickness: 3,
        stroke: "#000",
        color: "#e9e9e9",
      })
      .setOrigin(0.5, 0.5)
      .setShadow(5, 3, "black", 2);

    // event listeners
    const lift = 1.5;
    this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.sounds.shuffle.play();
      textEl.setY(y - lift).setShadowOffset(5, 3 + lift);
      if (pointer.isDown) {
        if (!isMain) this.play(Anims.genericButtonPressed);
        if (isMain) this.play(Anims.mainButtonPressed);
      }
    });
    this.on("pointerout", () => {
      if (!isMain) this.play(Anims.genericButtonIdle);
      if (isMain) this.play(Anims.mainButtonIdle);
      textEl.setY(y).setShadowOffset(5, 3);
    });
    this.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      if (!isMain) this.play(Anims.genericButtonPressed);
      if (isMain) this.play(Anims.mainButtonPressed);
      textEl.setY(y + lift).setShadow(undefined);
    });
    this.on("pointerup", () => {
      onClick();
      if (!isMain) this.play(Anims.genericButtonIdle);
      if (isMain) this.play(Anims.mainButtonIdle);
      textEl.setY(y).setShadow(5, 3, "black", 2);
    });
  }
}

export const createButton = (
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  scene: Phaser.Scene,
  isMain?: boolean
) => {
  const button = new Button(scene, x, y, Sprites.genericButton);
  scene.add.existing(button);
  button.init(label, onClick.bind(scene), isMain);
  return button;
};
