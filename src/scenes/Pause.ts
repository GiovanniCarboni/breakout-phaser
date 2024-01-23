import { Sounds, Sprites, Scenes } from "../constants";

export class Pause extends Phaser.Scene {
  private buttons!: {
    [key: string]: Phaser.GameObjects.Sprite;
  };
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };

  constructor() {
    super({ key: Scenes.pause });
  }

  preload() {}

  create() {
    this.sounds = {
      btnPressed: this.sound.add(Sounds.buttonPress, {
        loop: false,
        volume: 0.2,
      }),
      shuffle: this.sound.add(Sounds.shuffle, { loop: false }),
    };

    this.cameras.main.setBackgroundColor("#000");

    this.buttons = {
      resumeButton: this.initResumeButton(),
      restartButton: this.initRestartButton(),
      backToMenuButton: this.initBackToMenuButton(),
    };
    this.addButtonAnimations();

    this.buttons.resumeButton.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      this.scene.resume(Scenes.game);
      this.scene.stop();
    });
    this.buttons.restartButton.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.game);
    });
    this.buttons.backToMenuButton.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.start);
    });
  }

  initResumeButton() {
    const resumeButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 - 70, Sprites.resume)
      .setInteractive();
    resumeButton.setOrigin(0.5, 0.5);
    return resumeButton;
  }

  initRestartButton() {
    const restartButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2, Sprites.restart)
      .setInteractive();
    restartButton.setOrigin(0.5, 0.5);
    return restartButton;
  }

  initBackToMenuButton() {
    const backToMenuButton = this.add
      .sprite(
        this.scale.width / 2,
        this.scale.height / 2 + 80,
        Sprites.backToMenu
      )
      .setInteractive();
    backToMenuButton.setOrigin(0.5, 0.5);
    return backToMenuButton;
  }

  addButtonAnimations() {
    for (let button of Object.values(this.buttons)) {
      button.on("pointerover", () => this.handleMouseOver(button), this);
      button.on("pointerout", () => this.handleMouseOut(button), this);
    }
  }

  handleMouseOver(button: Phaser.GameObjects.Text | Phaser.GameObjects.Sprite) {
    this.sounds.shuffle.play();
    button.setScale(1.1);
    button.angle = -2;
    setTimeout(() => {
      button.angle = 2;
      setTimeout(() => {
        button.angle = 0;
      }, 100);
    }, 100);
  }
  handleMouseOut(button: Phaser.GameObjects.Text | Phaser.GameObjects.Sprite) {
    button.setScale(1);
  }
}
