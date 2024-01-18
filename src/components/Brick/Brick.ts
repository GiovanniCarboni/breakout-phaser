import { Sprites, Anims } from "../../constants";

export default class Brick extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame);
  }

  init(brickType: number, entryNr: number) {
    switch (brickType) {
      case 1:
        this.setTexture(Sprites.commonBrick);
        this.setData("type", "common");
        break;
      case 2:
        this.setTexture(Sprites.fireBrick);
        setTimeout(() => {
          this.play(Anims.fireBrick);
        }, 74 * Math.ceil(Math.random() * 8));
        this.setData("type", "fire");
        break;
      case 3:
        this.play(Anims.metalBrick);
        this.setData("type", "metal");
        break;
    }
    this.setData("number", entryNr);
    this.setData("status", "active");
    // this.setImmovable(true);
  }
}

export const createBrick = function (
  scene: Phaser.Scene,
  x: number,
  y: number,
  info: { type: number; entryNr: number }
) {
  const brick = new Brick(scene, x, y, Sprites.commonBrick);
  scene.add.existing(brick);
  scene.physics.world.enableBody(brick, Phaser.Physics.Arcade.DYNAMIC_BODY);
  brick.init(info.type, info.entryNr);
  return brick;
};
