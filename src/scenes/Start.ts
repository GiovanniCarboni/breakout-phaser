import { Scenes, Sounds, Sprites } from "../constants";

export class Start extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Sprite;
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };

  constructor() {
    super({ key: Scenes.start });
  }

  preload() {}

  create() {
    this.sounds = {
      shuffle: this.sound.add(Sounds.shuffle, { loop: false, volume: 0.2 }),
      btnPressed: this.sound.add(Sounds.buttonPress, {
        loop: false,
        volume: 0.2,
      }),
    };

    this.cameras.main.setBackgroundColor("#000");
    this.initStartButton();

    for (let button of [this.startButton]) {
      button.on("pointerover", () => this.handleMouseOver(button), this);
      button.on("pointerout", () => this.handleMouseOut(button), this);
    }

    this.startButton.on("pointerdown", () => {
      this.sounds.btnPressed.play();
      this.scene.start(Scenes.game);
      this.scene.stop();
    });
  }

  initStartButton() {
    this.startButton = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2, Sprites.start)
      .setInteractive();
  }

  handleMouseOver(button: Phaser.GameObjects.Sprite) {
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
  handleMouseOut(button: Phaser.GameObjects.Sprite) {
    button.setScale(1);
  }
}
