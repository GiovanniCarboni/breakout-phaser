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

  //////////////////////////////////////////////////////////////
  ////// CREATE BRICK HIGHLIGHT
  static createHighlight(x: number, y: number, scene: Phaser.Scene) {
    return scene.add
      .sprite(x, y, Sprites.brickHighlight)
      .setOrigin(0.5, 0.5)
      .setDepth(-1);
  }

  //////////////////////////////////////////////////////////////
  ////// INIT BRICK
  init(brickType: number, entryNr: number) {
    switch (brickType) {
      case 1:
        this.setTexture(Sprites.commonBrick);
        this.setData("type", "common");
        break;
      case 2:
        this.setTexture(Sprites.fireBrick);
        setTimeout(() => {
          try { // brick might not exist anymore
            this.play(Anims.fireBrick);
          } catch {}
        }, 74 * Math.ceil(Math.random() * 8));
        this.setData("type", "fire");
        break;
      case 3:
        this.play(Anims.metalBrick);
        this.setData("type", "metal");
        break;
      case 4:
        this.setTexture(Sprites.iceBrick);
        this.setData("hits", 0)
        setTimeout(() => {
          this.play(Anims.iceBrickIdle);
        }, 74 * Math.ceil(Math.random() * 8));
        this.setData("type", "ice");
        break;
      case 9:
        this.setTexture(Sprites.blankBrick);
        this.setData("type", "blank");
        break;
    }
    this.setData("number", entryNr);
    this.setData("status", "active");
    this.setInteractive();
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

  /////////////// debug //////////////////////////////////
  // debug bricks
  // const text = scene.add.text(x, y, String(info.entryNr), {
  //   color: "white",
  //   strokeThickness: 2,
  //   stroke: "black",
  //   fontStyle: "bold",
  // });
  // text.setOrigin(0.5, 0.5);

  return brick;
};
