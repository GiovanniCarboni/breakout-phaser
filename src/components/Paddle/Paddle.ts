import { Anims, Sounds, Sprites } from "../../constants";

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
  // 1 = short; 2 = default; 3 = long
  private paddleLength: 1 | 2 | 3 = 2;
  private canvasH: number;
  private canvasW: number;
  public cannons!: Phaser.Physics.Arcade.Group;
  public bullets!: Phaser.Physics.Arcade.Group;
  private shotSound!:
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
  }

  //////////////////////////////////////////////////////////////
  ////// INIT
  init() {
    this.x = this.canvasW / 2;
    this.y = this.canvasH - 30;
    this.setInteractive();
    this.setImmovable(true);
    this.play(Anims.defaultPaddle);
    this.setSize(this.frame.width, 20);
    this.scene.input.on("pointermove", this.handleInput, this);
    // add empty cannon and bullet groups
    this.cannons = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    });
    this.bullets = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 6,
      createCallback: (go) => {
        setTimeout(() => {
          go.destroy();
        }, 1500);
      },
    });
    this.shotSound = this.scene.sound.add(Sounds.shot, {
      loop: false,
      volume: 0.3,
    });

    //////////////// debug ////////////////
    // debug cannons
    // this.addCannons();
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update() {
    if (this.x < 0 + this.width / 2) this.x = 0 + this.width / 2;
    if (this.x > this.canvasW - this.width / 2)
      this.x = this.canvasW - this.width / 2;

    if (this.cannons.getLength()) {
      const xL = this.x - this.width / 2 + 15;
      const xR = this.x + this.width / 2 - 16;
      const y = this.y - this.height / 2 - 3;
      this.cannons.children.each((child, i) => {
        const cannon = child as Phaser.Physics.Arcade.Sprite;
        if (i === 0) cannon.setPosition(xL, y);
        if (i === 1) cannon.setPosition(xR, y);
        return true;
      });
    }
  }

  //////////////////////////////////////////////////////////////
  ////// RESET PADDLE (POSITION, SIZE, REMOVES POWERUPS)
  reset() {
    this.x = this.canvasW / 2;
    this.play(Anims.defaultPaddle);
    this.setSize(this.frame.width, 20);
    this.paddleLength = 2;

    if (this.cannons.getLength()) {
      this.removeCannons();
      this.scene.input.off("pointerdown", this.handleShoot, this);
    }
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE PADDLE MOVE (MOUSE)
  handleInput(pointer: Phaser.Input.Pointer) {
    const paddlePosition =
      pointer.x > this.canvasW - this.width / 2
        ? this.canvasW - this.width / 2
        : pointer.x < this.width / 2
        ? this.width / 2
        : pointer.x;
    this.x = paddlePosition || this.canvasW / 2;
  }

  //////////////////////////////////////////////////////////////
  ////// EXPAND PADDLES
  expand() {
    if (this.paddleLength === 3) return;
    if (this.paddleLength === 2) {
      this.play(Anims.paddleGetsLonger2);
      this.on("animationcomplete", () => {
        this.play(Anims.longPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    if (this.paddleLength === 1) {
      this.play(Anims.paddleGetsLonger1);
      this.on("animationcomplete", () => {
        this.play(Anims.defaultPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    this.paddleLength++;
  }

  //////////////////////////////////////////////////////////////
  ////// SHRINK PADDLE
  shrink() {
    if (this.paddleLength === 1) return;
    if (this.paddleLength === 2) {
      this.play(Anims.paddleGetsShorter1);
      this.on("animationcomplete", () => {
        this.play(Anims.shortPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    if (this.paddleLength === 3) {
      this.play(Anims.paddleGetsShorter2);
      this.on("animationcomplete", () => {
        this.play(Anims.defaultPaddle);
        this.setSize(this.frame.width, 20);
      });
    }
    this.paddleLength--;
  }

  //////////////////////////////////////////////////////////////
  ////// ADD SHOOTER POWERUP
  addCannons() {
    if (this.cannons.getLength()) return;
    this.cannons.get(this.x, this.y, Sprites.cannon);
    this.cannons.get(this.x, this.y, Sprites.cannon);
    this.scene.input.on("pointerdown", this.handleShoot, this);
  }

  //////////////////////////////////////////////////////////////
  ////// REMOVE SHOOTER POWERUP
  removeCannons() {
    this.cannons.clear(true, true);
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE SHOOT
  handleShoot() {
    if (this.bullets.countActive() >= 5) return;

    this.cannons.children.each((child, i) => {
      (child as Phaser.Physics.Arcade.Sprite).play(Anims.shoot);
      return true;
    });

    const cannonL =
      this.cannons.getChildren()[0] as Phaser.Physics.Arcade.Sprite;
    const cannonR =
      this.cannons.getChildren()[1] as Phaser.Physics.Arcade.Sprite;

    const lBullet = this.bullets.get(cannonL.x, cannonL.y, Sprites.bullet);
    lBullet.setVelocity(0, -550);
    lBullet.setDepth(-1);
    const rBullet = this.bullets.get(cannonR.x, cannonR.y, Sprites.bullet);
    rBullet.setVelocity(0, -550);
    rBullet.setDepth(-1);

    this.shotSound.play();
  }
}

export const createPaddle = function (scene: Phaser.Scene) {
  const paddle = new Paddle(scene, 0, 0, Sprites.paddle);
  scene.add.existing(paddle);
  scene.physics.world.enableBody(paddle, Phaser.Physics.Arcade.DYNAMIC_BODY);
  paddle.init();
  return paddle;
};
