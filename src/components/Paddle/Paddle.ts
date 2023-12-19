import { createPaddleAnims } from "../../anims/paddleAnims";

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
  private isLong = false;
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
    this.play("paddle");
    this.scene.input.on("pointermove", this.handleInput, this);
  }

  update() {
    if (this.x < 0 + this.width / 2) this.x = 0 + this.width / 2;
    if (this.x > this.canvasW - this.width / 2)
      this.x = this.canvasW - this.width / 2;
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

  makeLonger() {
    if (this.isLong) return;
    this.play("paddleGetsLonger");
    this.setSize(this.frame.width, 20);
    this.on("animationcomplete", () => {
      this.play("longPaddle");
    });
    this.isLong = true;
  }

  reset() {
    this.x = this.canvasW / 2;
    this.play("paddle");
    this.setSize(this.frame.width, 20);
    this.isLong = false;
  }
}

export const createPaddle = function (scene: Phaser.Scene) {
  const paddle = new Paddle(scene, 0, 0, "paddle");
  scene.add.existing(paddle);
  scene.physics.world.enableBody(paddle, Phaser.Physics.Arcade.DYNAMIC_BODY);
  paddle.init();
  return paddle;
};
