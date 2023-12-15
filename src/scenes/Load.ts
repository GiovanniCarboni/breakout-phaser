export class Load extends Phaser.Scene {
  constructor() {
    super({ key: "load" });
  }

  preload() {
    ////////// IMAGES /////////////////////
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
    // ui
    this.load.image("pause-btn", "assets/images/pause-btn.png");
    this.load.image("heart", "assets/images/heart.png");
    // text
    this.load.image("start", "assets/text/start.png");
    this.load.image("restart", "assets/text/restart.png");
    this.load.image("resume", "assets/text/resume.png");
    this.load.image("backToMenu", "assets/text/back_to_menu.png");

    ////////// AUDIO /////////////////////
    this.load.audio("bounce", "assets/sounds/bounce.wav");
    this.load.audio("brickbreak", "assets/sounds/brickbreak.wav");
    this.load.audio("shuffle", "assets/sounds/shuffle.mp3");
    this.load.audio("gameOver", "assets/sounds/game_over.mp3");
    this.load.audio("lifeLost", "assets/sounds/lost_life.mp3");
    this.load.audio("fire", "assets/sounds/fire.mp3");
  }

  create() {
    const text = this.add.text(400, 300, "Loading", {
      fontSize: "32px",
      color: "red",
    });
    text.setOrigin(0.5, 0.5);
    this.scene.start("start");
  }
}
