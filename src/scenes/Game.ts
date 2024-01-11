import { sceneEvents } from "../events/EventCenter";
import Ball, { createBall } from "../components/Ball/Ball";
import Paddle, { createPaddle } from "../components/Paddle/Paddle";
import Bricks, { createBricks } from "../components/Brick/Bricks";
import Powerup, { createPowerup } from "../components/Powerup/Powerup";
import Powerups, { createPowerups } from "../components/Powerup/Powerups";
import { Sprites, Events, Sounds, Scenes, Anims } from "../constants";
import Brick from "../components/Brick/Brick";

export class Game extends Phaser.Scene {
  private ball!: Ball;
  private paddle!: Paddle;
  private bricks!: Bricks;
  private powerups!: Powerups;
  private level!: number;
  private lives!: number;
  private isStageCleared = false;
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };
  canvasW!: number;
  canvasH!: number;

  constructor() {
    super({
      key: Scenes.game,
      physics: {
        default: "arcade",
        arcade: {},
      },
    });
  }

  create() {
    this.scene.run(Scenes.ui);

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.level = 1;
    sceneEvents.emit(Events.levelChanged, this.level);

    this.initSounds();
    this.initLives();
    this.ball = createBall(this);
    this.paddle = createPaddle(this);
    this.bricks = createBricks(this, this.level);
    this.powerups = createPowerups(this);

    this.addColliders();

    // start ball on click
    [Events.levelChanged, Events.livesChanged].forEach((e) => {
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
    this.paddle.update();

    // balls falls under
    if (this.ball.y > this.canvasH + this.ball.height) {
      if (this.lives > 1) this.sounds.lifeLost.play();
      this.lives--;
      this.setLives();
      this.ball.reset(this.paddle.x);
      this.paddle.reset();
      this.powerups.clear(undefined, true);
    }

    // no lives remaining
    if (this.lives < 1) {
      this.scene.pause(Scenes.ui);
      this.scene.launch(Scenes.gameOver);
      this.scene.stop();
      this.ball.reset(this.paddle.x);
      this.paddle.reset();
      this.powerups.clear(undefined, true);
    }

    // stage cleared
    // TODO review advance level logic
    if (this.bricks.getChildren().length === 0 && !this.isStageCleared)
      this.isStageCleared = true;
    if (this.isStageCleared) {
      setTimeout(() => {
        this.level++;
        this.powerups.clear(undefined, true);
        sceneEvents.emit(Events.levelChanged, this.level);
        this.scene.resume();
        this.bricks = createBricks(this, this.level);
        this.ball.reset(this.paddle.x);
        this.paddle.reset();
        this.addColliders();
        this.isStageCleared = false;
      }, 1000);
      this.scene.pause();
    }
  }

  initSounds() {
    this.sounds = {
      bounce: this.sound.add(Sounds.bounce, { loop: false }),
      brickbreak: this.sound.add(Sounds.brickbreak, { loop: false }),
      lifeLost: this.sound.add(Sounds.lifeLost, { loop: false }),
      fire: this.sound.add(Sounds.fireBrick, { loop: false }),
      hitWall: this.sound.add(Sounds.hitWall, { loop: false }),
      fireBrickbreak: this.sound.add(Sounds.fireBrickbreak, { loop: false }),
    };
  }

  createSmoke(x: number, y: number) {
    const smoke = this.add.sprite(x, y, Sprites.smoke).play(Anims.smoke);
    smoke.setScale(1.5, 1.5);
    smoke.on("animationcomplete", () => {
      smoke.destroy();
    });
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
    sceneEvents.emit(Events.livesChanged, this.lives);
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
      this.powerupHitPaddle,
      undefined,
      this
    );
  }

  powerupHitPaddle(_: any, obj2: any) {
    const powerup = obj2 as Powerup;
    switch (powerup.getData("power")) {
      case Sprites.getLife:
        if (this.lives < 4) {
          this.lives++;
          this.setLives();
        }
        break;
      case Sprites.loseLife:
        this.lives--;
        this.setLives();
        break;
      case Sprites.expandPaddle:
        this.paddle.expand();
        break;
      case Sprites.shrinkPaddle:
        this.paddle.shrink();
        break;
      case Sprites.igniteBall:
        this.ball.ignite();
        break;
    }
    powerup.destroy();
  }

  // TODO move ballHitPaddle logic to Ball
  ballHitPaddle(obj1: any, _: any) {
    // for overlap
    // this.ball.setVelocityY(-this.ball.body?.velocity.y!);
    if (this.ball.isIgnited) this.createSmoke(this.ball.x, this.ball.y);
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

  ballHitBrick(obj1: any, obj2: any) {
    // if (this.ball.isIgnited);
    const brick = obj2 as Phaser.Physics.Arcade.Sprite;
    const brickType = brick.getData("type");
    const entry = brick.getData("number");
    if (brickType === "common") {
      this.sounds.brickbreak.play();
    }
    if (brickType === "fire" || this.ball.isIgnited) {
      this.sounds.fireBrickbreak.play();
      this.destroyFireBricks(entry);
      this.createSmoke(obj1.x, obj1.y);
    } else {
      brick.destroy();
    }

    ////////////// POWER UP //////////////////////////
    const randomValue = Math.ceil(Math.random() * 15);
    if (randomValue !== 1) return;
    const powerupName = this.powerups.getRandomPowerup();
    const powerup = createPowerup(this, brick.x, brick.y, powerupName).setData(
      "power",
      powerupName
    );
    this.powerups.addPowerup(powerup, {
      x: this.ball.body?.velocity.x! - 150,
      y: -this.ball.body?.velocity.y!,
    });
  }
  async destroyFireBricks(entry: number) {
    const queue: any[] = [];
    const checkedBricks = new Set();
    const bricksToDestroy = [];

    queue.push(entry);
    checkedBricks.add(entry);
    let brickType: string;

    // to make sure the first iteration is always treated as fire brick
    let i = 0;

    while (queue.length > 0) {
      const currentBrickNumber = queue.shift();
      const currentBrick = this.bricks
        .getChildren()
        .find((brick) => brick.getData("number") === currentBrickNumber);
      if (currentBrick) {
        brickType = currentBrick.getData("type");
        bricksToDestroy.push(currentBrick);
        if (brickType === "fire" || i === 0) {
          const neighbours = this.getNeighbors(currentBrickNumber!);
          for (const neighbour of neighbours) {
            if (!checkedBricks.has(neighbour)) {
              queue.push(neighbour);
              checkedBricks.add(neighbour);
            }
          }
        } else {
          checkedBricks.add(currentBrick.getData("number"));
        }
      }
      i++;
    }

    for (const brick of bricksToDestroy) {
      await new Promise((f) => setTimeout(f, 10));
      brick.destroy();
    }
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
