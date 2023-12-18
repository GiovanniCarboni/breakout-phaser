import { sceneEvents } from "../events/EventCenter";
import Ball, { createBall } from "../components/Ball/Ball";
import Paddle, { createPaddle } from "../components/Paddle/Paddle";
import Bricks, { createBricks } from "../components/Brick/Bricks";
import Powerup, { createPowerup } from "../components/Powerup/Powerup";
import Powerups, { createPowerups } from "../components/Powerup/Powerups";

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
  private powerups!: Powerups;
  private level!: number;
  private lives!: number;
  private isStageCleared = false;
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
    this.scene.run("UI");

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.level = 1;
    sceneEvents.emit("levelChanged", this.level);

    this.initSounds();
    this.initLives();
    this.ball = createBall(this);
    this.paddle = createPaddle(this);
    this.bricks = createBricks(this, this.level);
    this.powerups = createPowerups(this);

    // enables input for the scene
    this.input.setPollAlways();

    this.addColliders();

    // start ball on click
    ["levelChanged", "livesChanged"].forEach((e) => {
      sceneEvents.on(
        e,
        () => {
          this.input.once("pointerdown", () => this.ball.start());
        },
        this
      );
    });
  }

  update(_: number, dt: number) {
    this.ball.update(this.paddle);

    // balls falls under
    if (this.ball.y > this.canvasH + this.ball.height) {
      if (this.lives > 1) this.sounds.lifeLost.play();
      this.lives--;
      this.setLives();
      if (this.lives < 1) {
        this.scene.pause("UI");
        this.scene.launch("gameOver");
        this.scene.stop();
      }
      this.ball.reset(this.paddle.x);
    }

    // TODO review advance level logic
    if (this.bricks.getChildren().length === 0 && !this.isStageCleared)
      this.isStageCleared = true;
    if (this.isStageCleared) {
      setTimeout(() => {
        this.level++;
        sceneEvents.emit("levelChanged", this.level);
        this.scene.resume();
        this.bricks = createBricks(this, this.level);
        this.ball.reset(this.paddle.x);
        this.addColliders();
        this.isStageCleared = false;
      }, 1000);
      this.scene.pause();
    }
  }

  initSounds() {
    this.sounds = {
      bounce: this.sound.add("bounce", { loop: false }),
      brickbreak: this.sound.add("brickbreak", { loop: false }),
      lifeLost: this.sound.add("lifeLost", { loop: false }),
      fire: this.sound.add("fire", { loop: false }),
      hitWall: this.sound.add("hitWall", { loop: false }),
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
    this.physics.add.collider(
      this.powerups,
      this.paddle,
      (obj1: any, obj2: any) => {
        console.log("powerup");
        const powerup = obj2 as Powerup;
        powerup.destroy();
      }
    );
  }

  // TODO move ballHitPaddle logic to Ball
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

  // TODO move ballHitBrick logic to Brick
  ballHitBrick(_: any, obj2: any) {
    const brick = obj2 as Phaser.Physics.Arcade.Sprite;
    const brickType = brick.getData("type");
    const entry = brick.getData("number");
    const bricksToDestroy: Phaser.Physics.Arcade.Sprite[] = [];
    if (brickType === "common") this.sounds.brickbreak.play();
    if (brickType === "fire") {
      this.sounds.fire.play();

      const neighbors = this.getNeighbors(entry);

      this.bricks.getChildren().forEach((brick) => {
        if (neighbors.includes(brick?.getData("number"))) {
          bricksToDestroy.push(brick as Phaser.Physics.Arcade.Sprite);
          // if (brick?.getData("type") === "fire")
        }
      });
    }
    brick.destroy();
    setTimeout(() => {
      bricksToDestroy.forEach((brick) => brick.destroy());
    }, 100);

    ////////////// POWER UP //////////////////////////
    const randomValue = Math.ceil(Math.random() * 3);
    if (randomValue !== 8) return;
    const powerup = createPowerup(this, brick.x, brick.y);
    this.powerups.addPowerup(powerup, {
      x: this.ball.body?.velocity.x! - 150,
      y: -this.ball.body?.velocity.y!,
    });
  }

  getNeighbors(fireBrick: number) {
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
