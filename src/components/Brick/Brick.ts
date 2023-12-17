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
        this.play("brickAnimation");
        this.setData("type", "common");
        break;
      case 2:
        this.play("brickFireAnimation");
        this.setData("type", "fire");
    }
    this.setData("number", entryNr);
    // this.setImmovable(true);
  }
}

export const createBrick = function (
  scene: Phaser.Scene,
  x: number,
  y: number,
  info: { type: number; entryNr: number }
) {
  const brick = new Brick(scene, x, y, "brick");
  scene.add.existing(brick);
  scene.physics.world.enableBody(brick, Phaser.Physics.Arcade.DYNAMIC_BODY);
  brick.init(info.type, info.entryNr);
  return brick;
};
