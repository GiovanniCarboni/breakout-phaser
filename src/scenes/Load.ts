import { createBricksAnims } from "../anims/brickAnims";
import { createPaddleAnims } from "../anims/paddleAnims";

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
    this.load.spritesheet("gameOver", "assets/text/game_over.png", {
      frameWidth: 360,
      frameHeight: 40,
    });

    ////////// AUDIO /////////////////////
    this.load.audio("bounce", "assets/sounds/bounce.wav");
    this.load.audio("brickbreak", "assets/sounds/brickbreak.wav");
    this.load.audio("shuffle", "assets/sounds/shuffle.mp3");
    this.load.audio("gameOver", "assets/sounds/game_over.mp3");
    this.load.audio("lifeLost", "assets/sounds/lost_life.mp3");
    this.load.audio("fire", "assets/sounds/fire.mp3");
    this.load.audio("hitWall", "assets/sounds/hit_wall.ogg");
  }

  create() {
    createBricksAnims(this.anims);
    createPaddleAnims(this.anims);

    const text = this.add.text(400, 300, "Loading", {
      fontSize: "32px",
      color: "red",
    });

    text.setOrigin(0.5, 0.5);

    setTimeout(() => {
      this.scene.start("start");
    }, 1000);
  }
}
