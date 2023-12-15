import { sceneEvents } from "../events/EventCenter";
import Ball, { createBall } from "../components/Ball";
import Paddle, { createPaddle } from "../components/Paddle";
import Bricks, { createBricks } from "../components/Bricks";

export class Game extends Phaser.Scene {
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };
  private ball!: Ball;
  private paddle!: Paddle;
  private bricks!: Bricks;

  private lives!: number;
  canvasW!: number;
  canvasH!: number;

  constructor() {
    super({
      key: "game",
      physics: {
        default: "arcade",
        arcade: {},
      },
    });
  }

  create() {
    this.scene.launch("UI");

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.initSounds();
    this.initLives();

    this.ball = createBall(this);
    this.paddle = createPaddle(this);
    this.bricks = createBricks(this);

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

      this.ball.reset();
    }
  }

  initSounds() {
    this.sounds = {
      bounce: this.sound.add("bounce", { loop: false }),
      brickbreak: this.sound.add("brickbreak", { loop: false }),
      gameOver: this.sound.add("gameOver", { loop: false }),
      lifeLost: this.sound.add("lifeLost", { loop: false }),
      fire: this.sound.add("fire", { loop: false }),
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
      this.ballHitBrick,
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
    } else if (this.ball.x > this.paddle.x) {
      diff = this.ball.x - this.paddle.x;
      this.ball.setVelocityX(10 * diff);
    } else {
      this.ball.setVelocityX(2 + Math.random() * 8);
    }
  }

  ballHitBrick(_: any, obj2: any) {
    const brick = obj2 as Phaser.Physics.Arcade.Sprite;
    const brickType = brick.getData("type");
    const entry = brick.getData("number");
    const bricksToDestroy: Phaser.Physics.Arcade.Sprite[] = [];
    if (brickType === "common") this.sounds.brickbreak.play();
    if (brickType === "fire") {
      this.sounds.fire.play();

      const alsoDestroyed = this.getOtherDestroyed(entry);

      this.bricks.getChildren().forEach((brick) => {
        if (alsoDestroyed.includes(brick?.getData("number"))) {
          bricksToDestroy.push(brick as Phaser.Physics.Arcade.Sprite);
          // if (brick?.getData("type") === "fire")
        }
      });
    }
    brick.destroy();
    setTimeout(() => {
      bricksToDestroy.forEach((brick) => brick.destroy());
    }, 100);
  }

  getOtherDestroyed(fireBrick: number) {
    return [
      fireBrick - 1,
      fireBrick + 1,
      fireBrick - 20,
      fireBrick - 19,
      fireBrick - 18,
      fireBrick + 18,
      fireBrick + 19,
      fireBrick + 20,
    ];
  }
}
