export class Start extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Sprite;
  private shuffle!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

  constructor() {
    super({ key: "start" });
  }

  preload() {}

  create() {
    this.shuffle = this.sound.add("shuffle", { loop: false });

    this.cameras.main.setBackgroundColor("#000");
    this.initStartButton();

    for (let button of [this.startButton]) {
      button.on("pointerover", () => this.handleMouseOver(button), this);
      button.on("pointerout", () => this.handleMouseOut(button), this);
    }

    this.startButton.on("pointerdown", () => {
      this.scene.start("game");
      this.scene.stop();
    });
  }

  initStartButton() {
    this.startButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2, "start")
      .setInteractive();
  }

  handleMouseOver(button: Phaser.GameObjects.Sprite) {
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
  handleMouseOut(button: Phaser.GameObjects.Sprite) {
    button.setScale(1);
  }
}
