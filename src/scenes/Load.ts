import { createBricksAnims } from "../anims/brickAnims";
import { createPaddleAnims } from "../anims/paddleAnims";
import { createTextAnims } from "../anims/textAnims";

export class Load extends Phaser.Scene {
  constructor() {
    super({ key: "load" });
  }

  preload() {
    ////////// IMAGES /////////////////////
    this.load.image("ball", "assets/images/ball.png");
    // paddle
    this.load.spritesheet("paddle", "assets/images/paddle/paddle.png", {
      frameHeight: 20,
      frameWidth: 120,
    });
    this.load.spritesheet(
      "longPaddle",
      "assets/images/paddle/long-paddle.png",
      {
        frameHeight: 20,
        frameWidth: 180,
      }
    );
    this.load.spritesheet(
      "shortPaddle",
      "assets/images/paddle/short-paddle.png",
      {
        frameHeight: 20,
        frameWidth: 64,
      }
    );
    this.load.spritesheet(
      "paddleGetsLonger",
      "assets/images/paddle/paddle-gets-longer.png",
      { frameWidth: 180, frameHeight: 20 }
    );
    this.load.spritesheet(
      "paddleGetsShorter",
      "assets/images/paddle/paddle-gets-shorter.png",
      { frameWidth: 120, frameHeight: 20 }
    );
    this.load.spritesheet("brick", "assets/images/brick/brick.png", {
      frameWidth: 51,
      frameHeight: 20,
    });
    this.load.spritesheet("brickFire", "assets/images/brick/brick-fire.png", {
      frameWidth: 51,
      frameHeight: 20,
    });
    // powerups
    this.load.image("getLife", "assets/images/powerups/get_life.png");
    this.load.image("loseLife", "assets/images/powerups/lose_life.png");
    this.load.image("longerPaddle", "assets/images/powerups/long_paddle.png");
    this.load.image("shorterPaddle", "assets/images/powerups/short_paddle.png");
    // ui
    this.load.image("pause-btn", "assets/images/pause-btn.png");
    this.load.image("heart", "assets/images/heart.png");
    // text
    this.load.image("start", "assets/images/text/start.png");
    this.load.image("restart", "assets/images/text/restart.png");
    this.load.image("resume", "assets/images/text/resume.png");
    this.load.image("backToMenu", "assets/images/text/back_to_menu.png");
    this.load.spritesheet("gameOver", "assets/images/text/game_over.png", {
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
    // TODO convert to mp3 -> ogg not valid for safari
    this.load.audio("buttonPressed", "assets/sounds/button_pressed.ogg");
    this.load.audio("hitWall", "assets/sounds/hit_wall.ogg");
  }

  create() {
    createBricksAnims(this.anims);
    createPaddleAnims(this.anims);
    createTextAnims(this.anims);
    this.scene.start("start");
  }
}
