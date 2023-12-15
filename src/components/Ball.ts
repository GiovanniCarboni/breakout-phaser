export default class Ball extends Phaser.Physics.Arcade.Sprite {
  private canvasH: number;
  private canvasW: number;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame);

    this.canvasH = scene.scale.height;
    this.canvasW = scene.scale.width;
  }

  init() {
    this.x = this.canvasW / 2;
    this.y = this.canvasH * 0.8;
    this.setCollideWorldBounds(true);
    this.setVelocity(380, -380);
    this.setBounce(1);
  }

  reset() {
    this.body?.reset(this.canvasW / 2, this.canvasH * 0.8);
    this.setVelocity(380, -380);
  }
}

export const createBall = function (scene: Phaser.Scene) {
  const sprite = new Ball(scene, 0, 0, "ball");
  scene.add.existing(sprite);
  scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);
  sprite.init();
  return sprite;
};
