import { Sprites } from "../../constants";
import { createButton } from "./Button";

export default class Menu extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame);
    this.setOrigin(0.5, 0).setDepth(-1);
  }

  init(
    scene: Phaser.Scene,
    buttons: { label: string; onClick: () => void; isMain?: boolean }[],
    hangerOn: boolean = true
  ) {
    this.initMenuFrame(buttons.length, hangerOn);
    buttons.forEach((button, i) => {
      const y = this.y + 100 * (i + 1);
      createButton(
        this.x,
        y,
        button.label,
        button.onClick,
        scene,
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
      this.scene.add
        .image(this.x, this.y, Sprites.menuHanger)
        .setOrigin(0.5, 1);
    }
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
