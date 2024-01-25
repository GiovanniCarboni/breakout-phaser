import { WinGame } from "./WinGame";
import { sceneEvents } from "../events/EventCenter";
import Ball, { createBall } from "../components/Ball/Ball";
import Paddle, { createPaddle } from "../components/Paddle/Paddle";
import Bricks, { createBricks } from "../components/Brick/Bricks";
import Powerup, { createPowerup } from "../components/Powerup/Powerup";
import Powerups, { createPowerups } from "../components/Powerup/Powerups";
import { Sprites, Events, Sounds, Scenes, Anims } from "../constants";

////////////////////////////////////////////////////////////////////////
///////////// METHODS //////////////////////////////////////////////////
/*
init
create
update
initSounds
createSmoke
initLives
setLives
addColliders
addPowerup
powerupHitPaddle
ballHitPaddle
bulletHitBrick
ballHitBrick
*/
///////////////////////////////////////////////////////////////////////

export class Game extends Phaser.Scene {
  private topEdge!: Phaser.Physics.Arcade.Image;
  private isCustom: boolean = false;
  private ball!: Ball;
  private paddle!: Paddle;
  private bricks!: Bricks;
  private powerups!: Powerups;
  private level?: number;
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

  init({ isCustom, template }: { isCustom: boolean; template: number[][] }) {
    if (isCustom) {
      this.bricks = createBricks(this, undefined, template);
      this.isCustom = true;
      sceneEvents.emit(Events.levelChanged, 0);
    } else if (!isCustom) {
      this.level = 1;
      this.isCustom = false;
      sceneEvents.emit(Events.levelChanged, this.level);
      this.bricks = createBricks(this, this.level);
    }
  }

  create() {
    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.initSounds();
    this.initLives();
    this.ball = createBall(this);
    this.paddle = createPaddle(this);
    this.powerups = createPowerups(this);

    //////////////// HEADBAR /////////////////////////////////////
    this.topEdge = this.physics.add
      .image(0, 0, Sprites.headbar)
      .setOrigin(0, 0)
      .setImmovable(true);

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
      this.scene.launch(Scenes.gameOver);
      this.scene.stop();
      this.ball.reset(this.paddle.x);
      this.paddle.reset();
      this.powerups.clear(undefined, true);
    }

    // stage cleared
    if (
      !this.bricks
        .getChildren()
        .some((brick) => brick.getData("type") !== "metal") &&
      !this.isStageCleared
    )
      this.isStageCleared = true;
    if (this.isStageCleared) {
      setTimeout(() => {
        this.powerups.clear(undefined, true);
        this.bricks.clear(true, true);
        this.isStageCleared = false;
        if (this.isCustom) {
          this.scene.stop();
          this.scene.start(Scenes.winGame, { isCustom: true });
        }
        if (!this.isCustom) {
          // if last level
          if (this.level === 2) {
            this.scene.stop();
            this.scene.start(Scenes.winGame, { isCustom: false });
            return;
          }
          this.level!++;
          sceneEvents.emit(Events.levelChanged, this.level);
          this.scene.resume(Scenes.game);
          this.bricks = createBricks(this, this.level);
          this.ball.reset(this.paddle.x);
          this.paddle.reset();
          this.addColliders();
        }
      }, 1000);
      this.scene.pause(Scenes.game);
    }
  }

  initSounds() {
    this.sounds = {
      bounce: this.sound.add(Sounds.bounce, { loop: false }),
      brickbreak: this.sound.add(Sounds.brickbreak, { loop: false }),
      lifeLost: this.sound.add(Sounds.lifeLost, { loop: false }),
      fire: this.sound.add(Sounds.fireBrick, { loop: false }),
      fireBrickbreak: this.sound.add(Sounds.fireBrickbreak, { loop: false }),
      hitMetal: this.sound.add(Sounds.hitMetal, { loop: false, volume: 0.3 }),
    };
  }

  // TODO Move create smoke to Ball
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
    this.physics.add.collider(
      this.paddle.bullets,
      this.bricks,
      this.bulletHitBrick,
      undefined,
      this
    );
    this.physics.add.collider(this.ball, this.topEdge);
  }

  addPowerup(x: number, y: number) {
    const randomValue = Math.ceil(Math.random() * 5);
    if (randomValue !== 1) return;
    const powerupName = this.powerups.getRandomPowerup();
    const powerup = createPowerup(this, x, y, powerupName).setData(
      "power",
      powerupName
    );
    this.powerups.addPowerup(powerup, {
      x: this.ball.body?.velocity.x! - 150,
      y: -this.ball.body?.velocity.y!,
    });
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
      case Sprites.addShooter:
        this.paddle.addCannons();
        break;
    }
    powerup.destroy();
  }

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

  bulletHitBrick(bulletObj: any, brickObj: any) {
    (bulletObj as Phaser.Physics.Arcade.Sprite).destroy();
    const brick = brickObj as Phaser.Physics.Arcade.Sprite;
    const brickType = brick.getData("type");

    if (brickType === "metal") {
      this.sounds.hitMetal.play();
      brick.play(Anims.metalBrick);
      return;
    }
    if (brickType === "common") {
      this.sounds.brickbreak.play();
      brick.play(Anims.commonBrick);
      brick.disableBody();
      brick.on("animationcomplete", () => {
        brick.destroy();
      });
      this.addPowerup(brick.x, brick.y);
    }
    if (brickType === "fire") {
      this.sounds.fireBrickbreak.play();
      this.createSmoke(bulletObj.x, bulletObj.y);
      this.bricks.destroyFireBricks(brick.getData("number"));
      this.addPowerup(brick.x, brick.y);
    }
  }

  ballHitBrick(obj1: any, obj2: any) {
    const brick = obj2 as Phaser.Physics.Arcade.Sprite;
    const brickType = brick.getData("type");
    if (brickType === "metal" && !this.ball.isIgnited) {
      this.sounds.hitMetal.play();
      brick.play(Anims.metalBrick);
      return;
    }

    if (brickType === "common" && !this.ball.isIgnited) {
      this.sounds.brickbreak.play();
      brick.play(Anims.commonBrick);
      brick.disableBody();
      brick.on("animationcomplete", () => {
        brick.destroy();
      });
      this.addPowerup(brick.x, brick.y);
    }

    if (brickType === "fire" || this.ball.isIgnited) {
      this.sounds.fireBrickbreak.play();
      this.createSmoke(obj1.x, obj1.y);
      this.bricks.destroyFireBricks(brick.getData("number"));
      this.addPowerup(brick.x, brick.y);
    }
  }
}
