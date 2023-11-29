export class StartScene extends Phaser.Scene {
  startButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "StartScene" });
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#000");
    this.initStartButton();

    for (let button of [this.startButton]) {
      button.on("pointerover", () => this.handleMouseOver(button), this);
      button.on("pointerout", () => this.handleMouseOut(button), this);
    }

    this.startButton.on("pointerdown", () => {
      this.scene.start("GameScene");
      this.scene.stop();
    });
  }

  initStartButton() {
    this.startButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 50, "Start", {
        fontSize: "32px",
        color: "red",
      })
      .setInteractive();
    this.startButton.setOrigin(0.5, 0.5);
  }

  handleMouseOver(button: Phaser.GameObjects.Text) {
    button.setScale(1.1);
  }
  handleMouseOut(button: Phaser.GameObjects.Text) {
    button.setScale(1);
  }
}
