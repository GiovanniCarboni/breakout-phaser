import { Scenes, Sounds, Sprites } from "../constants";
import { createBricksAnims } from "../anims/brickAnims";
import { createPaddleAnims } from "../anims/paddleAnims";
import { createTextAnims } from "../anims/textAnims";

export class Load extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.load });
  }

  preload() {
    ////////// IMAGES /////////////////////
    // ball
    this.load.image(Sprites.ball, "assets/images/ball.png");
    // paddle
    this.load.spritesheet(
      Sprites.defaultPaddle,
      "assets/images/paddle/default_paddle.png",
      {
        frameHeight: 20,
        frameWidth: 120,
      }
    );
    this.load.spritesheet(
      Sprites.longPaddle,
      "assets/images/paddle/long_paddle.png",
      {
        frameHeight: 20,
        frameWidth: 180,
      }
    );
    this.load.spritesheet(
      Sprites.shortPaddle,
      "assets/images/paddle/short_paddle.png",
      {
        frameHeight: 20,
        frameWidth: 64,
      }
    );
    this.load.spritesheet(
      Sprites.paddleTransition2,
      "assets/images/paddle/paddle_transition_2.png",
      { frameWidth: 180, frameHeight: 20 }
    );
    this.load.spritesheet(
      Sprites.paddletransition1,
      "assets/images/paddle/paddle_transition_1.png",
      { frameWidth: 120, frameHeight: 20 }
    );
    // brick
    this.load.spritesheet(
      Sprites.commonBrick,
      "assets/images/brick/common_brick.png",
      {
        frameWidth: 51,
        frameHeight: 20,
      }
    );
    this.load.spritesheet(
      Sprites.fireBrick,
      "assets/images/brick/fire_brick.png",
      {
        frameWidth: 51,
        frameHeight: 20,
      }
    );
    // powerups
    this.load.image(Sprites.getLife, "assets/images/powerups/get_life.png");
    this.load.image(Sprites.loseLife, "assets/images/powerups/lose_life.png");
    this.load.image(
      Sprites.expandPaddle,
      "assets/images/powerups/expand_paddle.png"
    );
    this.load.image(
      Sprites.shrinkPaddle,
      "assets/images/powerups/shrink_paddle.png"
    );
    // ui
    this.load.image(Sprites.pause, "assets/images/pause.png");
    this.load.image(Sprites.heart, "assets/images/heart.png");
    // text
    this.load.image(Sprites.start, "assets/images/text/start.png");
    this.load.image(Sprites.restart, "assets/images/text/restart.png");
    this.load.image(Sprites.resume, "assets/images/text/resume.png");
    this.load.image(Sprites.backToMenu, "assets/images/text/back_to_menu.png");
    this.load.spritesheet(
      Sprites.gameOver,
      "assets/images/text/game_over.png",
      {
        frameWidth: 360,
        frameHeight: 40,
      }
    );

    ////////// AUDIO /////////////////////
    this.load.audio(Sounds.bounce, "assets/sounds/bounce.wav");
    this.load.audio(Sounds.brickbreak, "assets/sounds/brickbreak.wav");
    this.load.audio(Sounds.shuffle, "assets/sounds/shuffle.mp3");
    this.load.audio(Sounds.gameOver, "assets/sounds/game_over.mp3");
    this.load.audio(Sounds.lifeLost, "assets/sounds/lost_life.mp3");
    this.load.audio(Sounds.fireBrick, "assets/sounds/fire.mp3");
    // TODO convert to mp3 -> ogg not valid for safari
    this.load.audio(Sounds.buttonPress, "assets/sounds/button_pressed.ogg");
    this.load.audio(Sounds.hitWall, "assets/sounds/hit_wall.ogg");
  }

  create() {
    createBricksAnims(this.anims);
    createPaddleAnims(this.anims);
    createTextAnims(this.anims);
    this.scene.start(Scenes.start);
  }
}
