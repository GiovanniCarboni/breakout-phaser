import { GameObjects } from "phaser";
import { createPaddleAnims } from "../anims/paddleAnims";
import { createBricksAnims } from "../anims/brickAnims";
import { sceneEvents } from "../events/EventCenter";

export class GameScene extends Phaser.Scene {
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };
  private ball!: Phaser.Physics.Arcade.Sprite;
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private bricks!: Phaser.Physics.Arcade.Group;
  private lives!: number;
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
    this.scene.launch("UIScene");

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.initSounds();
    this.initLives();
    this.initBall();
    this.initPaddle();
    this.initBricks();

    // enables input for the scene
    this.input.setPollAlways();

    this.addColliders();
  }

  update() {
    // balls falls under
    if (this.ball.y > this.canvasH + this.ball.height) {
      if (this.lives > 1) this.sounds.lifeLost.play();
      this.lives--;
      this.setLives();
      if (this.lives < 1) {
        this.sounds.gameOver.play();
        this.time.addEvent({
          delay: 100,
          callback: () => {
            alert("game over");
            this.initLives();
          },
          callbackScope: this,
        });
      }

      this.resetBall();
    }
  }

  initSounds() {
    this.sounds = {
      bounce: this.sound.add("bounce", { loop: false }),
      brickbreak: this.sound.add("brickbreak", { loop: false }),
      gameOver: this.sound.add("gameOver", { loop: false }),
      lifeLost: this.sound.add("lifeLost", { loop: false }),
    };
  }

  initLives() {
    this.lives = 3;
    this.time.addEvent({
      delay: 100,
      callback: () => {
        this.setLives();
      },
      callbackScope: this,
    });
  }

  setLives() {
    sceneEvents.emit("livesChanged", this.lives);
  }

  togglePause(scene: any) {
    scene.pause();
    scene.launch("PauseScene");
  }

  initBall() {
    this.ball = this.physics.add.sprite(
      this.canvasW / 2,
      this.canvasH * 0.8,
      "ball"
    );
    this.ball.setCollideWorldBounds(true);
    this.ball.setVelocity(380, -380);
    this.ball.setBounce(1);
  }

  resetBall() {
    this.ball.body?.reset(this.canvasW / 2, this.canvasH * 0.8);
    this.ball.setVelocity(380, -380);
  }

  initPaddle() {
    createPaddleAnims(this.anims);
    this.paddle = this.physics.add
      .sprite(this.canvasW / 2, this.canvasH - 30, "paddle")
      .setImmovable(true);
    this.paddle.setInteractive();
    this.paddle.play("paddleAnimation");
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const paddlePosition =
        pointer.x > this.canvasW - this.paddle.width / 2
          ? this.canvasW - this.paddle.width / 2
          : pointer.x < this.paddle.width / 2
          ? this.paddle.width / 2
          : pointer.x;
      this.paddle.x = paddlePosition || this.canvasW / 2;
    });
  }

  initBricks() {
    createBricksAnims(this.anims);
    this.bricks = this.physics.add.group();
    const brickInfo = {
      width: 51,
      height: 20,
      count: {
        row: 3,
        col: 19,
      },
      offset: {
        top: 70,
        left: 65,
      },
      padding: 2.7,
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

    this.bricks.children.iterate((brick: Phaser.GameObjects.GameObject, i) => {
      const body = brick.body as Phaser.Physics.Arcade.Body;
      brick.body?.gameObject.play("brickAnimation");
      if (i === 15) brick.body?.gameObject.play("brickFireAnimation");
      body.setImmovable(true);
      return true;
    });

    this.bricks.getChildren()[16].body?.gameObject.play("brickFireAnimation");
  }

  addColliders() {
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
      (_, brick) => {
        this.sounds.brickbreak.play();
        brick.destroy();
      },
      undefined,
      this
    );
  }

  ballHitPaddle() {
    this.sounds.bounce.play();
    let diff = 0;
    if (this.ball.x < this.paddle.x) {
      diff = this.paddle.x - this.ball.x;
      this.ball.setVelocityX(-10 * diff);
      // this.ball.setVelocityY(-this. + diff);
    } else if (this.ball.x > this.paddle.x) {
      diff = this.ball.x - this.paddle.x;
      this.ball.setVelocityX(10 * diff);
      // this.ball.setVelocityY(-this.ball.y + diff);
    } else {
      this.ball.setVelocityX(2 + Math.random() * 8);
    }
  }
}
