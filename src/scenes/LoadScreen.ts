export class LoadScreen extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    setTimeout;
    this.load.image("ball", "assets/images/ball.png");
    this.load.spritesheet("paddle", "assets/images/paddle.png", {
      frameHeight: 20,
      frameWidth: 120,
    });
    this.load.spritesheet("brick", "assets/images/brick.png", {
      frameWidth: 51,
      frameHeight: 20,
    });
    this.load.spritesheet("brickFire", "assets/images/brick-fire.png", {
      frameWidth: 51,
      frameHeight: 20,
    });
  }

  create() {
    const text = this.add.text(400, 300, "Loading", {
      fontSize: "32px",
      color: "red",
    });
    text.setOrigin(0.5, 0.5);
    this.scene.start("GameScene");
  }
}
