import { GameObjects } from "phaser";

export class GameScene extends Phaser.Scene {
  private ball!: Phaser.Physics.Arcade.Sprite;
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private bricks!: Phaser.Physics.Arcade.Group;
  canvasW!: number;
  canvasH!: number;

  constructor() {
    super({
      key: "GameScene",
      physics: {
        default: "arcade",
        arcade: {},
      },
    });
  }

  create() {
    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.initBall();
    this.initPaddle();
    this.initBricks();

    // enables input for the scene
    this.input.setPollAlways();
    this.paddle.setInteractive();

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.paddle.x = pointer.x || this.canvasW / 2;
    });

    this.physics.add.collider(
      this.ball,
      this.paddle,
      this.ballHitPaddle,
      undefined,
      this
    );
    this.physics.add.collider(
      this.bricks,
      this.ball,
      // this.ballHitPaddle,
      (_, brick) => {
        brick.destroy();
      },
      undefined,
      this
    );
  }

  update() {
    if (this.ball.y > this.canvasH + this.ball.height) {
      alert("game over");
      this.ball.body?.reset(this.canvasW / 2, this.canvasH / 2);
      this.ball.setVelocity(220, -220);
    }
  }

  initBall() {
    this.ball = this.physics.add.sprite(
      this.canvasW / 2,
      this.canvasH / 2,
      "ball"
    );
    this.ball.setCollideWorldBounds(true);
    this.ball.setVelocity(320, -320);
    this.ball.setBounce(1);
  }

  initPaddle() {
    this.paddle = this.physics.add
      .sprite(this.canvasW / 2, this.canvasH - 30, "paddle")
      .setImmovable(true);

    this.anims.create({
      key: "paddleAnimation",
      frames: this.anims.generateFrameNumbers("paddle", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1, // indefinitely
    });
    this.paddle.play("paddleAnimation");
  }

  initBricks() {
    // Create a group for bricks
    this.bricks = this.physics.add.group();

    const brickInfo = {
      width: 51,
      height: 20,
      count: {
        row: 3,
        col: 19,
      },
      offset: {
        top: 50,
        left: 65,
      },
      padding: 2,
    };
    for (let c = 0; c < brickInfo.count.col; c++) {
      for (let r = 0; r < brickInfo.count.row; r++) {
        let brickX =
          c * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
        let brickY =
          r * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
        let newBrick = this.physics.add.sprite(brickX, brickY, "brick");
        // this line makes the body object
        this.bricks.add(newBrick);
      }
    }

    this.anims.create({
      key: "brickAnimation",
      frames: this.anims.generateFrameNumbers("brick", {
        start: 0,
        end: 0,
      }),
      frameRate: 1,
      repeat: 1,
    });
    this.anims.create({
      key: "brickFireAnimation",
      frames: this.anims.generateFrameNumbers("brickFire", {
        start: 0,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.bricks.children.iterate((brick: Phaser.GameObjects.GameObject, i) => {
      const body = brick.body as Phaser.Physics.Arcade.Body;
      brick.body?.gameObject.play("brickAnimation");
      if (i === 15) brick.body?.gameObject.play("brickFireAnimation");
      body.setImmovable(true);
      return true;
    });

    this.bricks.getChildren()[16].body?.gameObject.play("brickFireAnimation");

    // this.bricks.playAnimation("brickAnimation");
  }

  ballHitPaddle() {
    this.ball.setVelocityX(-5 * (this.paddle.x - this.ball.x));
  }
}
