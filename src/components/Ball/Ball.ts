import { Anims, Sounds, Sprites } from "../../constants";
import Paddle from "../Paddle/Paddle";
import Brick from "../Brick/Brick";

export default class Ball extends Phaser.Physics.Arcade.Sprite {
  speedIncrement = 20;
  isIgnited = false;
  onSlowDownArea = false;
  slowDownArea!: Phaser.GameObjects.Arc;
  speed = 600;
  private isMoving: boolean;
  private canvasH: number;
  private canvasW: number;
  private startPosition;
  private ballIgnitionSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
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
    this.startPosition = { x: this.canvasW / 2, y: this.canvasH - 40 };

    this.isMoving = false;
    this.setScale(1.5, 1.5);
  }

  init() {
    this.y = this.startPosition.y - this.height;
    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.initSlowDownArea();
    this.ballIgnitionSound = this.scene.sound.add(Sounds.ballIgnition, {
      loop: false,
    });
    this.setData("isSlow", false);

    //////////////// debug ////////////////
    // debug fire ball
    // this.ignite();
  }

  update(paddle: Paddle, bricks: Phaser.GameObjects.GameObject[]) {
    if (!this.isMoving) this.x = paddle.x;

    ///////////////////////////////////////////////////
    // slow down approaching last brick
    if (
      bricks.filter((brick) => brick.getData("type") !== "metal").length === 1
    ) {
      if (!this.slowDownArea.getData("created")) {
        const lastBrick = bricks.find(
          (brick) => brick.getData("type") !== "metal"
        ) as Brick;
        this.slowDownArea.setX(lastBrick.x);
        this.slowDownArea.setY(lastBrick.y);
        this.slowDownArea.setData("created", true);
      }
    } else if (this.slowDownArea.getData("created")) {
      this.slowDownArea.setX(-200);
      this.slowDownArea.setY(-200);
      this.slowDownArea.setData("created", false);
    }
    ///////////////////////////////////////////////////

    ///////////////////////////////////////////////////
    // set ball speed
    if (this.onSlowDownArea && this.getData("isSlow") === false) {
      this.setData("previousSpeed", this.speed);
      this.setSpeed(200);
      this.setData("isSlow", true);
      // this.scene.cameras.main.pan(
      //   this.scene.scale.width + 100,
      //   this.scene.scale.height - 100,
      //   200
      // );
      // this.scene.cameras.main.setZoom(1.05, 1.05);
    }
    if (!this.onSlowDownArea && this.getData("isSlow") === true) {
      this.setSpeed(this.getData("previousSpeed"));
      this.setData("isSlow", false);
      // this.scene.cameras.main.pan(
      //   this.scene.scale.width / 2,
      //   this.scene.scale.height / 2,
      //   200
      // );
      // this.scene.cameras.main.setZoom(1, 1);
    }
    this.onSlowDownArea = false;
    ///////////////////////////////////////////////////

    ///////////////////////////////////////////////////
    // following code only for ignited ball
    if (!this.isIgnited) return;
    this.addFireSparkles();
    // adjust angle based on trajectory
    if (this.isMoving) {
      const angle = Phaser.Math.Angle.BetweenPoints(this, {
        x: this.x + this.body?.velocity.x!,
        y: this.y + this.body?.velocity.y!,
      });
      this.setAngle(Phaser.Math.RadToDeg(angle) - 90);
    }
  }

  initSlowDownArea() {
    // this.slowDownArea = this.scene.add.circle(-200, -200, 200, 0x6666ff);
    this.slowDownArea = this.scene.add.circle(-200, -200, 50);
    this.scene.physics.world.enableBody(
      this.slowDownArea,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );
  }

  start() {
    this.speed = 600;
    this.setMotion(70);
    this.isMoving = true;
  }

  setSpeed(speed: number) {
    let x = this.body?.velocity.x! / this.speed;
    let y = this.body?.velocity.y! / this.speed;
    this.speed = speed;
    x = x * speed;
    y = y * speed;
    this.setVelocity(x, y);
  }

  setMotion(direction: number) {
    this.setVelocity(
      Math.cos(Phaser.Math.DegToRad(direction)) * this.speed,
      Math.sin(Phaser.Math.DegToRad(-direction)) * this.speed
    );
  }

  reset(x: number, y?: number) {
    this.isMoving = false;
    this.isIgnited = false;
    this.setVelocity(0);
    this.setAngle(0);
    // reset ball texture
    this.anims.stop();
    this.setTexture(Sprites.ball);
    // reset position
    this.body?.reset(x, y || this.startPosition.y - this.height);
  }

  stopMovement() {
    this.setVelocity(0);
    this.isMoving = false;
  }

  ignite() {
    if (this.isIgnited) return;
    this.setScale(1.5, 1.5);
    this.isIgnited = true;
    this.play(Anims.fireBall);
    this.ballIgnitionSound.play();
  }

  addFireSparkles() {
    const randomValue = Math.ceil(Math.random() * 7);
    if (randomValue === 1 && this.isMoving) {
      const sparkle = this.scene.add.sprite(this.x, this.y, Sprites.sparkle);
      this.scene.time.addEvent({
        delay: Math.random() * 550,
        callback: () => sparkle.destroy(),
      });
    }
    if (randomValue === 2 && this.isMoving) {
      const sparkle = this.scene.add.sprite(
        this.x + 5,
        this.y - 2,
        Sprites.sparkle
      );
      this.scene.time.addEvent({
        delay: Math.random() * 450,
        callback: () => {
          sparkle.destroy();
        },
      });
    }
    if (randomValue === 3 && this.isMoving) {
      const sparkle = this.scene.add.sprite(
        this.x - 4,
        this.y - 3,
        Sprites.sparkle
      );
      this.scene.time.addEvent({
        delay: Math.random() * 250,
        callback: () => {
          sparkle.destroy();
        },
      });
    }
  }
}

export const createBall = function (scene: Phaser.Scene) {
  const ball = new Ball(scene, 0, 0, Sprites.ball);
  scene.add.existing(ball);
  scene.physics.world.enableBody(ball, Phaser.Physics.Arcade.DYNAMIC_BODY);
  ball.init();
  return ball;
};
