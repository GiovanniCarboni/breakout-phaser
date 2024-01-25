import { createMenu } from "../components/UI/Menu";
import { Anims, Scenes, Sounds, Sprites } from "../constants";

export class GameOver extends Phaser.Scene {
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };

  constructor() {
    super({ key: Scenes.gameOver });
  }

  create() {
    this.cameras.main.setBackgroundColor("#000");

    this.sounds = {
      gameOver: this.sound.add(Sounds.gameOver, { loop: false }),
    };

    this.sounds.gameOver.play();

    this.initGameOverText();

    createMenu(
      this.scale.width / 2,
      this.scale.height / 2,
      [
        { label: "Restart", onClick: this.handleRestart, isMain: true },
        { label: "Back to Menu", onClick: this.handleBackToMenu },
      ],
      this
    );
  }

  handleRestart() {
    this.scene.stop(Scenes.game);
    this.scene.start(Scenes.game);
  }

  handleBackToMenu() {
    this.scene.stop(Scenes.game);
    this.scene.start(Scenes.start);
    this.scene.stop();
  }

  initGameOverText() {
    this.add
      .sprite(
        this.scale.width / 2,
        this.scale.height / 2 - 180,
        Sprites.gameOver
      )
      .play(Anims.gameOver);
  }
}
