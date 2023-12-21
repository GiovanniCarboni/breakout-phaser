export class GameOver extends Phaser.Scene {
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
    super({ key: "gameOver" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#000");

    this.sounds = {
      shuffle: this.sound.add("shuffle", { loop: false }),
      gameOver: this.sound.add("gameOver", { loop: false }),
      btnPressed: this.sound.add("buttonPressed", { loop: false, volume: 0.2 }),
    };

    this.sounds.gameOver.play();

    // GAME OVER TEXT
    this.initGameOverText();

    // BUTTONS
    this.buttons = {
      restartButton: this.initRestartButton(),
      backToMenuButton: this.initBackToMenuButton(),
    };
    this.addButtonAnimations();

    // EVENTS
    this.buttons.restartButton.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      this.scene.stop("game");
      this.scene.start("game");
    });
    this.buttons.backToMenuButton.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      this.scene.stop("game");
      this.scene.start("start");
      this.scene.stop();
    });
  }

  initGameOverText() {
    this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 - 70, "gameOver")
      .play("gameOver");
    // .setScale(1.2)
  }

  initRestartButton() {
    const restartButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 + 80, "restart")
      .setInteractive();
    restartButton.setOrigin(0.5, 0.5);
    return restartButton;
  }

  initBackToMenuButton() {
    const backToMenuButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 + 160, "backToMenu")
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
