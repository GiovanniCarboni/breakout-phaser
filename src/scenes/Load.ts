import { Fonts, Scenes, Sounds, Sprites } from "../constants";
import { createBricksAnims } from "../anims/brickAnims";
import { createPaddleAnims } from "../anims/paddleAnims";
import { createUiAnims } from "../anims/uiAnims";
import { createBallAnims } from "../anims/ballAnims";
import { WebFontFileLoader } from "../scripts/webfontloader";

export class Load extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.load });
  }

  preload() {
    ////////// IMAGES /////////////////////
    // ball
    this.load.image(Sprites.ball, "assets/images/ball/ball.png");
    this.load.spritesheet(
      Sprites.fireBall,
      "assets/images/ball/fire_ball.png",
      {
        frameWidth: 12,
        frameHeight: 18,
      }
    );
    this.load.atlas(
      Sprites.paddle,
      "assets/images/paddle/paddle.png",
      "assets/images/paddle/paddle.json"
    );
    this.load.image(Sprites.cannon, "assets/images/paddle/cannon.png");
    this.load.spritesheet(
      Sprites.cannonShooting,
      "assets/images/paddle/cannon_shooting.png",
      { frameWidth: 10, frameHeight: 8 }
    );
    this.load.image(Sprites.bullet, "assets/images/paddle/bullet.png");
    // brick
    this.load.image(Sprites.blankBrick, "assets/images/brick/blank_brick.png");
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
    this.load.spritesheet(
      Sprites.burnBrick,
      "assets/images/brick/burn_brick.png",
      {
        frameWidth: 51,
        frameHeight: 20,
      }
    );
    this.load.spritesheet(
      Sprites.metalBrick,
      "assets/images/brick/metal_brick.png",
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
    this.load.image(
      Sprites.igniteBall,
      "assets/images/powerups/ignite_ball.png"
    );
    this.load.image(
      Sprites.addShooter,
      "assets/images/powerups/add_shooter.png"
    );
    // ui
    this.load.image(Sprites.headbar, "assets/images/UI/headbar.png");
    this.load.image(Sprites.pauseButton, "assets/images/UI/pause_button.png");
    this.load.image(Sprites.heart, "assets/images/UI/heart.png");
    this.load.image(
      Sprites.brickSelector,
      "assets/images/UI/brick_selector.png"
    );
    this.load.image(
      Sprites.brickHighlight,
      "assets/images/UI/brick_highlight.png"
    );
    this.load.spritesheet(
      Sprites.playButton,
      "assets/images/UI/play_button.png",
      {
        frameWidth: 120,
        frameHeight: 120,
      }
    );
    this.load.spritesheet(
      Sprites.genericButton,
      "assets/images/UI/generic_button.png",
      { frameWidth: 270, frameHeight: 73 }
    );
    this.load.spritesheet(
      Sprites.mainButton,
      "assets/images/UI/main_button.png",
      { frameWidth: 270, frameHeight: 73 }
    );
    this.load.image(Sprites.menuBox2, "assets/images/UI/menu_box_2.png");
    this.load.image(Sprites.menuBox3, "assets/images/UI/menu_box_3.png");
    this.load.image(Sprites.menuBox4, "assets/images/UI/menu_box_4.png");
    this.load.image(Sprites.menuHanger, "assets/images/UI/menu_hanger.png");
    this.load.spritesheet(
      Sprites.backButton,
      "assets/images/UI/back_button.png",
      {
        frameWidth: 80,
        frameHeight: 33,
      }
    );
    this.load.spritesheet(
      Sprites.clearButton,
      "assets/images/UI/clear_button.png",
      {
        frameWidth: 33,
        frameHeight: 33,
      }
    );
    // text
    this.load.image(Sprites.start, "assets/images/text/start.png");
    this.load.image(Sprites.restart, "assets/images/text/restart.png");
    this.load.image(Sprites.resume, "assets/images/text/resume.png");
    this.load.image(Sprites.backToMenu, "assets/images/text/back_to_menu.png");
    this.load.image(Sprites.customLevel, "assets/images/text/custom_level.png");

    this.load.spritesheet(
      Sprites.gameOver,
      "assets/images/text/game_over.png",
      {
        frameWidth: 360,
        frameHeight: 40,
      }
    );
    // others
    this.load.spritesheet(Sprites.smoke, "assets/images/smoke.png", {
      frameWidth: 26,
      frameHeight: 26,
    });
    this.load.image(Sprites.sparkle, "assets/images/sparkle.png");

    ////////// AUDIO /////////////////////
    this.load.audio(Sounds.bounce, "assets/sounds/bounce.mp3");
    this.load.audio(Sounds.brickbreak, "assets/sounds/brickbreak.mp3");
    this.load.audio(Sounds.fireBrickbreak, "assets/sounds/fire_brickbreak.mp3");
    this.load.audio(Sounds.shuffle, "assets/sounds/shuffle.mp3");
    this.load.audio(Sounds.gameOver, "assets/sounds/game_over.mp3");
    this.load.audio(Sounds.lifeLost, "assets/sounds/lost_life.mp3");
    this.load.audio(Sounds.fireBrick, "assets/sounds/fire.mp3");
    this.load.audio(Sounds.buttonPress, "assets/sounds/button_pressed.mp3");
    this.load.audio(Sounds.hitMetal, "assets/sounds/hit_metal.mp3");
    this.load.audio(Sounds.ballIgnition, "assets/sounds/ball_ignition.mp3");
    this.load.audio(Sounds.shot, "assets/sounds/shot.mp3");

    ////////// AUDIO /////////////////////
    this.load.addFile(new WebFontFileLoader(this.load, [Fonts.manaspace]));
  }

  create() {
    createBallAnims(this.anims);
    createBricksAnims(this.anims);
    createPaddleAnims(this.anims);
    createUiAnims(this.anims);
    this.scene.start(Scenes.start);
  }
}
