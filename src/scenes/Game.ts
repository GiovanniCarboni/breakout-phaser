import { sceneEvents } from "../events/EventCenter";
import Ball, { createBall } from "../components/Ball/Ball";
import Paddle, { createPaddle } from "../components/Paddle/Paddle";
import Bricks, { createBricks } from "../components/Brick/Bricks";
import Powerup, { createPowerup } from "../components/Powerup/Powerup";
import Powerups, { createPowerups } from "../components/Powerup/Powerups";
import { Sprites, Events, Sounds, Scenes, Anims, StorageKeys } from "../constants";
import { transition } from "../anims/SceneTransitions";
import { storage } from "../utils/gneral";

export class Game extends Phaser.Scene {
  private isCustom: boolean = false;
  private topEdge!: Phaser.Physics.Arcade.Image;
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

  //////////////////////////////////////////////////////////////
  ////// INIT
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

  //////////////////////////////////////////////////////////////
  ////// CREATE
  create() {
    transition("fadeIn", this);

    this.cameras.main.setBackgroundColor("#110702");

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    this.physics.world.setBounds(0, 0, this.canvasW, this.canvasH);
    this.physics.world.setBoundsCollision(true, true, true, false);

    //////////////////////////////////////////////////////////////
    ////// ADD SIDEBARS
    this.add.sprite(0, 0, Sprites.sideBar).setOrigin(0, 0).setDepth(1);
    this.add
      .sprite(this.canvasW, 0, Sprites.sideBar)
      .setOrigin(1, 0)
      .setDepth(1);

    //////////////////////////////////////////////////////////////
    ////// INIT ELEMENTS
    this.initSounds();
    this.initLives();
    this.ball = createBall(this);
    this.paddle = createPaddle(this);
    this.powerups = createPowerups(this);

    //////////////////////////////////////////////////////////////
    ////// MESSAGE IF CANT SAVE/PLAY
    this.topEdge = this.physics.add
      .image(0, 0, Sprites.headbar)
      .setOrigin(0, 0)
      .setImmovable(true);

    //////////////////////////////////////////////////////////////
    ////// ADD COLLIDERS
    this.addColliders();

    //////////////////////////////////////////////////////////////
    ////// START BALL ON CLICK
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

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update(_: number, dt: number) {
    const bricks = this.bricks.getChildren();

    this.ball.update(this.paddle, bricks);
    this.paddle.update();

    ////// BALL FALLS BELOW
    if (this.ball.y > this.canvasH + this.ball.height) {
      if (this.lives > 1) this.sounds.lifeLost.play();
      this.lives--;
      this.setLives();
      this.ball.reset(this.paddle.x);
      this.paddle.reset();
      this.powerups.clear(undefined, true);
    }

    ////// NO MORE LIVES
    if (this.lives < 1) {
      this.scene.stop();
      this.scene.launch(Scenes.gameOver);
      this.ball.reset(this.paddle.x);
      this.paddle.reset();
      this.powerups.clear(undefined, true);
      return;
    }

    ////// IF LEVEL IS CLEARED
    if (
      !bricks.some((brick) => brick.getData("type") !== "metal") &&
      !this.isStageCleared
    )
      this.isStageCleared = true;

    ////// ADVANCE LEVEL / WIN
    if (this.isStageCleared) {
      setTimeout(() => this.onStageCleared(), 1000)
      this.scene.pause(Scenes.game);
    }
  }

  onStageCleared() {
    this.powerups.clear(undefined, true);
    this.bricks.clear(true, true);
    this.paddle.bullets.clear(true, true)
    this.isStageCleared = false;
    if (this.isCustom) {
      this.scene.stop();
      this.scene.start(Scenes.winGame, { isCustom: true });
    }
    if (!this.isCustom) {
      this.saveBestScore(this.level)
      // if last level
      if (this.level === 3) {
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
  }

  saveBestScore(newLevel: number|undefined) {
    const currentLevel = newLevel || 0
    const savedLevel = storage.get(StorageKeys.bestScore)
    if ((savedLevel && +currentLevel > +savedLevel) || !savedLevel) {
      storage.set(StorageKeys.bestScore, currentLevel)
    }
  }

  //////////////////////////////////////////////////////////////
  ////// INIT SOUNDS
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

  //////////////////////////////////////////////////////////////
  ////// INIT LIVES
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

  //////////////////////////////////////////////////////////////
  ////// SET LIVES
  setLives() {
    sceneEvents.emit(Events.livesChanged, this.lives);
  }

  //////////////////////////////////////////////////////////////
  ////// COLLIDERS
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
    this.physics.add.overlap(
      this.ball,
      this.ball.slowDownArea,
      () => (this.ball.onSlowDownArea = true),
      undefined,
      this
    );
    this.physics.add.collider(this.ball, this.topEdge);
  }

  //////////////////////////////////////////////////////////////
  ////// ADD POWERUP
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

  //////////////////////////////////////////////////////////////
  ////// POWERUP HIT BALL
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

  //////////////////////////////////////////////////////////////
  ////// BALL HIT PADDLE
  ballHitPaddle(obj1: any, _: any) {
    // increment speed
    if (this.ball.speed <= 900) {
      this.ball.setSpeed(this.ball.speed + this.ball.speedIncrement);
    }
    if (this.ball.isIgnited) this.ball.createSmoke(this.ball.x, this.ball.y);
    this.sounds.bounce.play();

    let diff = 0;
    if (this.ball.x < this.paddle.x) {
      diff = this.paddle.x - this.ball.x;
      const degree = 90 + (Math.ceil(diff) > 70 ? 70 : Math.ceil(diff));
      this.ball.setDegDirection(degree);
    } else if (this.ball.x > this.paddle.x) {
      diff = this.ball.x - this.paddle.x;
      const degree = 90 - (Math.ceil(diff) > 70 ? 70 : Math.ceil(diff));
      this.ball.setDegDirection(degree);
    } else {
      this.ball.setDegDirection(100);
    }
  }

  //////////////////////////////////////////////////////////////
  ////// BULLET HIT BRICK
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
      this.ball.createSmoke(bulletObj.x, bulletObj.y);
      this.bricks.destroyFireBricks(brick.getData("number"));
      this.addPowerup(brick.x, brick.y);
    }
    if (brickType === "ice") {
      this.sounds.brickbreak.play();
      const hits = brick.getData("hits")
      if (hits === 1) return (brick.disableBody(), brick.destroy())
      brick.play(Anims.iceBrickBreak);
      brick.on("animationcomplete", () => {
        brick.setData("hits", 1)
      });
      this.addPowerup(brick.x, brick.y);
    }
  }

  //////////////////////////////////////////////////////////////
  ////// BALL HIT BRICK
  ballHitBrick(obj1: any, obj2: any) {
    const brick = obj2 as Phaser.Physics.Arcade.Sprite;
    const brickType = brick.getData("type");
    if (brickType === "metal" && !this.ball.isIgnited) {
      this.cameras.main.shake(100, 0.005);
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

    if (brickType === "ice" && !this.ball.isIgnited) {
      this.sounds.brickbreak.play();
      const hits = brick.getData("hits")
      if (hits === 1) return (brick.disableBody(), brick.destroy())
      brick.play(Anims.iceBrickBreak);
      brick.on("animationcomplete", () => {
        brick.setData("hits", 1)
      });
      this.addPowerup(brick.x, brick.y);
    }

    if (brickType === "fire" || this.ball.isIgnited) {
      this.sounds.fireBrickbreak.play();
      this.ball.createSmoke(obj1.x, obj1.y);
      this.bricks.destroyFireBricks(brick.getData("number"));
      this.addPowerup(brick.x, brick.y);
    }
  }
}
