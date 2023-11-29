export class PauseScene extends Phaser.Scene {
  resumeButton!: Phaser.GameObjects.Text;
  restartButton!: Phaser.GameObjects.Text;
  backToMenuButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "PauseScene" });
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#000");
    this.initResumeButton();
    this.initRestartButton();
    this.initBackToMenuButton();

    for (let button of [
      this.resumeButton,
      this.restartButton,
      this.backToMenuButton,
    ]) {
      button.on("pointerover", () => this.handleMouseOver(button), this);
      button.on("pointerout", () => this.handleMouseOut(button), this);
    }

    this.resumeButton.on("pointerdown", () => {
      this.scene.resume("GameScene");
      this.scene.stop();
    });
    this.restartButton.on("pointerdown", () => {
      this.scene.start("GameScene");
      this.scene.stop();
    });
    this.backToMenuButton.on("pointerdown", () => {
      this.scene.stop("GameScene");
      this.scene.start("StartScene");
      this.scene.stop();
    });
  }

  initResumeButton() {
    this.resumeButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 50, "Resume", {
        fontSize: "32px",
        color: "red",
      })
      .setInteractive();
    this.resumeButton.setOrigin(0.5, 0.5);
  }

  initRestartButton() {
    this.restartButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Restart", {
        fontSize: "32px",
        color: "red",
      })
      .setInteractive();
    this.restartButton.setOrigin(0.5, 0.5);
  }

  initBackToMenuButton() {
    this.backToMenuButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 80, "Back to Menu", {
        fontSize: "32px",
        color: "red",
      })
      .setInteractive();
    this.backToMenuButton.setOrigin(0.5, 0.5);
  }

  handleMouseOver(button: Phaser.GameObjects.Text) {
    button.setScale(1.1);
  }
  handleMouseOut(button: Phaser.GameObjects.Text) {
    button.setScale(1);
  }
}
