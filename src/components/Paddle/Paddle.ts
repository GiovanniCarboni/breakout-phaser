import { Anims, Sprites } from "../../constants";

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
  // 1 = short; 2 = default; 3 = long
  private paddleLength: 1 | 2 | 3 = 2;
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
    this.play(Anims.defaultPaddle);
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

  expand() {
    if (this.paddleLength === 3) return;
    if (this.paddleLength === 2) {
      this.play(Anims.paddleGetsLonger2);
      this.on("animationcomplete", () => {
        this.play(Anims.longPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    if (this.paddleLength === 1) {
      this.play(Anims.paddleGetsLonger1);
      this.on("animationcomplete", () => {
        this.play("paddle");
        this.setSize(this.frame.width, 20);
      });
    }
    this.paddleLength++;
  }

  shrink() {
    if (this.paddleLength === 1) return;
    if (this.paddleLength === 2) {
      this.play(Anims.paddleGetsShorter1);
      this.on("animationcomplete", () => {
        this.play(Anims.shortPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    if (this.paddleLength === 3) {
      this.play(Anims.paddleGetsShorter2);
      this.on("animationcomplete", () => {
        this.play(Anims.defaultPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    this.paddleLength--;
  }

  reset() {
    this.x = this.canvasW / 2;
    this.play(Anims.defaultPaddle);
    this.setSize(this.frame.width, 20);
    this.paddleLength = 2;
  }
}

export const createPaddle = function (scene: Phaser.Scene) {
  const paddle = new Paddle(scene, 0, 0, Sprites.defaultPaddle);
  scene.add.existing(paddle);
  scene.physics.world.enableBody(paddle, Phaser.Physics.Arcade.DYNAMIC_BODY);
  paddle.init();
  return paddle;
};
