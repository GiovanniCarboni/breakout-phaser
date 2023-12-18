import Paddle from "../Paddle/Paddle";

export default class Ball extends Phaser.Physics.Arcade.Sprite {
  private canvasH: number;
  private canvasW: number;
  isMoving: boolean;
  private startPosition;
  private hitWallSound: any;
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
    this.startPosition = { x: this.canvasW / 2, y: this.canvasH - 46 };

    this.isMoving = false;
  }

  init() {
    this.y = this.startPosition.y;
    this.setCollideWorldBounds(true);
    this.setBounce(1);
    this.hitWallSound = this.scene.sound.add("hitWall", {
      loop: false,
      volume: 0.6,
    });
  }

  update(paddle: Paddle) {
    if (!this.isMoving) this.x = paddle.x;

    // to modify. not reliable
    if (this.x < 8 || this.x > this.canvasW - 8 || this.y < 8)
      if (!this.hitWallSound.isPlaying) this.hitWallSound.play();
  }

  start() {
    this.setVelocity(100, -380);
    this.isMoving = true;
  }

  reset(x: number, y = this.startPosition.y) {
    this.isMoving = false;
    this.body?.reset(x, y);
    this.setVelocity(0);
  }

  stopMovement() {
    this.setVelocity(0);
    this.isMoving = false;
  }
}

export const createBall = function (scene: Phaser.Scene) {
  const ball = new Ball(scene, 0, 0, "ball");
  scene.add.existing(ball);
  scene.physics.world.enableBody(ball, Phaser.Physics.Arcade.DYNAMIC_BODY);
  ball.init();
  return ball;
};
