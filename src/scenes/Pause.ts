export class Pause extends Phaser.Scene {
  private buttons!: {
    [key: string]: Phaser.GameObjects.Sprite;
  };
  private shuffle!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

  constructor() {
    super({ key: "pause" });
  }

  preload() {}

  create() {
    this.shuffle = this.sound.add("shuffle", { loop: false });

    this.cameras.main.setBackgroundColor("#000");

    this.buttons = {
      resumeButton: this.initResumeButton(),
      restartButton: this.initRestartButton(),
      backToMenuButton: this.initBackToMenuButton(),
    };
    this.addButtonAnimations();

    this.buttons.resumeButton.on("pointerdown", () => {
      this.scene.resume("game");
      this.scene.resume("UI");
      this.scene.stop();
    });
    this.buttons.restartButton.on("pointerdown", () => {
      this.scene.start("game");
      this.scene.stop();
    });
    this.buttons.backToMenuButton.on("pointerdown", () => {
      this.scene.stop("game");
      this.scene.start("start");
      this.scene.stop();
    });
  }

  initResumeButton() {
    const resumeButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 - 70, "resume")
      .setInteractive();
    resumeButton.setOrigin(0.5, 0.5);
    return resumeButton;
  }

  initRestartButton() {
    const restartButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2, "restart")
      .setInteractive();
    restartButton.setOrigin(0.5, 0.5);
    return restartButton;
  }

  initBackToMenuButton() {
    const backToMenuButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 + 80, "backToMenu")
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
    this.shuffle.play();
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
