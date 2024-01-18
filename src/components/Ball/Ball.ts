import { Anims, Sounds, Sprites } from "../../constants";
import Paddle from "../Paddle/Paddle";

export default class Ball extends Phaser.Physics.Arcade.Sprite {
  private canvasH: number;
  private canvasW: number;
  private startPosition;
  // private hitWallSound!:
  //   | Phaser.Sound.NoAudioSound
  //   | Phaser.Sound.HTML5AudioSound
  //   | Phaser.Sound.WebAudioSound;
  private ballIgnitionSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  private isMoving: boolean;
  public isIgnited = false;
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
    this.startPosition = { x: this.canvasW / 2, y: this.canvasH - 35 };

    this.isMoving = false;
  }

  init() {
    this.y = this.startPosition.y - this.height;
    this.setCollideWorldBounds(true);
    this.setBounce(1);
    // this.hitWallSound = this.scene.sound.add(Sounds.hitWall, {
    //   loop: false,
    //   volume: 0.6,
    // });
    this.ballIgnitionSound = this.scene.sound.add(Sounds.ballIgnition, {
      loop: false,
    });

    //////////////// debug ////////////////
    // debug fire ball
    // this.ignite();
  }

  update(paddle: Paddle) {
    if (!this.isMoving) this.x = paddle.x;

    // to modify. not reliable. Sound on hit wall
    // if (this.x < 8 || this.x > this.canvasW - 8 || this.y < 8)
    //   if (!this.hitWallSound.isPlaying) this.hitWallSound.play();

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

  start() {
    this.setVelocity(100, -380);
    this.isMoving = true;
  }

  reset(x: number, y?: number) {
    this.isMoving = false;
    this.isIgnited = false;
    this.setVelocity(0);
    this.setAngle(0);
    // reset ball texture
    this.anims.stop();
    this.setTexture(Sprites.ball);
    this.setScale(1, 1);
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
