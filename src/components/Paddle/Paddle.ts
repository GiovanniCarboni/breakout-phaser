import { createPaddleAnims } from "../../anims/paddleAnims";

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
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
    this.y = this.canvasH - 30;
    this.setInteractive();
    this.setImmovable(true);
    this.play("paddleAnimation");
    this.scene.input.on("pointermove", this.handleInput, this);
  }

  handleInput(pointer: Phaser.Input.Pointer) {
    const paddlePosition =
      pointer.x > this.canvasW - this.width / 2
        ? this.canvasW - this.width / 2
        : pointer.x < this.width / 2
        ? this.width / 2
        : pointer.x;
    this.x = paddlePosition || this.canvasW / 2;
  }

  reset() {}
}

export const createPaddle = function (scene: Phaser.Scene) {
  const paddle = new Paddle(scene, 0, 0, "paddle");
  scene.add.existing(paddle);
  scene.physics.world.enableBody(paddle, Phaser.Physics.Arcade.DYNAMIC_BODY);
  paddle.init();
  return paddle;
};
