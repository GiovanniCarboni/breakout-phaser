import { Anims, Fonts, Sounds, Sprites } from "../../constants";

export default class Menu extends Phaser.GameObjects.Sprite {
  private hanger?: Phaser.GameObjects.Image;
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
    this.setOrigin(0.5, 0).setDepth(-1);

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

  init(
    scene: Phaser.Scene,
    buttons: { label: string; onClick: () => void; isMain?: boolean }[],
    hangerOn: boolean = true
  ) {
    this.initMenuFrame(buttons.length, hangerOn);
    buttons.forEach((button, i) => {
      const y = this.y + 100 * (i + 1);
      this.initButton(
        this.x,
        y,
        button.label,
        button.onClick.bind(scene),
        button.isMain
      );
    });
  }

  initMenuFrame(buttonsNr: number, hangerOn: boolean = true) {
    if (buttonsNr === 4) {
      this.setTexture(Sprites.menuBox4);
    }
    if (buttonsNr === 3) {
      this.setTexture(Sprites.menuBox3);
    }
    if (buttonsNr === 2) {
      this.setTexture(Sprites.menuBox2);
    }
    if (hangerOn) {
      this.hanger = this.scene.add
        .image(this.x, this.y, Sprites.menuHanger)
        .setOrigin(0.5, 1);
    }
  }

  initButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    isMain?: boolean
  ) {
    const button = this.scene.add
      .sprite(x, y, Sprites.genericButton)
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .play(Anims.genericButtonIdle);
    if (isMain) button.setTexture(Sprites.mainButton);
    const textEl = this.scene.add
      .text(x, y, label)
      .setOrigin(0.5, 0.5)
      .setFontFamily(Fonts.manaspace)
      .setFontSize(22)
      .setColor("#e9e9e9")
      .setShadow(5, 3, "black", 2);
    const lift = 1.5;
    button.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      this.sounds.shuffle.play();
      textEl.setY(y - lift).setShadowOffset(5, 3 + lift);
      if (pointer.isDown) {
        if (!isMain) button.play(Anims.genericButtonPressed);
        if (isMain) button.play(Anims.mainButtonPressed);
      }
    });
    button.on("pointerout", () => {
      if (!isMain) button.play(Anims.genericButtonIdle);
      if (isMain) button.play(Anims.mainButtonIdle);
      textEl.setY(y).setShadowOffset(5, 3);
    });
    button.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      if (!isMain) button.play(Anims.genericButtonPressed);
      if (isMain) button.play(Anims.mainButtonPressed);
      textEl.setY(y + lift).setShadow(undefined);
    });
    button.on("pointerup", () => {
      onClick();
      if (!isMain) button.play(Anims.genericButtonIdle);
      if (isMain) button.play(Anims.mainButtonIdle);
      textEl.setY(y).setShadow(5, 3, "black", 2);
    });
  }
}

export const createMenu = (
  x: number,
  y: number,
  buttons: { label: string; onClick: () => void; isMain?: boolean }[],
  scene: Phaser.Scene,
  hangerOn: boolean = true
) => {
  const menu = new Menu(scene, x, y, Sprites.menuBox2);
  scene.add.existing(menu);
  menu.init(scene, buttons, hangerOn);
  return menu;
};
